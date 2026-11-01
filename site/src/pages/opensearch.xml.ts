import { SITE_TITLE, withBase } from '../lib/site';

/**
 * An OpenSearch description document. Declaring the site's own full-text
 * search this way makes it installable as a search engine in Firefox, Chrome
 * and other browsers — type a keyword, hit Tab in the omnibox, keep typing.
 * The `searchTerms` placeholder inside the XML must stay escaped exactly as
 * the spec spells it (`{searchTerms}`); only HTML escaping is applied below.
 */
export async function GET() {
  const site = import.meta.env.SITE;
  const searchUrl = `${site}${withBase('search/')}?q={searchTerms}&origin=opensearch`;
  const icon = `${site}${withBase('favicon.svg')}`;
  const self = `${site}${withBase('opensearch.xml')}`;

  const escape = (text) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>${escape(SITE_TITLE)}</ShortName>
  <Description>Search the DailyAgent's daily log, outlooks and still-open events.</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image width="16" height="16" type="image/svg+xml">${icon}</Image>
  <Url type="text/html" template="${escape(searchUrl)}"/>
  <Url type="application/opensearchdescription+xml" rel="self" template="${self}"/>
</OpenSearchDescription>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/opensearchdescription+xml; charset=utf-8' },
  });
}
