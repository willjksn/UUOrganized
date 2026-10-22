"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { professionalCategories } from "@/lib/inquiries";

export function ProfessionalForm({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/professionals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          organization: data.get("organization"),
          role: data.get("role"),
          category: data.get("category"),
          message: data.get("message"),
          noHealthData: data.get("noHealthData"),
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
        <p>Got it. I’ll reply about the books or printables.</p>
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
        <span>Work email</span>
        <input name="email" type="email" autoComplete="email" inputMode="email" required maxLength={254} />
      </label>
      <label className="field">
        <span>Organization</span>
        <input name="organization" type="text" autoComplete="organization" required maxLength={160} />
      </label>
      <label className="field">
        <span>Role, optional</span>
        <input name="role" type="text" autoComplete="organization-title" maxLength={120} />
      </label>
      <label className="field">
        <span>What do you need?</span>
        <select name="category" required defaultValue="">
          <option value="" disabled>
            Choose one
          </option>
          {professionalCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Message</span>
        <textarea
          name="message"
          required
          maxLength={2000}
          rows={6}
          placeholder="What you need, and who it’s for. No patient names, medication lists, or health records."
        />
      </label>
      <label className="consent">
        <input name="noHealthData" type="checkbox" value="on" required />
        <span>This inquiry does not include patient names, medication lists, or health records.</span>
      </label>
      {status === "error" ? (
        <p className="form-error" role="alert">
          {message}
        </p>
      ) : null}
      <button className="button" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Request Book Information"}
      </button>
      <p className="fine">
        We’ll use this to reply. It is not added to a marketing list. <Link href="/shop/privacy">Privacy note</Link>
      </p>
    </form>
  );
}
