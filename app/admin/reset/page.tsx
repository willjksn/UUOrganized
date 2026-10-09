import type { Metadata } from "next";
import Link from "next/link";
import { validPasswordReset } from "@/lib/admin-password";
import { saveAdminPasswordAction } from "./actions";

export const metadata: Metadata = {
  title: "Reset admin password",
  robots: { index: false, follow: false },
};

const errors: Record<string, string> = {
  short: "Use at least 10 characters.",
  match: "Those passwords don’t match.",
  save: "That didn’t save. Ask for a new link.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; error?: string }>;
}) {
  const params = await searchParams;
  const token = params.t || "";
  const valid = token ? await validPasswordReset(token) : false;

  if (!valid) {
    return (
      <section className="section">
        <div className="wrap narrow">
          <p className="eyebrow">Admin</p>
          <h1>That link doesn’t work.</h1>
          <p>It may have expired. Reset links last 30 minutes, and only the newest one works.</p>
          <p>
            <Link href="/admin/login">Back to log in</Link>
          </p>
        </div>
      </section>
    );
  }

  const error = params.error ? errors[params.error] || "Try again." : "";

  return (
    <section className="section">
      <div className="wrap narrow">
        <p className="eyebrow">Admin</p>
        <h1>Choose a new password.</h1>
        <p>Use at least 10 characters. This replaces the password you log in with.</p>
        <form className="signup" action={saveAdminPasswordAction}>
          <input type="hidden" name="token" value={token} />
          <label className="field">
            <span>New password</span>
            <input name="password" type="password" autoComplete="new-password" minLength={10} required />
          </label>
          <label className="field">
            <span>Type it again</span>
            <input name="confirm" type="password" autoComplete="new-password" minLength={10} required />
          </label>
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="button" type="submit">
            Save password
          </button>
        </form>
      </div>
    </section>
  );
}
