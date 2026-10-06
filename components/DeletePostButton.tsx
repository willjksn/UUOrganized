"use client";

import { useFormStatus } from "react-dom";
import { deletePostAction } from "@/app/admin/actions";

function RemoveButton() {
  const { pending } = useFormStatus();
  return (
    <button className="button button-ghost button-small" type="submit" disabled={pending}>
      {pending ? "Removing" : "Remove"}
    </button>
  );
}

export function DeletePostButton({ slug }: { slug: string }) {
  return (
    <form
      action={deletePostAction}
      onSubmit={(event) => {
        if (!confirm("Remove this post?")) event.preventDefault();
      }}
    >
      <input type="hidden" name="slug" value={slug} />
      <RemoveButton />
    </form>
  );
}
