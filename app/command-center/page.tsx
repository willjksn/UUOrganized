import type { Metadata } from "next";
import Link from "next/link";
import { Brush } from "@/components/Brush";
import { Picture } from "@/components/Picture";
import { signupHref } from "@/lib/app-links";
import { site } from "@/lib/site";

const description =
  "A place for the caregiving list that used to live in your head: medications, appointments, calls, supplies, and the people helping.";

export const metadata: Metadata = {
  title: "Caregiver Command Center",
  description,
  alternates: { canonical: "/command-center" },
  openGraph: {
    title: "Caregiver Command Center",
    description,
    url: "/command-center",
    type: "website",
  },
};

const chapters = [
  {
    id: "day",
    eyebrow: "The day you are actually in",
    title: "Today is the list. The rest has a room of its own.",
    intro:
      "The mental load is not one task. It is the appointment, the refill, the call you are waiting on, and the date you said you would check back, all at once. The Command Center keeps those apart so Today can show what needs you.",
    items: [
      {
        title: "Today",
        body: "Today gathers medications, visits, follow-ups, and waiting items into the day you are in. If the day is clear, it stays clear. New things show up here when they have a time or a person attached.",
      },
      {
        title: "Calendar",
        body: "Doctor visits, therapy, home health, rides, deliveries, and your own time live on the calendar. An appointment is a record you enter: who it is with, when it is, and why you are going.",
      },
      {
        title: "Follow-ups",
        body: "A follow-up is the date you said you would check back. A call, a waiting item, or a delivery can leave that date here, so it is not only a promise you made out loud.",
      },
      {
        title: "Waiting On",
        body: "Waiting On is for the thing stuck in somebody else’s hands. The callback, the authorization, the delivery. You can see what you are waiting for without scrolling a text thread to find it.",
      },
    ],
  },
  {
    id: "bottles",
    eyebrow: "The bottles and the boxes",
    title: "The medication list, and the stuff you cannot run out of.",
    intro:
      "The app stores what you enter. It does not change a dose, start or stop a medication, or give medical advice. You review every field before it is saved.",
    items: [
      {
        title: "Medications",
        body: "Keep the name, the instructions, the times, and the refill notes you are trying to hold straight. This is the list for the moment someone asks, “Did we already give that?”",
      },
      {
        title: "A photo of the label",
        body: "Photograph the label or upload a picture. The reading is a draft. You check every field, then decide what to keep. The photo can stay with the medication, private to the workspace.",
      },
      {
        title: "Supplies",
        body: "Supplies are the things you really cannot run out of. Mark what is low, what was reordered, and what came back. A reorder link can point at the place you already buy it.",
      },
      {
        title: "A photo of a package",
        body: "A package photo can suggest a supply you already track. You confirm it before anything is added. The app does not place the order for you.",
      },
    ],
  },
  {
    id: "calls",
    eyebrow: "The phone and the paper",
    title: "After the call, the details have somewhere to go.",
    intro:
      "Insurance, the pharmacy, the agency, the equipment company. The useful part is rarely the conversation. It is the name, the reference number, and the date you have to call again.",
    items: [
      {
        title: "Calls",
        body: "Write down the boring details while they are still fresh: who you spoke with, the number, and the reference number they made you repeat twice.",
      },
      {
        title: "Documents",
        body: "Upload the paperwork you will otherwise spend twenty minutes looking for. Discharge papers, cards, forms, the letter you know you will need again. Storage room depends on the plan.",
      },
      {
        title: "Appointment preparation",
        body: "Ask for a preparation summary before the visit. It is built from the records already in the Command Center: what is coming up, what changed, and what you may want to ask.",
      },
      {
        title: "Summaries",
        body: "You can also ask what changed since you last looked. A summary stays tied to saved records. It does not send a message, call the office, or create a reminder on its own.",
      },
    ],
  },
  {
    id: "people",
    eyebrow: "The people helping",
    title: "So you are not the only one holding it.",
    intro:
      "Care does not get lighter because more people are in a group text. It gets lighter when the next person can see the list, the task, and what they are walking into.",
    items: [
      {
        title: "Care team",
        body: "The care team is who you call, and what you call them for. Keep the role, the phone, the email, and the reason that person is on the list.",
      },
      {
        title: "Tasks",
        body: "Tasks turn “let me know how I can help” into something a person owns. The next thing has a name on it, instead of floating in the family thread.",
      },
      {
        title: "Handoffs",
        body: "A handoff is what the next person actually needs when they take a turn: what changed, what is due, and what they should not have to discover at 9 p.m.",
      },
      {
        title: "Messages",
        body: "Messages are a private place to tell the people helping, without starting another group text. Messaging and family collaboration are part of the Family plan.",
      },
    ],
  },
];

