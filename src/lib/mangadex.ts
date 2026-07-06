const MANGADEX_API = "https://api.mangadex.org";
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 1000;

export type MangaLanguage = string;

export interface MangaDexManga {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  year: number | null;
  tags: string[];
}

export interface MangaDexTag {
  id: string;
  name: string;
  group: "genre" | "theme" | "format";
}

interface MangaDexResponse {
  data: Array<{
    id: string;
    attributes: {
      title: Record<string, string>;
      altTitles: Record<string, string>[];
      description: Record<string, string>;
      year: number | null;
      tags: Array<{
        id: string;
        attributes: {
          name: Record<string, string>;
          group: string;
        };
      }>;
    };
    relationships: Array<{
      id: string;
      type: string;
      attributes?: {
        fileName?: string;
      };
    }>;
  }>;
  total: number;
  limit: number;
  offset: number;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function extractCoverUrl(
  mangaId: string,
  relationships: MangaDexResponse["data"][0]["relationships"]
): string {
  const coverArt = relationships.find((r) => r.type === "cover_art");
  if (coverArt?.attributes?.fileName) {
    // Use the raw fileName (UUID without extension) — the proxy adds the .512.jpg suffix
    const fileName = coverArt.attributes.fileName.replace(/\.\w+$/, "");
    return `/api/proxy/cover/${mangaId}/${fileName}`;
  }
  return "";
}

function extractFromAltTitles(
  altTitles: Record<string, string>[],
  lang: string
): string | undefined {
  for (const entry of altTitles) {
    if (entry[lang]) return entry[lang];
  }
  return undefined;
}

function extractTitle(
  title: Record<string, string>,
  altTitles: Record<string, string>[],
  lang: string = "en"
): string {
  // 1. Selected language from primary title
  if (title[lang]) return title[lang];
  // 2. English from primary title
  if (title.en) return title.en;
  // 3. Selected language from alt titles
  const altLang = extractFromAltTitles(altTitles, lang);
  if (altLang) return altLang;
  // 4. English from alt titles
  const altEn = extractFromAltTitles(altTitles, "en");
  if (altEn) return altEn;
  // 5. Any romanized title (ja-ro, ko-ro, zh-ro, etc.) from primary or alt
  for (const source of [title, ...altTitles]) {
    for (const key of Object.keys(source)) {
      if (key.endsWith("-ro")) return source[key];
    }
  }
  // 6. Any title containing Latin characters
  for (const source of [title, ...altTitles]) {
    for (const val of Object.values(source)) {
      if (/[a-zA-Z]/.test(val)) return val;
    }
  }
  // 7. First available
  return Object.values(title)[0] || "Untitled";
}

function extractDescription(
  description: Record<string, string>,
  lang: string = "en"
): string {
  const raw =
    description[lang] ||
    description.en ||
    Object.values(description).find((d) => d.length > 0) ||
    "";
  return stripHtml(raw);
}

export async function fetchTags(): Promise<MangaDexTag[]> {
  const url = `${MANGADEX_API}/manga/tag`;
  const res = await fetchWithRetry(url);
  const data: {
    data: Array<{
      id: string;
      attributes: {
        name: Record<string, string>;
        group: string;
      };
    }>;
  } = await res.json();

  return data.data
    .filter((t) => t.attributes.group === "genre" || t.attributes.group === "theme")
    .map((t) => ({
      id: t.id,
      name: t.attributes.name.en || Object.values(t.attributes.name)[0] || "",
      group: t.attributes.group as "genre" | "theme",
    }))
    .filter((t) => t.name)
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchWithRetry(
  url: string,
  retries = MAX_RETRIES
): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Kansho/1.0",
      },
    });

    if (res.ok) return res;

    if (res.status === 429 && attempt < retries - 1) {
      const retryAfter = res.headers.get("Retry-After");
      const delay = retryAfter
        ? parseInt(retryAfter) * 1000
        : BASE_RETRY_DELAY * (attempt + 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }

    throw new Error(`MangaDex API error: ${res.status}`);
  }

  throw new Error("MangaDex API max retries exceeded");
}

function processMangaItem(
  item: MangaDexResponse["data"][0],
  lang: string = "en"
): MangaDexManga {
  return {
    id: item.id,
    title: extractTitle(item.attributes.title, item.attributes.altTitles, lang),
    description: extractDescription(item.attributes.description, lang),
    coverUrl: extractCoverUrl(item.id, item.relationships),
    year: item.attributes.year,
    tags: item.attributes.tags
      .filter(
        (t) =>
          t.attributes.group === "genre" || t.attributes.group === "theme"
      )
      .map(
        (t) =>
          t.attributes.name.en ||
          Object.values(t.attributes.name)[0] ||
          ""
      )
      .filter(Boolean),
  };
}

export async function fetchMangaList(
  limit: number = 20,
  offset: number = 0,
  lang: string = "en",
  includedTags: string[] = []
): Promise<{ manga: MangaDexManga[]; total: number }> {
  let url = `${MANGADEX_API}/manga?includes[]=cover_art&includes[]=author&limit=${limit}&offset=${offset}&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive&availableTranslatedLanguage[]=${lang}`;

  if (includedTags.length > 0) {
    url += includedTags.map((id) => `&includedTags[]=${encodeURIComponent(id)}`).join("");
    url += "&includedTagsMode=AND";
  }

  const res = await fetchWithRetry(url);
  const data: MangaDexResponse = await res.json();

  return {
    manga: data.data.map((item) => processMangaItem(item, lang)),
    total: data.total,
  };
}

export async function fetchMangaById(
  id: string,
  lang: string = "en"
): Promise<MangaDexManga | null> {
  const url = `${MANGADEX_API}/manga/${id}?includes[]=cover_art&includes[]=author`;

  try {
    const res = await fetchWithRetry(url);
    const data: { data: MangaDexResponse["data"][0] } = await res.json();
    return processMangaItem(data.data, lang);
  } catch (err) {
    if (err instanceof Error && err.message.includes("404")) return null;
    throw err;
  }
}

export async function searchManga(
  query: string,
  limit: number = 20,
  offset: number = 0,
  lang: string = "en",
  includedTags: string[] = []
): Promise<{ manga: MangaDexManga[]; total: number }> {
  let url = `${MANGADEX_API}/manga?includes[]=cover_art&includes[]=author&limit=${limit}&offset=${offset}&title=${encodeURIComponent(query)}&contentRating[]=safe&contentRating[]=suggestive&availableTranslatedLanguage[]=${lang}&order[followedCount]=desc`;

  if (includedTags.length > 0) {
    url += includedTags.map((id) => `&includedTags[]=${encodeURIComponent(id)}`).join("");
    url += "&includedTagsMode=AND";
  }

  const res = await fetchWithRetry(url);
  const data: MangaDexResponse = await res.json();

  return {
    manga: data.data.map((item) => processMangaItem(item, lang)),
    total: data.total,
  };
}
