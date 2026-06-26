import type { NextConfig } from "next";

// The browser talks to the backend through a same-origin proxy: requests go to
// `/backend/*` on this origin and Next forwards them to the API server-side.
// That sidesteps browser CORS entirely (no preflight, no Access-Control
// headers to negotiate), so the UI works against the Lambda Function URL
// regardless of how its CORS is configured.
//
// Override the upstream with MARKETDESK_API_UPSTREAM (e.g. point it at a local
// FastAPI on http://localhost:8000 during backend development).
const API_UPSTREAM = (
  process.env.MARKETDESK_API_UPSTREAM ||
  "https://azj5yeonax3bqyf4w2paigtfci0jsfcd.lambda-url.us-east-2.on.aws"
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/backend/:path*", destination: `${API_UPSTREAM}/:path*` }];
  },
};

export default nextConfig;
