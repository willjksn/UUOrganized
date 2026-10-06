export function SocialIcon({ name }: { name: string }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "Instagram") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === "Facebook") {
    return (
      <svg {...common}>
        <path d="M14 8h2V5h-2c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.2l.8-3H13V9c0-.6.4-1 1-1z" />
      </svg>
    );
  }

  if (name === "TikTok") {
    return (
      <svg {...common}>
        <path d="M14 6c.6 2.4 2.2 4 4.5 4.4v2.4c-1.6 0-3-.5-4.2-1.4v6.2a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.6a3 3 0 1 0 2.1 2.9V4h2.3c0 .7 0 1.4.1 2z" />
      </svg>
    );
  }

  if (name === "Pinterest") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M11 17.5c.4-1.3.8-2.6 1-3.6.2.4.8 1.2 1.8 1.2 2.4 0 4.1-2.2 4.1-5.1C17.9 7.4 16 6 13.6 6 10.6 6 8.5 8.2 8.5 11.1c0 1.5.6 2.8 1.8 3.3.2.1.4 0 .4-.2l.2-.7c0-.1 0-.2-.1-.3-.3-.4-.5-.9-.5-1.6 0-2 1.5-3.9 4-3.9 2.2 0 3.4 1.3 3.4 3.2 0 2.4-1.1 4.1-2.6 4.1-.8 0-1.5-.7-1.3-1.5.2-.9.7-1.9.7-2.6 0-.6-.3-1.1-.9-1.1s-1.2.7-1.2 1.7c0 .6.2 1 .2 1L11 17.5z" />
      </svg>
    );
  }

  if (name === "X") {
    return (
      <svg {...common}>
        <path d="M5 5l14 14M19 5L5 19" />
      </svg>
    );
  }

  if (name === "YouTube") {
    return (
      <svg {...common}>
        <rect x="3" y="6" width="18" height="12" rx="3" />
        <path d="M11 10l5 2.5-5 2.5z" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return null;
}
