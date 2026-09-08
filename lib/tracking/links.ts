export function rewriteLinks(html: string, recipientId: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Match href="..." but skip mailto:, tel:, #, and tracking URLs
  return html.replace(
    /href="(https?:\/\/[^"]+)"/g,
    (match, url) => {
      // Don't rewrite tracking URLs
      if (url.includes('/api/t/')) return match;
      const encoded = encodeURIComponent(url);
      return `href="${base}/api/t/c/${recipientId}?url=${encoded}"`;
    }
  );
}

export function generateUnsubscribeUrl(token: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${base}/unsubscribe?token=${token}`;
}

export function injectUnsubscribeLink(html: string, token: string, baseUrl?: string): string {
  const unsubUrl = generateUnsubscribeUrl(token, baseUrl);
  const unsubHtml = `<div style="text-align:center;margin-top:20px;padding:10px;font-size:12px;color:#999;">
    <a href="${unsubUrl}" style="color:#999;text-decoration:underline;">Unsubscribe</a> from these emails.
  </div>`;

  if (html.includes('</body>')) {
    return html.replace('</body>', `${unsubHtml}</body>`);
  }
  return html + unsubHtml;
}