export default function CommandCenterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Caregiver Command Center",
    url: `${site.url}/command-center`,
    description,
    isPartOf: {
      "@type": "WebSite",
      name: site.name,
      url: site.url,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="section hero">
        <div className="wrap narrow-prose">
          <p className="eyebrow">Caregiver Command Center</p>
          <h1>One place for the care you are already holding.</h1>
          <Brush />
          <p className="lede">
            Appointments. Medications. Supplies. Insurance calls. Reference numbers. Follow-ups. Family
            updates. The things you are waiting on.
          </p>
          <p>
            UU Organized helps you keep track of it all, with AI helping organize the chaos. You decide
            what goes in. You review it before it is saved. The book teaches the system. This is where
            you run it.
          </p>
          <div className="actions">
            <a className="button" href={signupHref("free")}>
              Start Free
            </a>
            <Link className="button button-ghost" href="/pricing">
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {chapters.map((chapter) => (
        <section className="section" key={chapter.id} aria-labelledby={`${chapter.id}-heading`}>
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">{chapter.eyebrow}</p>
              <h2 id={`${chapter.id}-heading`}>{chapter.title}</h2>
              <p className="lede">{chapter.intro}</p>
            </div>
            <div className="detail-grid">
              {chapter.items.map((item) => (
                <article key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="section band-sage" aria-labelledby="capture-heading">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">When your hands are full</p>
            <h2 id="capture-heading">Say it. Show it. Ask it later.</h2>
            <p className="lede">
              Quick Capture is for the moment you cannot stop and file the thing correctly. Nothing is
              saved until you confirm it.
            </p>
          </div>
          <div className="detail-grid">
            <article>
              <h3>Type it</h3>
              <p>
                Write what is going on in plain language. The Command Center sorts it toward the list it
                belongs on. You still confirm the result.
              </p>
            </article>
            <article>
              <h3>Say it</h3>
              <p>
                Use the microphone when your hands are on a bottle, a steering wheel, or a discharge
                packet. The recording becomes a transcript you can edit before it is organized.
              </p>
            </article>
            <article>
              <h3>Photograph it</h3>
              <p>
                A photo can start a supply note. A medication label is read on its own screen, and you
                review every field. The photo does not decide a dose.
              </p>
            </article>
            <article>
              <h3>Ask Command Center</h3>
              <p>
                Questions stay tied to the records you can already see. Ask what needs attention, what
                changed, or to prepare you for the next appointment. How much AI help you get depends on
                the plan.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="plans-heading">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">How the plans fit</p>
            <h2 id="plans-heading">Start with one person. Make room when the list grows.</h2>
          </div>
          <div className="detail-grid detail-grid-plans">
            <article>
              <p className="eyebrow">Free</p>
              <h3>Get organized.</h3>
              <p>1 care recipient and 2 members. Limited AI assistance, so you can see whether one place for care actually helps.</p>
            </article>
            <article>
              <p className="eyebrow">Command Center</p>
              <h3>I manage care.</h3>
              <p>1 care recipient and 4 members, with generous AI, exports, and advanced reminders for the person keeping the list.</p>
            </article>
            <article>
              <p className="eyebrow">Family</p>
              <h3>We manage care.</h3>
              <p>3 care recipients and 10 members, with messaging, family collaboration, and expanded AI for the people sharing the care.</p>
            </article>
          </div>
          <div className="actions actions-spaced">
            <Link className="button" href="/pricing">
              See pricing
            </Link>
            <a className="button button-ghost" href={signupHref("free")}>
              Start Free
            </a>
          </div>
        </div>
      </section>

      <section className="section band" aria-labelledby="book-system-heading">
        <div className="wrap story">
          <figure className="hero-cover">
            <Picture
              src="/images/book-cover.jpg"
              alt="Book cover of Who the Hell Put Me in Charge?! by Stormi J."
              width={1000}
              height={1250}
              sizes="(max-width: 900px) 80vw, 380px"
            />
          </figure>
          <div className="prose">
            <p className="eyebrow">The book and the app</p>
            <h2 id="book-system-heading">The book teaches the system. The app helps you run it.</h2>
            <p>
              <em>Who the Hell Put Me in Charge?!</em> stays a book you can buy on its own. The Caregiver
              Command Center is the digital tool inspired by that caregiving system: the medications, the
              appointments, the paperwork, and the rest of what nobody warns you about.
            </p>
            <div className="actions">
              <Link className="button" href="/shop#book">
                Shop the book
              </Link>
              <a className="button button-ghost" href={signupHref("free")}>
                Start Free
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
