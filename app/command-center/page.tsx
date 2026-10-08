import type { Metadata } from "next";
import Link from "next/link";
import { Brush } from "@/components/Brush";
import { Picture } from "@/components/Picture";
import { signupHref } from "@/lib/app-links";
import { site } from "@/lib/site";

const description =
  "The UU Organized app keeps today, medications, supplies, calls, documents, and the people helping in one place. The book teaches the system. The app helps you run it.";

export const metadata: Metadata = {
  title: "The UU Organized App",
  description,
  alternates: { canonical: "/command-center" },
  openGraph: {
    title: "The UU Organized App",
    description,
    url: "/command-center",
    type: "website",
  },
};

const chapters = [
  {
    id: "today",
    band: "",
    eyebrow: "Stay on top of today",
    title: "One place for what needs you now.",
    intro:
      "The load is not one task. It is the visit, the refill, the thing you are waiting on, and the date you said you would check back. Today gathers that into the day you are actually in.",
    items: [
      {
        title: "Today",
        body: "Medications, visits, follow-ups, and waiting items land on Today. If a visit still needs someone there, or a ride, that uncovered need can show up here too.",
      },
      {
        title: "Needs Attention",
        body: "Start with what is due, low, incomplete, or waiting. The rest of the day can wait its turn.",
      },
      {
        title: "Calendar",
        body: "Doctor visits, therapy, home health, rides, deliveries, and your own time. If that visit needs someone there or a ride, the coverage sits with the appointment.",
      },
      {
        title: "Tasks",
        body: "“Let me know how I can help” becomes a task with a name on it. Ownership is how someone else actually takes a piece.",
      },
      {
        title: "Follow-ups",
        body: "The date you said you would check back. A call, a waiting item, or a delivery can leave that date here.",
      },
      {
        title: "Reminders",
        body: "In the app, and by email when you want them. How far the reminders go depends on the plan.",
      },
    ],
  },
  {
    id: "medications",
    band: "band",
    eyebrow: "Keep medications organized",
    title: "The list, the label, and what you wrote down.",
    intro:
      "UU Organized stores the medication information you enter. It does not diagnose, change a dose, or decide what someone should take. You review every field before it is saved.",
    items: [
      {
        title: "The medication list",
        body: "Name, instructions, times, and refill notes. This is the list for the moment someone asks whether it was already given.",
      },
      {
        title: "What you record",
        body: "Schedules, the events you log, and the changes you write down stay with the medication. The history is what you entered, not a guess.",
      },
      {
        title: "A photo of the label",
        body: "Photograph the label or upload a picture. The reading is a draft. You check every field, then decide what to keep.",
      },
    ],
  },
  {
    id: "waiting",
    band: "",
    eyebrow: "Track the stuff nobody remembers",
    title: "Waiting on somebody else is still something you have to manage.",
    intro:
      "The useful part of the call is rarely the conversation. It is the name, the reference number, and the date you have to try again.",
    items: [
      {
        title: "Waiting On",
        body: "The callback, the authorization, the delivery. You can see what is stuck in somebody else’s hands without scrolling a text thread.",
      },
      {
        title: "Calls",
        body: "Who you spoke with, the number, and the reference number they made you repeat twice.",
      },
      {
        title: "Follow-up dates",
        body: "A waiting item can leave a date and a person. The next check is not only a promise you made out loud.",
      },
      {
        title: "Equipment",
        body: "Wheelchairs, beds, and the things on order. Status stays with the item instead of in a voicemail.",
      },
      {
        title: "Services",
        body: "Home health, rides, aides, and programs. Who is coming, and what they are there for.",
      },
      {
        title: "Applications",
        body: "What you sent, what is missing, and who has the file.",
      },
    ],
  },
  {
    id: "supplies",
    band: "band-sage",
    eyebrow: "The shit you cannot run out of",
    title: "Don't find out at 9 p.m. that you are down to the last one.",
    intro:
      "Supplies are the household things you really cannot run out of. The app tracks them. It does not place the order.",
    items: [
      {
        title: "What you keep",
        body: "Start from a catalog or add your own. Brand, size, and how it comes packaged can sit with the item.",
      },
      {
        title: "How much is left",
        body: "Current quantity, the point where it counts as low, and how much you reorder.",
      },
      {
        title: "Where you buy it",
        body: "A photo, the retailer you prefer, and the link for the place you already buy it.",
      },
      {
        title: "When it is low",
        body: "A low-stock note, and a place to mark that it was reordered or that it came back.",
      },
    ],
  },
  {
    id: "history",
    band: "",
    eyebrow: "Keep a real care history",
    title: "If it only lives in your memory, it is already half gone.",
    intro:
      "Notes, observations, and paperwork stay with the person. A month from now you should not have to reconstruct what changed.",
    items: [
      {
        title: "Notes",
        body: "What you need to remember later. Search and filters are there when the pile gets long.",
      },
      {
        title: "Observations",
        body: "I don't know if this matters, but… If something feels different, write it down before you talk yourself out of it.",
      },
      {
        title: "Know Their Normal",
        body: "What an ordinary day looks like for them, so a change has something to stand next to.",
      },
      {
        title: "Documents",
        body: "Discharge papers, cards, forms, the letter you will need again. Storage room depends on the plan.",
      },
      {
        title: "Monthly Care Review",
        body: "A look back at the month from the records already saved, so you are not starting from a blank page.",
      },
      {
        title: "Exports",
        body: "Caregiver and Caregiver Family can export. Free keeps the records in the app.",
      },
    ],
  },
  {
    id: "together",
    band: "band",
    eyebrow: "Share the mental load",
    title: "So somebody else can actually help.",
    intro:
      "Helping means a name on the next thing. It does not mean another “let me know if you need anything.”",
    items: [
      {
        title: "Care Contacts",
        body: "Doctors, therapists, agencies, pharmacies, and the other people you call. Role, phone, email, and why they are on the list. They do not sign in.",
      },
      {
        title: "People Helping",
        body: "Family, caregivers, and helpers who can sign in. They join the workspace you already have. A caregiver spot is not a second subscription, and access can be limited to the people they are actually helping.",
      },
      {
        title: "Handoffs",
        body: "What the next person needs when they take a turn: what changed, what is due, and what they should not discover at 9 p.m.",
      },
      {
        title: "Messages",
        body: "A private place for the people helping. Everyone, a few people, or one person. Important messages can be marked. Messaging is part of Caregiver Family.",
      },
    ],
  },
  {
    id: "coverage",
    band: "",
    eyebrow: "Who's got this?",
    title: "Care doesn't stop just because the primary caregiver is busy, working, or out of town.",
    intro:
      "When a visit, appointment, ride, or task needs someone, the people helping can see what still needs coverage and take ownership. Once someone takes it, the rest of them can see who has it covered.",
    items: [
      {
        title: "I can be there.",
        body: "A CNA is coming Tuesday. Someone helping can choose to be there.",
      },
      {
        title: "I can drive.",
        body: "A doctor appointment needs a ride. Someone can take that drive.",
      },
      {
        title: "I've got this.",
        body: "A medication pickup is still unassigned. Someone helping can claim that task.",
      },
      {
        title: "Still open",
        body: "If nobody has taken it yet, the need can show on Today and with that appointment on the calendar.",
      },
    ],
  },
  {
    id: "capture",
    band: "band-sage",
    eyebrow: "AI that organizes the chaos",
    title: "Tell me what's going on. I'll organize it.",
    intro:
      "Quick Capture is for the moment you cannot stop and file the thing correctly. Nothing important is saved until you confirm it. This is organization help, not medical advice.",
    items: [
      {
        title: "Type it",
        body: "Write what is going on in plain language. The app sorts it toward the list it belongs on. You still confirm the result.",
      },
      {
        title: "Say it",
        body: "Use the microphone when your hands are full. The recording becomes a transcript you can edit before it is organized.",
      },
      {
        title: "Photograph it",
        body: "A medication label is read as a draft. A package photo can suggest a supply. You review it before anything is kept.",
      },
    ],
  },
  {
    id: "ask",
    band: "band",
    eyebrow: "Ask UUO",
    title: "Ask about what's already written down, then keep the conversation going.",
    intro:
      "Pronounced \"you-oh.\" Answers are grounded in the UU Organized records you're allowed to see, and they point back to those records. Ask UUO does not diagnose, and it does not change a record on its own.",
    items: [
      {
        title: "Ask",
        body: "What changed this week? What needs my attention? What are we waiting on? What's coming up?",
      },
      {
        title: "Then keep going",
        body: "What happened with that insurance call? When should I follow up? What changed since the last appointment?",
      },
      {
        title: "It can also open",
        body: "Appointment Prep, a caregiver handoff, the Monthly Care Review, a recent-change summary, or a message draft where messaging is included.",
      },
      {
        title: "You still decide",
        body: "Quick Capture is the separate path for adding something new. A write or a message still waits for the review you already use.",
      },
    ],
  },
  {
    id: "changes",
    band: "",
    eyebrow: "Know what's changed",
    title: "Catch up without reading every record.",
    intro:
      "The timeline and the summaries are built from what is already saved. They do not invent a change that nobody wrote down.",
    items: [
      {
        title: "Universal Timeline",
        body: "Notes, observations, medication changes, calls, waiting items, tasks, and follow-ups in one place. Filter it when you only need one kind.",
      },
      {
        title: "Since you last looked",
        body: "A summary of what changed, tied back to the records. It does not send a message or create a reminder on its own.",
      },
      {
        title: "Before the visit",
        body: "Appointment preparation pulls what is coming up, what changed, and what you may want to ask. You decide what to take with you.",
      },
    ],
  },
];

