import assert from "node:assert/strict";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { describe, it } from "node:test";
import { sourceFromSignup } from "../lib/audience";
import { marketingOptIn, professionalInquiry } from "../lib/inquiries";
import { footerPages, publicNav } from "../lib/nav";

const publicSurfaces = [
  "app/page.tsx",
  "app/command-center/page.tsx",
  "app/pricing/page.tsx",
  "app/faq/page.tsx",
  "app/shop/page.tsx",
  "app/about/page.tsx",
  "app/contact/page.tsx",
  "app/for-professionals/page.tsx",
  "components/Footer.tsx",
  "components/Header.tsx",
  "components/BookToApp.tsx",
  "components/PricingBoard.tsx",
  "components/EmailSignup.tsx",
  "components/ProductCard.tsx",
];

describe("prelaunch marketing", () => {
  it("does not invite the public to start or buy the app", () => {
    const source = publicSurfaces.map((file) => readFileSync(file, "utf8")).join("\n");
    assert.equal(/signupHref|Start Free|Try the app free|Start Using the App|Start Caregiver/.test(source), false);
  });

  it("keeps For Professionals in the footer and the header uncrowded", () => {
    const headerHrefs: string[] = publicNav.map((page) => page.href);
    assert.equal(headerHrefs.includes("/for-professionals"), false);
    assert.ok(footerPages.some((page) => page.href === "/for-professionals" && page.label === "For Professionals"));
  });

  it("treats marketing consent as opt-in", () => {
    assert.equal(marketingOptIn(undefined), false);
    assert.equal(marketingOptIn(false), false);
    assert.equal(marketingOptIn("on"), true);
    assert.equal(sourceFromSignup({ type: "checklist", marketingConsent: false }), null);
    assert.equal(sourceFromSignup({ type: "checklist" }), "checklist");
    assert.equal(sourceFromSignup({ type: "waitlist", marketingConsent: false }), null);
    assert.equal(sourceFromSignup({ type: "waitlist", marketingConsent: true }), "checklist");
    assert.equal(sourceFromSignup({ type: "professional" }), null);
  });

  it("rejects a professional inquiry that skips the health-data confirmation", () => {
    const missing = professionalInquiry({
      name: "Ada",
      email: "ada@example.com",
      organization: "Home team",
      category: "Review copy",
      message: "Please send a review copy for our discharge team.",
    });
    assert.equal("error" in missing, true);

    const ready = professionalInquiry({
      name: "Ada",
      email: "ada@example.com",
      organization: "Home team",
      category: "Review copy",
      message: "Please send a review copy for our discharge team.",
      noHealthData: "on",
    });
    assert.equal("email" in ready, true);
  });

  it("stores a waitlist address locally and recognizes a duplicate", async () => {
    assert.equal(process.env.BLOB_READ_WRITE_TOKEN, undefined);
    assert.equal(process.env.RESEND_API_KEY, undefined);
    const { POST } = await import("../app/api/waitlist/route");
    const email = "uuo-brand-preview-test@example.com";
    const signupPath = "data/signups.ndjson";
    const hadSignups = existsSync(signupPath);
    const previous = hadSignups ? readFileSync(signupPath, "utf8") : "";
    const call = (body: Record<string, unknown>) =>
      POST(
        new Request("http://localhost/api/waitlist", {
          method: "POST",
          headers: { origin: "http://localhost", host: "localhost", "content-type": "application/json" },
          body: JSON.stringify(body),
        }),
      );

    try {
      const created = await call({ email, updates: false });
      assert.equal(created.status, 200);
      assert.deepEqual(await created.json(), { ok: true, duplicate: false });

      const again = await call({ email });
      assert.equal(again.status, 200);
      assert.deepEqual(await again.json(), { ok: true, duplicate: true });

      const invalid = await call({ email: "not-an-email" });
      assert.equal(invalid.status, 400);
    } finally {
      if (hadSignups) writeFileSync(signupPath, previous);
      else rmSync(signupPath, { force: true });
    }
  });
});
