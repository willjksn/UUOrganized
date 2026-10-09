import type { Metadata } from "next";
import { loginAction } from "../actions";
import { requestAdminResetAction } from "../reset/actions";
import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

const errors: Record<string, string> = {
  "1": "That email or password doesn’t match.",
  rate: "Too many tries. Wait a minute.",
  setup: "Admin login isn’t set up yet.",
  mail: "The reset email didn’t send. Try again in a minute.",
  save: "The reset didn’t save. Try again in a minute.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");
  const params = await searchParams;
  const error = params.error ? errors[params.error] || "Try again." : "";
  const sent = params.sent === "1";

  return (
    <section className="section">
      <div className="wrap narrow">
        <p className="eyebrow">Admin</p>
        <h1>Log in.</h1>
        <p>Add products, pictures, the brand’s social links, and the pages.</p>
        <form className="signup" action={loginAction}>
          <label className="field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              autoComplete="username"
              defaultValue="stormij@uuorganized.com"
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="button" type="submit">
            Log in
          </button>
        </form>
        {sent ? (
          <p>A reset link is on its way to the admin email. It works for 30 minutes.</p>
        ) : (
          <form className="signup" action={requestAdminResetAction}>
            <button className="button button-ghost" type="submit">
              Reset password
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
