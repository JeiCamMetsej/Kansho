import MangaDetail from "@/components/MangaDetail";

export default async function MangaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MangaDetail id={id} />;
}
