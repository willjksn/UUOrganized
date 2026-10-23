import Link from "next/link";

export function BookToApp({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "book-app book-app-compact" : "book-app"}>
      <p className="book-line">The book teaches the system. The UUO Command Center is the digital version in testing.</p>
      {compact ? null : (
        <p>
          <em>Who the Hell Put Me in Charge?!</em> stays a book you can buy on its own. The UUO Command
          Center, by Unhinged. Unfiltered. Organized., is in private testing.
        </p>
      )}
      <p className="book-app-links">
        <Link href="/command-center#waitlist" data-cta="join-waitlist">Join the Command Center Waitlist</Link>
      </p>
    </div>
  );
}
