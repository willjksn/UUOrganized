"use server";

import { redirect } from "next/navigation";
import { unsubscribe, validUnsubscribe } from "@/lib/audience";
import { sendUnsubscribed } from "@/lib/email";

export async function confirmUnsubscribeAction(formData: FormData) {
  const email = String(formData.get("e") || "");
  const token = String(formData.get("t") || "");
  if (!validUnsubscribe(email, token)) redirect("/unsubscribe?error=1");
  const saved = await unsubscribe(email);
  if (!saved) redirect("/unsubscribe?error=save");
  const mailed = await sendUnsubscribed(email);
  redirect(mailed ? "/unsubscribe?done=1&mail=1" : "/unsubscribe?done=1&mail=0");
}
