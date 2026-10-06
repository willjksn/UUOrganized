"use client";

import { useState } from "react";
import { rewriteAnnouncementAction, sendAnnouncementAction } from "@/app/admin/actions";
import type { MailDraft } from "@/lib/drafts";

export function PendingNotes({ drafts, openId }: { drafts: MailDraft[]; openId?: string }) {
  const [open, setOpen] = useState(openId || "");

  if (!drafts.length) return null;

  return (
    <div className="note-list">
      {drafts.map((draft) => {
        const expanded = open === draft.id;
        const preview = draft.subject || "Not written yet";
        return (
          <article className={expanded ? "note-row note-row-open" : "note-row"} key={draft.id}>
            <button
              className="note-summary"
              type="button"
              aria-expanded={expanded}
              onClick={() => setOpen(expanded ? "" : draft.id)}
            >
              <strong>{draft.postTitle}</strong>
              <span>{preview}</span>
              <em>{expanded ? "Close" : "Open"}</em>
            </button>
            {expanded ? (
              <div className="note-body">
                <p className="fine">Write the note yourself, or click Write it. Nothing goes out until you send it. A web address on its own line becomes a link people can click.</p>
                <form action={rewriteAnnouncementAction}>
                  <input type="hidden" name="id" value={draft.id} />
                  <button className="button button-ghost" type="submit">
                    {draft.body ? "Write it again" : "Write it"}
                  </button>
                </form>
                <form action={sendAnnouncementAction}>
                  <input type="hidden" name="id" value={draft.id} />
                  <label className="field">
                    <span>Subject</span>
                    <input name="subject" required maxLength={140} defaultValue={draft.subject} placeholder="Something new" />
                  </label>
                  <label className="field">
                    <span>Message</span>
                    <textarea name="body" required maxLength={8000} rows={8} defaultValue={draft.body} placeholder="Write it the way you’d say it." />
                  </label>
                  <button className="button" type="submit" name="decision" value="send">
                    Send to everyone
                  </button>
                </form>
                <form action={sendAnnouncementAction}>
                  <input type="hidden" name="id" value={draft.id} />
                  <input type="hidden" name="decision" value="skip" />
                  <button className="button button-ghost" type="submit">
                    Don&apos;t send
                  </button>
                </form>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
