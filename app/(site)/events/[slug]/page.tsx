import type { Metadata } from "next";
import EventDetail from "@/components/EventDetail";
import { readCollection } from "@/lib/server/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const e = (await readCollection("events", null)).find(x => x.slug === slug);
  return e ? { title: e.title, description: e.summary } : { title: "Event" };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  return <EventDetail slug={slug} />;
}
