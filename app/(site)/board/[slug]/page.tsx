import type { Metadata } from "next";
import BoardProfile from "@/components/BoardProfile";
import { readCollection } from "@/lib/server/data";
import { boardSlug } from "@/lib/slug";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const m = (await readCollection("board", null)).find(x => boardSlug(x) === slug);
  return m ? { title: m.name, description: `${m.name}, ${m.role} of the Lake County Tech Campus Foundation.` } : { title: "Board member" };
}

export default async function BoardMemberPage({ params }: Props) {
  const { slug } = await params;
  return <BoardProfile slug={slug} />;
}
