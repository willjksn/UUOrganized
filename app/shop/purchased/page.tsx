import type { Metadata } from "next";
import Link from "next/link";
import { fulfillPaidSession } from "@/lib/purchases";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Your download",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PurchasedPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId = "" } = await searchParams;
  const result = sessionId ? await fulfillPaidSession(sessionId) : { state: "missing" as const };

  if (result.state === "paid") {
    return (
      <section className="section">
        <div className="wrap narrow prose">
          <p className="eyebrow">Shop</p>
          <h1>It’s yours.</h1>
          <p>
            {result.ships
              ? `${result.name} is paid. I’ll ship it to the address from checkout.`
              : `${result.name} is ready.`}
            {result.emailed
              ? result.ships
                ? " A receipt is on the way to your inbox."
                : " A copy is on the way to your inbox."
              : result.ships
                ? ""
                : " Download it here."}
          </p>
          {result.ships ? null : (
            <p>
              <a className="button" href={`/api/purchase?session_id=${encodeURIComponent(sessionId)}`}>
                Download
              </a>
            </p>
          )}
          <p>
            <Link href="/shop">Back to the shop</Link>
          </p>
        </div>
      </section>
    );
  }

  const title = result.state === "nofile" ? "The payment went through." : "That payment isn’t here.";
  const detail =
    result.state === "nofile"
      ? `The file isn’t ready to send yet. Email ${site.email} and I’ll get it to you.`
      : result.state === "unpaid" || result.state === "error"
        ? "If you just paid, wait a moment and refresh this page."
        : "This link doesn’t match a paid download.";

  return (
    <section className="section">
      <div className="wrap narrow prose">
        <p className="eyebrow">Shop</p>
        <h1>{title}</h1>
        <p>{detail}</p>
        <p>
          <Link className="button" href="/shop">
            Back to the shop
          </Link>
        </p>
      </div>
    </section>
  );
}
