export const site = {
  name: "Unhinged. Unfiltered. Organized.",
  shortName: "UUO",
  author: "Stormi J.",
  url: process.env.SITE_URL || "https://uuorganized.com",
  email: process.env.CONTACT_EMAIL || "hello@uuorganized.com",
  description:
    "Practical systems for the shit nobody tells you about. The book, printables, and tools by Stormi J.",
  amazon:
    "https://www.amazon.com/dp/B0HLTRGHLT?lv=shuf&linkCode=ml1&linkId=b235e14b41bc7c2abe858e1701eb65c6&gaOptInStatus=true&tag=stormijxo-20&channelId=704&ref_=cm_sw_r_as_gl_api_gl_i_ARV1NHEF9WCVVVRH5BQQ&plpRedirect=mhFallback",
  etsy: "https://www.etsy.com/shop/UUOrganized",
} as const;

export const socialPlatforms = ["Instagram", "Facebook", "X", "TikTok", "Pinterest", "YouTube"] as const;

export type SocialName = (typeof socialPlatforms)[number];
