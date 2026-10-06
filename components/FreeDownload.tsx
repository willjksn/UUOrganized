"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export function FreeDownload({
  slug,
  name,
  label,
}: {
  slug: string;
  name: string;
  label: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          company: data.get("company"),
          slug,
        }),
      });
      const json = (await response.json().catch(() => ({}))) as { error?: string; emailed?: boolean };

      if (!response.ok) {
        setStatus("error");
        setMessage(json.error || "That didn’t go through. Try again in a minute.");
        return;
      }

      setStatus("done");
      setMessage(
        json.emailed
          ? `It’s yours. ${name} is downloading, and a copy is on the way to your inbox.`
          : `It’s yours. ${name} is downloading now.`,
      );

      const link = document.createElement("a");
      link.href = `/api/free?slug=${encodeURIComponent(slug)}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setStatus("error");
      setMessage("That didn’t go through. Check your connection and try again.");
    }
  }

  if (status === "done") {
    return (
      <div className="form-success" role="status">
        <p>{message}</p>
        <a className="button" href={`/api/free?slug=${encodeURIComponent(slug)}`}>
          Download again
        </a>
      </div>
    );
  }

  return (
    <form className="signup" onSubmit={onSubmit}>
      <div className="hp" aria-hidden="true">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="field">
        <span>Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          maxLength={254}
          placeholder="you@email.com"
        />
      </label>
      {status === "error" ? (
        <p className="form-error" role="alert">
          {message}
        </p>
      ) : null}
      <button className="button" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : label || "Send me the file"}
      </button>
      <p className="fine">
        The file downloads here, and a copy goes to this email. <Link href="/privacy">Privacy note</Link>
      </p>
    </form>
  );
}
