"use client";

import { deleteProductAction } from "@/app/admin/actions";

export function DeleteProductButton({ slug }: { slug: string }) {
  return (
    <form action={deleteProductAction}>
      <input type="hidden" name="slug" value={slug} />
      <button
        className="button button-ghost button-small"
        type="submit"
        onClick={(event) => {
          if (!confirm("Remove this product from the shop?")) event.preventDefault();
        }}
      >
        Remove
      </button>
    </form>
  );
}
