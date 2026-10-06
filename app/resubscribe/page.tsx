import type { Metadata } from "next";
import { Brush } from "@/components/Brush";
import { validUnsubscribe } from "@/lib/audience";
import { confirmResubscribeAction } from "./actions";

export const metadata: Metadata = {
  title: "Resubscribe",
  robots: { index: false, follow: false },
};

export default async function ResubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; t?: string; done?: string; error?: string }>;
}) {
  const params = await searchParams;
  const email = params.e || "";
  const token = params.t || "";

  if (params.done === "1") {
    return (
      <section className="section privacy">
        <div className="wrap narrow">
          <p className="eyebrow">The list</p>
          <h1>You’re back on the list.</h1>
          <Brush />
          <p>Notes can come to that address again.</p>
        </div>
      </section>
    );
  }

  if (params.error === "save") {
    return (
      <section className="section privacy">
        <div className="wrap narrow">
          <p className="eyebrow">The list</p>
          <h1>That didn’t save.</h1>
          <Brush />
          <p>Open the link in the email and try again.</p>
        </div>
      </section>
    );
  }

  if (!validUnsubscribe(email, token)) {
    return (
      <section className="section privacy">
        <div className="wrap narrow">
          <p className="eyebrow">The list</p>
          <h1>That link doesn’t work.</h1>
          <Brush />
          <p>Open the link in the email again.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section privacy">
      <div className="wrap narrow">
        <p className="eyebrow">The list</p>
        <h1>Get the notes again?</h1>
        <Brush />
        <p>
          This puts <strong>{email}</strong> back on the list.
        </p>
        <form action={confirmResubscribeAction}>
          <input type="hidden" name="e" value={email} />
          <input type="hidden" name="t" value={token} />
          <button className="button" type="submit">
            Yes, add me back
          </button>
        </form>
      </div>
    </section>
  );
}
