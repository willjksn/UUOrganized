import { addEmailAction, removeEmailAction } from "../../actions";
import type { DirectoryPerson } from "@/components/EmailDirectory";
import { LetterComposer } from "@/components/LetterComposer";
import { ListBucket } from "@/components/ListBucket";
import { PendingNotes } from "@/components/PendingNotes";
import { listPeople, type Person, type PersonSource } from "@/lib/audience";
import { listPending } from "@/lib/drafts";
import { resendReady } from "@/lib/email";

const sourceLabel: Record<PersonSource, string> = {
  checklist: "Checklist",
  download: "Free file",
  purchase: "Purchase",
  added: "Added",
};

export default async function LettersPage({
  searchParams,
}: {
  searchParams: Promise<{
    sent?: string;
    failed?: string;
    error?: string;
    added?: string;
    removed?: string;
    kept?: string;
    rewritten?: string;
    open?: string;
  }>;
}) {
  const params = await searchParams;
  const [people, pending] = await Promise.all([listPeople(), listPending()]);
  const onList = people.filter((person) => !person.unsubscribed).map(asDirectoryPerson);
  const offList = people.filter((person) => person.unsubscribed).map(asDirectoryPerson);

  return (
    <section className="section admin-main">
      <div className="wrap stack">
        <div className="admin-head">
          <div>
            <p className="eyebrow">The list</p>
            <h1>Emails</h1>
            <p className="fine">
              {onList.length} active. {offList.length} unsubscribed. Asking for a file or buying again moves an address back to active.
            </p>
          </div>
        </div>

        {params.sent ? (
          <p className="form-success">
            Sent to {params.sent}
            {params.failed ? `. ${params.failed} did not go through.` : "."}
          </p>
        ) : null}
        {params.added ? <p className="form-success">Added.</p> : null}
        {params.removed ? <p className="form-success">Taken off the list.</p> : null}
        {params.kept ? <p className="form-success">Left unsent.</p> : null}
        {params.rewritten ? <p className="form-success">Written. Read it before you send.</p> : null}
        {params.error ? (
          <p className="form-error" role="alert">
            {params.error}
          </p>
        ) : null}
        {resendReady() ? null : (
          <p className="fine">Sending needs Resend connected. You can still keep the list.</p>
        )}

        <ListBucket title="Active" count={onList.length}>
          {onList.length ? (
            <ul className="letter-people">
              {onList.map((person) => (
                <li key={person.email}>
                  <span className="letter-who">
                    {person.name ? <strong>{person.name}</strong> : null}
                    <span className="letter-email">{person.email}</span>
                  </span>
                  <span className="tag">{person.tag}</span>
                  <span className="fine">{person.joined}</span>
                  <form action={removeEmailAction}>
                    <input type="hidden" name="email" value={person.email} />
                    <button className="button button-ghost button-small" type="submit">
                      Unsubscribe
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="fine">Nobody is active yet.</p>
          )}
        </ListBucket>

        <ListBucket title="Unsubscribed" count={offList.length} muted>
          {offList.length ? (
            <ul className="letter-people">
              {offList.map((person) => (
                <li key={person.email}>
                  <span className="letter-who">
                    {person.name ? <strong>{person.name}</strong> : null}
                    <span className="letter-email">{person.email}</span>
                  </span>
                  <span className="tag">{person.tag}</span>
                  <span className="fine">{person.joined}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="fine">Nobody has left.</p>
          )}
        </ListBucket>

        <PendingNotes drafts={pending} openId={params.open} />

        <LetterComposer people={onList} />

        <form className="panel" action={addEmailAction}>
          <h2>Add someone</h2>
          <div className="admin-split">
            <label className="field">
              <span>Email</span>
              <input name="email" type="email" required maxLength={254} placeholder="name@email.com" />
            </label>
            <label className="field">
              <span>Name, optional</span>
              <input name="name" maxLength={120} />
            </label>
          </div>
          <button className="button" type="submit">
            Add to the list
          </button>
        </form>

      </div>
    </section>
  );
}

function asDirectoryPerson(person: Person): DirectoryPerson {
  return {
    email: person.email,
    name: person.name,
    tag: sourceLabel[person.source],
    joined: new Date(person.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" }),
  };
}
