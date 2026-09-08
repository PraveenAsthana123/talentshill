// 1x1 transparent GIF (43 bytes)
export const TRACKING_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export function generateTrackingPixelUrl(recipientId: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${base}/api/t/o/${recipientId}`;
}

export function injectTrackingPixel(html: string, recipientId: string, baseUrl?: string): string {
  const pixelUrl = generateTrackingPixelUrl(recipientId, baseUrl);
  const pixelTag = `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none" />`;

  // Try to inject before </body>
  if (html.includes('</body>')) {
    return html.replace('</body>', `${pixelTag}</body>`);
  }
  // Fallback: append at end
  return html + pixelTag;
}
