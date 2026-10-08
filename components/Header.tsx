"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { loginHref } from "@/lib/app-links";
import { publicNav } from "@/lib/nav";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/" className="brand" aria-label="Unhinged. Unfiltered. Organized home">
          <Image src="/images/logo-symbol.png" alt="" width={870} height={456} priority />
          <span className="brand-name">Unhinged. Unfiltered. Organized.</span>
        </Link>
        <div className="header-end">
          <nav id="site-nav" className={open ? "nav open" : "nav"} aria-label="Main">
            <ul className="nav-list">
              {publicNav.map((link) => {
                const current = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <li key={link.href}>
                    <Link href={link.href} aria-current={current ? "page" : undefined}>
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              <li>
                <a href={loginHref} data-cta="login">Log In</a>
              </li>
            </ul>
          </nav>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
    </header>
  );
}
