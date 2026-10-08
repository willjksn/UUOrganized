import { saveCopyAction } from "@/app/admin/actions";
import type { SiteCopy } from "@/lib/copy";
import { Picture } from "./Picture";

function Field({
  label,
  name,
  value,
  max,
  rows,
  hint,
}: {
  label: string;
  name: string;
  value: string;
  max: number;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {rows ? (
        <textarea name={name} maxLength={max} rows={rows} defaultValue={value} />
      ) : (
        <input name={name} maxLength={max} defaultValue={value} />
      )}
      {hint ? <p className="fine">{hint}</p> : null}
    </label>
  );
}

export function CopyForm({ copy }: { copy: SiteCopy }) {
  return (
    <form className="signup admin-form" action={saveCopyAction}>
      <details className="copy-section" open>
        <summary>Home headline</summary>
        <Field label="Short description, for search" name="description" value={copy.description} max={300} rows={3} />
        <Field label="Small label" name="homeEyebrow" value={copy.homeEyebrow} max={80} />
        <Field label="Headline" name="homeHeadline" value={copy.homeHeadline} max={80} />
        <Field label="Italic line under it" name="homeHeadlineEm" value={copy.homeHeadlineEm} max={80} hint="Leave this empty to use one line." />
        <Field label="Sentence under the headline" name="homeLede" value={copy.homeLede} max={300} rows={3} />
        <Field label="Button" name="homePrimaryCta" value={copy.homePrimaryCta} max={40} />
        <Field label="Button link" name="homePrimaryHref" value={copy.homePrimaryHref} max={500} hint="A page like /shop, a #checklist jump, or a full https:// link." />
        <Field label="Second button" name="homeSecondaryCta" value={copy.homeSecondaryCta} max={40} hint="Leave empty to hide it." />
        <Field label="Second button link" name="homeSecondaryHref" value={copy.homeSecondaryHref} max={500} />
        <div className="admin-preview">
          <Picture src={copy.heroImage} alt="" width={copy.heroWidth} height={copy.heroHeight} />
        </div>
        <label className="field">
          <span>Picture next to the headline</span>
          <input name="heroImage" type="file" accept="image/jpeg,image/png,image/webp" />
        </label>
        <Field label="Picture description" name="heroImageAlt" value={copy.heroImageAlt} max={180} />
        <Field label="Caption under the picture" name="heroCaption" value={copy.heroCaption} max={140} hint="Leave empty to hide the caption." />
        <p className="fine">The four labels in the bar under the headline.</p>
        {copy.principles.map((word, index) => (
          <Field key={index} label={`Word ${index + 1}`} name={`principle${index}`} value={word} max={24} />
        ))}
        <Field label="Tools label" name="toolsEyebrow" value={copy.toolsEyebrow} max={80} />
        <Field label="Tools heading" name="toolsHeading" value={copy.toolsHeading} max={160} />
      </details>

      <details className="copy-section">
        <summary>Why I started</summary>
        <p className="fine">This block is on the home page. The first two paragraphs show first. The button opens the rest on that same page. About stays its own page. Start a new line for each paragraph.</p>
        <div className="admin-preview portrait-preview">
          <img src={copy.storyImage} alt="" />
        </div>
        <label className="field">
          <span>Your picture</span>
          <input name="storyImage" type="file" accept="image/jpeg,image/png,image/webp" />
        </label>
        <Field label="Picture description" name="storyImageAlt" value={copy.storyImageAlt} max={180} />
        <Field label="Small label" name="storyEyebrow" value={copy.storyEyebrow} max={80} />
        <Field label="Heading" name="storyHeading" value={copy.storyHeading} max={160} />
        <Field label="Story" name="storyBody" value={copy.storyBody} max={4000} rows={8} />
        <Field label="Button" name="storyLinkText" value={copy.storyLinkText} max={40} hint="Opens the rest of this story. It does not leave the page." />
        <input type="hidden" name="storyLinkHref" value={copy.storyLinkHref} />
      </details>

      <details className="copy-section">
        <summary>Home checklist</summary>
        <p className="fine">The heading and picture can change. The file people receive from this box is still the First 48 Hours checklist.</p>
        <div className="admin-preview">
          <Picture src={copy.checklistImage} alt="" width={copy.checklistWidth} height={copy.checklistHeight} />
        </div>
        <label className="field">
          <span>Checklist picture</span>
          <input name="checklistImage" type="file" accept="image/jpeg,image/png,image/webp" />
        </label>
        <Field label="Picture description" name="checklistImageAlt" value={copy.checklistImageAlt} max={180} />
        <Field label="Small label" name="checklistEyebrow" value={copy.checklistEyebrow} max={80} />
        <Field label="Heading" name="checklistHeading" value={copy.checklistHeading} max={160} />
        <Field label="Script line" name="checklistAttitude" value={copy.checklistAttitude} max={160} hint="Leave empty to hide it." />
        <Field label="Sentence" name="checklistBody" value={copy.checklistBody} max={800} rows={4} />
        <Field label="Button" name="checklistButton" value={copy.checklistButton} max={40} />
        <Field label="Note under the button" name="checklistNote" value={copy.checklistNote} max={240} rows={3} />
      </details>

      <details className="copy-section">
        <summary>About</summary>
        <p className="fine">This picture or video is only on the About page. A video plays on a loop.</p>
        <div className="admin-preview portrait-preview">
          {copy.aboutMedia === "video" && copy.aboutImage ? (
            <video src={copy.aboutImage} muted loop autoPlay playsInline />
          ) : (
            <img src={copy.aboutImage || copy.storyImage} alt="" />
          )}
        </div>
        <label className="field">
          <span>Picture or video</span>
          <input name="aboutMedia" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov" />
        </label>
        <p className="fine">A JPG, PNG, or WebP. Or an MP4, WebM, or MOV under 10 MB. Leave it empty to keep the current one.</p>
        <Field label="Description" name="aboutImageAlt" value={copy.aboutImageAlt} max={180} hint="What the picture or video shows." />
        <Field label="Small label" name="aboutEyebrow" value={copy.aboutEyebrow} max={80} />
        <Field label="Heading" name="aboutHeading" value={copy.aboutHeading} max={160} />
        <Field label="Story" name="aboutBody" value={copy.aboutBody} max={4000} rows={10} hint="Start a new line for each paragraph." />
        <Field label="Quote" name="aboutQuote" value={copy.aboutQuote} max={300} rows={3} hint="Leave empty to hide it." />
        <Field label="Line under the quote" name="aboutNote" value={copy.aboutNote} max={180} />
        <Field label="List" name="aboutPoints" value={copy.aboutPoints} max={800} rows={5} hint="One item on each line." />
        <Field label="Button" name="aboutPrimaryCta" value={copy.aboutPrimaryCta} max={40} hint="Leave empty to hide it." />
        <Field label="Button link" name="aboutPrimaryHref" value={copy.aboutPrimaryHref} max={500} />
        <Field label="Second button" name="aboutSecondaryCta" value={copy.aboutSecondaryCta} max={40} />
        <Field label="Second button link" name="aboutSecondaryHref" value={copy.aboutSecondaryHref} max={500} />
      </details>

      <details className="copy-section">
        <summary>Shop</summary>
        <Field label="Small label" name="shopEyebrow" value={copy.shopEyebrow} max={80} />
        <Field label="Heading" name="shopHeading" value={copy.shopHeading} max={160} />
        <Field label="Sentence" name="shopLede" value={copy.shopLede} max={300} rows={3} />
        <Field label="Bottom label" name="shopLaterEyebrow" value={copy.shopLaterEyebrow} max={80} />
        <Field label="Bottom heading" name="shopLaterHeading" value={copy.shopLaterHeading} max={160} hint="Clear this and the sentence to hide the bottom note." />
        <Field label="Bottom sentence" name="shopLaterBody" value={copy.shopLaterBody} max={800} rows={4} />
        <Field label="Bottom button" name="shopLaterCta" value={copy.shopLaterCta} max={40} />
        <Field label="Bottom button link" name="shopLaterHref" value={copy.shopLaterHref} max={500} />
      </details>

      <details className="copy-section">
        <summary>Contact</summary>
        <Field label="Small label" name="contactEyebrow" value={copy.contactEyebrow} max={80} />
        <Field label="Heading" name="contactHeading" value={copy.contactHeading} max={160} />
        <Field label="Sentence" name="contactBody" value={copy.contactBody} max={800} rows={4} hint="The contact@ address stays under this." />
      </details>

      <details className="copy-section">
        <summary>Top banner</summary>
        <Field label="Message" name="promoMessage" value={copy.promoMessage} max={180} hint="Leave empty to hide the bar across the top of every page." />
        <Field label="Code, optional" name="promoCode" value={copy.promoCode} max={40} />
      </details>

      <button className="button" type="submit">
        Save
      </button>
    </form>
  );
}
