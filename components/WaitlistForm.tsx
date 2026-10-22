"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export function WaitlistForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "duplicate" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          company: data.get("company"),
          updates: data.get("updates"),
        }),
      });
      const json = (await response.json().catch(() => ({}))) as { error?: string; duplicate?: boolean };

      if (!response.ok) {
        setStatus("error");
        setMessage(json.error || "That didn’t go through. Try again in a minute.");
        return;
      }

      if (json.duplicate) {
        setStatus("duplicate");
        return;
      }

      setStatus("done");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("That didn’t go through. Check your connection and try again.");
    }
  }

  if (status === "done") {
    return (
      <div className="form-success" role="status">
        <p>You’re on the list. We’ll email this address about the UUO Command Center.</p>
      </div>
    );
  }

  if (status === "duplicate") {
    return (
      <div className="form-success" role="status">
        <p>That address is already on the Command Center waitlist.</p>
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
      <label className="consent">
        <input name="updates" type="checkbox" value="on" />
        <span>Also send occasional notes about books and printables. Optional, and not checked for you.</span>
      </label>
      {status === "error" ? (
        <p className="form-error" role="alert">
          {message}
        </p>
      ) : null}
      <button className="button" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Joining…" : "Join the Command Center Waitlist"}
      </button>
      <p className="fine">
        This is for product updates only. Don’t send health information.{" "}
        <Link href="/shop/privacy">Privacy note</Link>
      </p>
    </form>
  );
}
