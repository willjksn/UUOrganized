import { Picture } from "./Picture";

export function CleanEdition() {
  return (
    <figure className="clean-edition">
      <Picture
        src="/images/book-clean.png"
        alt="Profanity-free edition cover of Who the Hell Put Me in Charge?! by Stormi J. It reads Profanity-Free Edition."
        width={811}
        height={1024}
        sizes="(max-width: 800px) 80vw, 280px"
      />
      <figcaption>
        <span className="eyebrow">Profanity-Free Edition</span>
        Same guide, cleaner language. The cover is ready. The purchase link is not connected yet.
      </figcaption>
    </figure>
  );
}
