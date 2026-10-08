import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  outputFileTracingIncludes: {
    "/api/download": ["./private/checklist.pdf"],
    "/api/subscribe": ["./private/checklist.pdf"],
  },
  async redirects() {
    return [
      { source: "/admin/letters", destination: "/admin/emails", permanent: false },
      { source: "/admin/words", destination: "/admin/pages", permanent: false },
      { source: "/privacy", destination: "https://app.uuorganized.com/privacy", permanent: true },
    ];
  },
};

export default nextConfig;
