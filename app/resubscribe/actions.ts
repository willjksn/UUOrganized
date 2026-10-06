"use server";

import { redirect } from "next/navigation";
import { addPerson, validUnsubscribe } from "@/lib/audience";

export async function confirmResubscribeAction(formData: FormData) {
  const email = String(formData.get("e") || "");
  const token = String(formData.get("t") || "");
  if (!validUnsubscribe(email, token)) redirect("/resubscribe?error=1");
  const saved = await addPerson({ email, source: "added" });
  if (!saved) redirect("/resubscribe?error=save");
  redirect("/resubscribe?done=1");
}