export default function CommandCenterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "The UU Organized App",
    url: `${site.url}/command-center`,
    description,
    isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="section">
        <div className="wrap narrow">
          <p className="eyebrow">The UU Organized App</p>
          <h1>One place for the care you are already holding.</h1>
          <Brush />
          <p className="lede">
            Appointments. Medications. Supplies. Insurance calls. Reference numbers. Follow-ups. Family
            updates. The things you are waiting on.
          </p>
          <p>
            UU Organized helps you keep track of it all, with AI helping organize the chaos. You decide
            what goes in. You review it before it is saved.
          </p>
          <p className="book-line">The book teaches the system. The app helps you run it.</p>
          <div className="actions">
            <a className="button" href={signupHref("free")} data-cta="start-free">
              Start Free
            </a>
            <Link className="button button-ghost" href="/pricing" data-cta="see-pricing">
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {chapters.map((chapter) => (
        <section key={chapter.id} id={chapter.id} className={chapter.band ? `section ${chapter.band}` : "section"} aria-labelledby={`${chapter.id}-heading`}>
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

      <section className="section band" id="plans" aria-labelledby="plans-heading">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">How the plans fit</p>
            <h2 id="plans-heading">Start with one person. Make room when the list grows.</h2>
            <p className="lede">
              Who&apos;s got this? is on every plan. Caregiver Family is the larger team, and the one with messaging.
            </p>
          </div>
          <div className="detail-grid detail-grid-plans">
            <article>
              <p className="eyebrow">Free</p>
              <h3>Get organized.</h3>
              <p>1 person you care for and 2 caregiver spots. Limited AI assistance, so you can see whether one place for care actually helps.</p>
            </article>
            <article>
              <p className="eyebrow">Caregiver</p>
              <h3>I manage care.</h3>
              <p>1 person you care for and 4 caregiver spots, with generous AI, exports, and advanced reminders for the person keeping the list.</p>
            </article>
            <article>
              <p className="eyebrow">Caregiver Family</p>
              <h3>We manage care.</h3>
              <p>Up to 3 people you care for and 10 caregiver spots, with messaging, family collaboration, and expanded AI for the people sharing the care.</p>
            </article>
          </div>
          <div className="actions">
            <Link className="button" href="/pricing" data-cta="see-pricing">
              Compare plans
            </Link>
            <a className="button button-ghost" href={signupHref("free")} data-cta="start-free">
              Start Free
            </a>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="book-heading">
        <div className="wrap book-feature">
          <figure className="hero-cover">
          <Picture
            src="/images/book-cover.jpg"
            alt="Who the Hell Put Me in Charge?! book cover"
            width={800}
            height={1000}
          />
          </figure>
          <div>
            <p className="eyebrow">The book and the app</p>
            <h2 id="book-heading">The book teaches the system. The app helps you run it.</h2>
            <p>
              <em>Who the Hell Put Me in Charge?!</em> stays a book you can buy on its own. The UU Organized
              app is the digital tool inspired by that caregiving system. You do not need the app to use
              the book, and you do not need the book to start the app.
            </p>
            <div className="actions">
              <Link className="button button-ghost" href="/shop#book">
                Shop the book
              </Link>
              <a className="button" href={signupHref("free")} data-cta="start-free">
                Try the app free
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
