"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { addEmailAction, removeEmailAction } from "@/app/admin/actions";

export type DirectoryPerson = {
  email: string;
  name: string;
  tag: string;
  joined: string;
};

const PAGE = 20;

export function EmailDirectory({
  people,
  mode,
}: {
  people: DirectoryPerson[];
  mode: "pick" | "restore";
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(PAGE);
  const [picked, setPicked] = useState<string[]>([]);

  const q = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!q) return people;
    return people.filter(
      (person) => person.email.toLowerCase().includes(q) || person.name.toLowerCase().includes(q),
    );
  }, [people, q]);

  const looking = open || Boolean(q);
  const visible = looking ? matches.slice(0, shown) : [];
  const visibleEmails = new Set(visible.map((person) => person.email));

  function toggle(email: string) {
    setPicked((current) => (current.includes(email) ? current.filter((item) => item !== email) : [...current, email]));
  }

  return (
    <div className="email-finder">
      <div className="email-finder-bar">
        <button
          className="button button-ghost button-small"
          type="button"
          onClick={() => {
            setOpen((value) => !value);
            setShown(PAGE);
          }}
        >
          {open ? "Hide emails" : `Show emails${people.length ? ` (${people.length})` : ""}`}
        </button>
        <label className="field email-search">
          <span>Search</span>
          <input
            type="search"
            value={query}
            placeholder="Name or email"
            onChange={(event) => {
              setQuery(event.target.value);
              setShown(PAGE);
            }}
          />
        </label>
      </div>

      {people.length === 0 ? (
        <p className="fine">When someone joins, search or show the list to pick who gets the note.</p>
      ) : !looking ? (
        <p className="fine">
          {mode === "pick"
            ? "Addresses stay hidden until you search or show them. Tick the ones you want, or send to everyone."
            : "These addresses stay hidden until you search or show them."}
        </p>
      ) : matches.length === 0 ? (
        <p className="fine">No match for that.</p>
      ) : (
        <>
          <p className="fine">
            Showing {visible.length} of {matches.length}.
            {mode === "pick" && picked.length ? ` ${picked.length} picked.` : ""}
          </p>
          <ul className="letter-people">
            {visible.map((person) => (
              <li key={person.email}>
                {mode === "pick" ? (
                  <label className="check">
                    <input
                      type="checkbox"
                      name="to"
                      value={person.email}
                      checked={picked.includes(person.email)}
                      onChange={() => toggle(person.email)}
                    />
                    <span className="letter-who">
                      {person.name ? <strong>{person.name}</strong> : null}
                      <span className="letter-email">{person.email}</span>
                    </span>
                  </label>
                ) : (
                  <span className="letter-who">
                    {person.name ? <strong>{person.name}</strong> : null}
                    <span className="letter-email">{person.email}</span>
                  </span>
                )}
                {mode === "pick" ? <span className="tag">{person.tag}</span> : null}
                <span className="fine">{person.joined}</span>
                {mode === "pick" ? (
                  <button className="button button-ghost button-small" type="submit" form={dropId(person.email)}>
                    Remove
                  </button>
                ) : (
                  <form action={addEmailAction}>
                    <input type="hidden" name="email" value={person.email} />
                    <input type="hidden" name="name" value={person.name} />
                    <button className="button button-ghost button-small" type="submit">
                      Add back
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
          {shown < matches.length ? (
            <button className="button button-ghost button-small" type="button" onClick={() => setShown((count) => count + PAGE)}>
              Show more ({matches.length - shown} left)
            </button>
          ) : null}
        </>
      )}

      {mode === "pick"
        ? picked
            .filter((email) => !visibleEmails.has(email))
            .map((email) => <input key={email} type="hidden" name="to" value={email} />)
        : null}

      {mode === "pick" && typeof document !== "undefined"
        ? createPortal(
            <>
              {visible.map((person) => (
                <form id={dropId(person.email)} action={removeEmailAction} key={person.email} hidden>
                  <input type="hidden" name="email" value={person.email} />
                </form>
              ))}
            </>,
            document.body,
          )
        : null}
    </div>
  );
}

function dropId(email: string) {
  return `drop-${encodeURIComponent(email)}`;
}
