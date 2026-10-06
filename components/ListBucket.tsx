"use client";

import { useState, type ReactNode } from "react";

export function ListBucket({
  title,
  count,
  muted,
  children,
}: {
  title: string;
  count: number;
  muted?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className={muted ? "panel bucket-off" : "panel"}>
      <div className="bucket-head">
        <h2>
          {title}
          <span className="bucket-count">{count}</span>
        </h2>
        <button
          className="button button-ghost button-small"
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>
      {open ? children : null}
    </section>
  );
}
