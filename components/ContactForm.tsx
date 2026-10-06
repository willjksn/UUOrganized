"use client";

import { FormEvent, useState } from "react";

export function ContactForm({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          company: data.get("company"),
        }),
      });
      const json = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setStatus("error");
        setMessage(json.error || `That didn’t send. Email ${email} instead.`);
        return;
      }

      setStatus("done");
      form.reset();
    } catch {
      setStatus("error");
      setMessage(`That didn’t send. Email ${email} instead.`);
    }
  }

  if (status === "done") {
    return (
      <div className="form-success" role="status">
        <p>Got it. I’ll read it.</p>
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
        <span>Name</span>
        <input name="name" type="text" autoComplete="name" required maxLength={120} />
      </label>
      <label className="field">
        <span>Email</span>
        <input name="email" type="email" autoComplete="email" inputMode="email" required maxLength={254} />
      </label>
      <label className="field">
        <span>Message</span>
        <textarea name="message" required maxLength={4000} rows={6} />
      </label>
      {status === "error" ? (
        <p className="form-error" role="alert">
          {message}
        </p>
      ) : null}
      <button className="button" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
