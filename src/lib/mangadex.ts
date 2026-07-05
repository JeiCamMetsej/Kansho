const MANGADEX_API = "https://api.mangadex.org";
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 1000;

export interface MangaDexManga {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  year: number | null;
  tags: string[];
}

interface MangaDexResponse {
  data: Array<{
    id: string;
    attributes: {
      title: Record<string, string>;
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
    return `https://uploads.mangadex.org/covers/${mangaId}/${coverArt.attributes.fileName}.512.jpg`;
  }
  return "";
}

function extractTitle(title: Record<string, string>): string {
  return title.en || title["ja-ro"] || title.ja || Object.values(title)[0] || "Untitled";
}

function extractDescription(description: Record<string, string>): string {
  const raw =
    description.en ||
    Object.values(description).find((d) => d.length > 0) ||
    "";
  return stripHtml(raw);
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "MangaReel/1.0",
      },
    });

    if (res.ok) return res;

    if (res.status === 429 && attempt < retries - 1) {
      const retryAfter = res.headers.get("Retry-After");
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : BASE_RETRY_DELAY * (attempt + 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }

    throw new Error(`MangaDex API error: ${res.status}`);
  }

  throw new Error("MangaDex API max retries exceeded");
}

function processMangaItem(
  item: MangaDexResponse["data"][0]
): MangaDexManga {
  return {
    id: item.id,
    title: extractTitle(item.attributes.title),
    description: extractDescription(item.attributes.description),
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
  offset: number = 0
): Promise<{ manga: MangaDexManga[]; total: number }> {
  const url = `${MANGADEX_API}/manga?includes[]=cover_art&includes[]=author&limit=${limit}&offset=${offset}&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive&availableTranslatedLanguage[]=en`;

  const res = await fetchWithRetry(url);
  const data: MangaDexResponse = await res.json();

  return {
    manga: data.data.map(processMangaItem),
    total: data.total,
  };
}

export async function fetchMangaById(
  id: string
): Promise<MangaDexManga | null> {
  const url = `${MANGADEX_API}/manga/${id}?includes[]=cover_art&includes[]=author`;

  try {
    const res = await fetchWithRetry(url);
    const data: { data: MangaDexResponse["data"][0] } = await res.json();
    return processMangaItem(data.data);
  } catch (err) {
    if (err instanceof Error && err.message.includes("404")) return null;
    throw err;
  }
}

export async function searchManga(
  query: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ manga: MangaDexManga[]; total: number }> {
  const url = `${MANGADEX_API}/manga?includes[]=cover_art&includes[]=author&limit=${limit}&offset=${offset}&title=${encodeURIComponent(query)}&contentRating[]=safe&contentRating[]=suggestive&availableTranslatedLanguage[]=en`;

  const res = await fetchWithRetry(url);
  const data: MangaDexResponse = await res.json();

  return {
    manga: data.data.map(processMangaItem),
    total: data.total,
  };
}
