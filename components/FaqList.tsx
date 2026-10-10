"use client";

import { useId, useState } from "react";
import type { FaqItem } from "@/lib/faq";

export function FaqList({ items }: { items: FaqItem[] }) {
  const reactId = useId();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setOpen((current) => ({ ...current, [id]: !current[id] }));
  }

  return (
    <div className="faq-list">
      {items.map((item) => {
        const expanded = Boolean(open[item.id]);
        const buttonId = `${reactId}-${item.id}-button`;
        const panelId = `${reactId}-${item.id}-panel`;
        return (
          <article key={item.id} className="faq-item" data-faq={item.id}>
            <h3>
              <button
                type="button"
                id={buttonId}
                className="faq-trigger"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
              >
                <span>{item.question}</span>
                <span className="faq-mark" aria-hidden="true">
                  {expanded ? "–" : "+"}
                </span>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!expanded} className="faq-panel">
              {item.answer.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}
