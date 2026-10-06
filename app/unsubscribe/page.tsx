import type { Metadata } from "next";
import { Brush } from "@/components/Brush";
import { validUnsubscribe } from "@/lib/audience";
import { confirmUnsubscribeAction } from "./actions";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; t?: string; done?: string; error?: string; mail?: string }>;
}) {
  const params = await searchParams;
  const email = params.e || "";
  const token = params.t || "";

  if (params.done === "1") {
    return (
      <section className="section privacy">
        <div className="wrap narrow">
          <p className="eyebrow">The list</p>
          <h1>You’re off the list.</h1>
          <Brush />
          <p>
            {params.mail === "1"
              ? "I sent a note to that address. It has a link if you want back on."
              : "I won’t send notes to that address. I couldn’t send the confirmation note."}
          </p>
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
          <p>Try the unsubscribe link from the email again.</p>
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
          <p>Open the unsubscribe link from the email again.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section privacy">
      <div className="wrap narrow">
        <p className="eyebrow">The list</p>
        <h1>Leave the list?</h1>
        <Brush />
        <p>
          Notes will stop for <strong>{email}</strong>. If you ask for a file later, this address is added again so I can send it.
        </p>
        <form action={confirmUnsubscribeAction}>
          <input type="hidden" name="e" value={email} />
          <input type="hidden" name="t" value={token} />
          <button className="button" type="submit">
            Yes, take me off
          </button>
        </form>
      </div>
    </section>
  );
}
