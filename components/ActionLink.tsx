import Link from "next/link";
import { isAppHref } from "@/lib/app-links";

export function ActionLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (!href) return null;
  if (href.startsWith("http")) {
    if (isAppHref(href)) {
      return (
        <a className={className} href={href}>
          {children}
        </a>
      );
    }
    return (
      <a
        className={className}
        href={href}
        target="_blank"
        rel={href.includes("amazon.com") ? "sponsored noreferrer" : "noreferrer"}
      >
        {children}
      </a>
    );
  }
  if (href.startsWith("#")) {
    return (
      <a className={className} href={href}>
        {children}
      </a>
    );
  }
  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}
