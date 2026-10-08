import Link from "next/link";
import { signupHref } from "@/lib/app-links";

export function BookToApp({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "book-app book-app-compact" : "book-app"}>
      <p className="book-line">The book teaches the system. The app helps you run it.</p>
      {compact ? null : (
        <p>
          <em>Who the Hell Put Me in Charge?!</em> stays a book you can buy on its own. The Caregiver
          Command Center is the digital tool inspired by that caregiving system.
        </p>
      )}
      <p className="book-app-links">
        <Link href="/command-center" data-cta="explore-command-center">Explore the Command Center</Link>
        <a href={signupHref("free")} data-cta="start-free">Try the Caregiver Command Center Free</a>
      </p>
    </div>
  );
}
