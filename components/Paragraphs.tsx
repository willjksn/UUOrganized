import { paragraphs } from "@/lib/copy";

export function Paragraphs({ text }: { text: string }) {
  return paragraphs(text).map((paragraph) => <p key={paragraph}>{paragraph}</p>);
}
