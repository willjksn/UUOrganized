import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "../actions";
import { AdminNav } from "@/components/AdminNav";
import { EmojiDock } from "@/components/EmojiDock";
import { isAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="admin">
      <div className="admin-bar">
        <div className="wrap admin-bar-inner">
          <AdminNav />
          <Link className="admin-site" href="/">
            View site
          </Link>
          <form action={logoutAction}>
            <button className="button button-ghost button-small" type="submit">
              Log out
            </button>
          </form>
        </div>
      </div>
      {children}
      <EmojiDock />
    </div>
  );
}
