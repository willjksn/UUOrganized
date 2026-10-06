"use client";

import { useRef, useState } from "react";
import { draftLetterAction, sendLetterAction } from "@/app/admin/actions";
import { EmailDirectory, type DirectoryPerson } from "./EmailDirectory";

export function LetterComposer({ people }: { people: DirectoryPerson[] }) {
  const promptRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [writing, setWriting] = useState(false);
  const [notice, setNotice] = useState("");

  async function writeIt() {
    const request = promptRef.current?.value || "";
    setWriting(true);
    setNotice("");
    const result = await draftLetterAction(request);
    setWriting(false);
    if ("error" in result) {
      setNotice(result.error);
      return;
    }
    if (subjectRef.current) subjectRef.current.value = result.subject;
    if (bodyRef.current) bodyRef.current.value = result.body;
    setNotice("Written. Change anything you want before you send.");
  }

  return (
    <form className="panel letter-form" action={sendLetterAction}>
      <h2>Write a note</h2>
      <p className="fine">Write it yourself in the boxes below, or say what it should say and click Write it.</p>
      <div className="writer-row">
        <label className="field">
          <span>What should this say?</span>
          <input ref={promptRef} type="text" maxLength={1000} placeholder="A short note about the new checklist" />
        </label>
        <button className="button button-ghost" type="button" onClick={writeIt} disabled={writing}>
          {writing ? "Writing…" : "Write it"}
        </button>
      </div>
      {notice ? <p className="fine">{notice}</p> : null}
      <label className="field">
        <span>Subject</span>
        <input ref={subjectRef} name="subject" required maxLength={140} placeholder="Something new" />
      </label>
      <label className="field">
        <span>Message</span>
        <textarea ref={bodyRef} name="body" required maxLength={8000} rows={8} placeholder="Write it the way you’d say it." />
      </label>
      <p className="fine">Leave a blank line between paragraphs. An unsubscribe link is added at the bottom.</p>
      <label className="field">
        <span>Picture or video, optional</span>
        <input name="media" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov" />
      </label>
      <p className="fine">A picture shows in the note. A video is a watch link, because inboxes can’t play the file itself.</p>

      <label className="check">
        <input type="checkbox" name="everyone" value="yes" />
        Send to everyone on the list
      </label>

      <EmailDirectory people={people} mode="pick" />

      <button className="button" type="submit">
        Send
      </button>
    </form>
  );
}
