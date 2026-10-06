import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap narrow prose">
        <p className="eyebrow">404</p>
        <h1>This page wandered off.</h1>
        <p>The tools are still in the shop.</p>
        <Link className="button" href="/shop">
          Shop the Tools
        </Link>
      </div>
    </section>
  );
}
