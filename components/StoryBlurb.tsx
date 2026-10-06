"use client";

import { useState } from "react";
import { paragraphs } from "@/lib/copy";

const previewCount = 2;

export function StoryBlurb({ text, moreLabel }: { text: string; moreLabel: string }) {
  const parts = paragraphs(text);
  const [open, setOpen] = useState(false);
  const canFold = parts.length > previewCount;
  const shown = open || !canFold ? parts : parts.slice(0, previewCount);

  return (
    <>
      {shown.map((paragraph, index) => (
        <p key={`${index}-${paragraph}`}>{paragraph}</p>
      ))}
      {canFold ? (
        <button className="text-link" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {open ? "Show less" : moreLabel || "Read the story"}
        </button>
      ) : null}
    </>
  );
}
