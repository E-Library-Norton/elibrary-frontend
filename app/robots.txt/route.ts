import { SITE_URL } from "@/lib/seo";

export async function GET() {
  const siteUrlWithoutProtocol = SITE_URL.replace(/^https?:\/\//, "");

  const body = `# Norton University E-Library Robots Configuration
# Last updated: 2026-06-01

# Allow all user agents
User-agent: *
Allow: /

# Disallow API routes
Disallow: /api/

# Disallow admin and internal routes
Disallow: /_next/
Disallow: /__nextjs_original-stack-frame/

# Sitemap location
Sitemap: ${SITE_URL}/sitemap.xml

# Host (preferred domain for canonicalization)
Host: ${siteUrlWithoutProtocol}
`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
