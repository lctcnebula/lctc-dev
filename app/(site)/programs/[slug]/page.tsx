import type { Metadata } from "next";
import ProgramDetail from "@/components/ProgramDetail";
import { readCollection } from "@/lib/server/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = (await readCollection("programs", null)).find(x => x.slug === slug);
  return p ? { title: p.name, description: p.summary } : { title: "Program" };
}

export default async function ProgramPage({ params }: Props) {
  const { slug } = await params;
  return <ProgramDetail slug={slug} />;
}
