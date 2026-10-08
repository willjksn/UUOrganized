"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export function EmailSignup({
  buttonLabel = "Send me the checklist",
  note = "New printables and the occasional discount go to this list first.",
}: {
  buttonLabel?: string;
  note?: string;
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
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          company: data.get("company"),
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
          ? "It’s yours. The file is downloading, and a copy is on the way to your inbox."
          : "It’s yours. The file is downloading now.",
      );

      const link = document.createElement("a");
      link.href = "/api/download";
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
        <a className="button" href="/api/download">
          Download again
        </a>
      </div>
    );
  }

  return (
    <form className="signup" onSubmit={onSubmit} noValidate={false}>
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
        {status === "loading" ? "Sending…" : buttonLabel}
      </button>
      <p className="fine">
        {note ? <>{note} </> : null}
        <Link href="/shop/privacy">Privacy note</Link>
      </p>
    </form>
  );
}
