"use client";

import { useEffect, useRef } from "react";

type Field = HTMLInputElement | HTMLTextAreaElement;

function isWritingField(target: EventTarget | null): target is Field {
  if (!(target instanceof HTMLElement) || target.closest(".emoji-pop")) return false;
  if (!target.closest(".admin")) return false;
  if (target instanceof HTMLTextAreaElement) return !target.disabled && !target.readOnly;
  if (!(target instanceof HTMLInputElement)) return false;
  if (target.disabled || target.readOnly) return false;
  if ((target.type || "text").toLowerCase() !== "text") return false;
  if (["numeric", "decimal", "url", "email"].includes(target.inputMode)) return false;
  const name = target.name || "";
  if (name === "href" || name === "shipping" || name === "shippingIntl" || name === "stock" || name.endsWith("Href")) return false;
  return true;
}

export function EmojiDock() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const buttonEl = root.querySelector("button");
    const popEl = root.querySelector<HTMLDivElement>(".emoji-pop");
    if (!buttonEl || !popEl) return;
    const button = buttonEl;
    const pop = popEl;

    let current: Field | null = null;
    let caret = { start: 0, end: 0 };
    let open = false;

    function place(el: Field) {
      const rect = el.getBoundingClientRect();
      button.hidden = false;
      button.style.top = `${Math.max(8, rect.top + 6)}px`;
      button.style.right = `${Math.max(8, window.innerWidth - rect.right + 6)}px`;
      const width = Math.min(352, window.innerWidth - 16);
      const height = 430;
      let left = rect.right - width;
      if (left < 8) left = 8;
      if (left + width > window.innerWidth - 8) left = Math.max(8, window.innerWidth - width - 8);
      let top = rect.bottom + 8;
      if (top + height > window.innerHeight - 8) top = Math.max(8, rect.top - height - 8);
      pop.style.top = `${top}px`;
      pop.style.left = `${left}px`;
    }

    function close() {
      open = false;
      pop.hidden = true;
      pop.replaceChildren();
      button.setAttribute("aria-expanded", "false");
    }

    function onFocus(event: FocusEvent) {
      const target = event.target;
      if (isWritingField(target)) {
        current = target;
        caret = { start: target.selectionStart ?? target.value.length, end: target.selectionEnd ?? target.value.length };
        place(target);
        return;
      }
      if (target instanceof Node && (button.contains(target) || pop.contains(target))) return;
      if (!open) {
        button.hidden = true;
        current = null;
      }
    }

    function onSelect() {
      if (!current || document.activeElement !== current) return;
      caret = { start: current.selectionStart ?? current.value.length, end: current.selectionEnd ?? current.value.length };
    }

    function onScroll() {
      if (current && document.body.contains(current)) place(current);
    }

    function onPointer(event: PointerEvent) {
      if (!open) return;
      const target = event.target as Node;
      if (pop.contains(target) || button.contains(target)) return;
      close();
    }

    async function toggle() {
      if (open) {
        close();
        return;
      }
      if (!current) return;
      open = true;
      pop.hidden = false;
      button.setAttribute("aria-expanded", "true");
      place(current);
      const { default: EmojiPicker } = await import("emoji-picker-element/picker");
      if (!open) return;
      const picker = new EmojiPicker({ locale: "en" });
      picker.classList.add("light");
      picker.addEventListener("emoji-click", (event) => {
        const unicode = event.detail.unicode;
        if (!unicode || !current) return;
        const max = current.maxLength > 0 ? current.maxLength : Number.POSITIVE_INFINITY;
        const next = `${current.value.slice(0, caret.start)}${unicode}${current.value.slice(caret.end)}`;
        if (next.length > max) return;
        current.value = next;
        const placeAt = caret.start + unicode.length;
        caret = { start: placeAt, end: placeAt };
        current.focus();
        current.setSelectionRange(placeAt, placeAt);
      });
      pop.replaceChildren(picker);
    }

    const onPointerDown = (event: Event) => {
      event.preventDefault();
      toggle().catch(() => close());
    };
    button.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("selectionchange", onSelect);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      button.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("selectionchange", onSelect);
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, true);
      pop.replaceChildren();
    };
  }, []);

  return (
    <div ref={rootRef} className="emoji-dock">
      <button type="button" className="emoji-key" hidden aria-label="Emoji" aria-expanded="false">
        😀
      </button>
      <div className="emoji-pop" hidden />
    </div>
  );
}
