import { withBase } from '../lib/site';

/**
 * robots.txt follows the configured SITE_URL/BASE_URL, so the Sitemap line
 * stays true if the project is ever self-hosted instead of GitHub Pages.
 */
export async function GET() {
  const site = import.meta.env.SITE;
  const body = `User-agent: *
Allow: /

Sitemap: ${site}${withBase('sitemap.xml')}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
