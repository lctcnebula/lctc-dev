import type { Metadata } from "next";
import BoardProfile from "@/components/BoardProfile";
import { seed } from "@/lib/seed";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const m = seed.board.find(x => x.slug === slug);
  return m ? { title: m.name, description: `${m.name}, ${m.role} of the Lake County Tech Campus Foundation.` } : { title: "Board member" };
}

export default async function BoardMemberPage({ params }: Props) {
  const { slug } = await params;
  return <BoardProfile slug={slug} />;
}
