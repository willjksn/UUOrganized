"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    href: "/admin",
    label: "Products",
    active: (path: string) => path === "/admin" || path.startsWith("/admin/products"),
  },
  {
    href: "/admin/orders",
    label: "Orders",
    active: (path: string) => path.startsWith("/admin/orders"),
  },
  {
    href: "/admin/emails",
    label: "Emails",
    active: (path: string) => path.startsWith("/admin/emails"),
  },
  {
    href: "/admin/blog",
    label: "Blog",
    active: (path: string) => path.startsWith("/admin/blog"),
  },
  {
    href: "/admin/pages",
    label: "Pages",
    active: (path: string) => path.startsWith("/admin/pages"),
  },
];

export function AdminNav() {
  const path = usePathname();

  return (
    <nav className="admin-nav" aria-label="Admin">
      {links.map((link) => (
        <Link key={link.href} href={link.href} aria-current={link.active(path) ? "page" : undefined}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
