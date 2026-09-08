import { describe, it, expect } from 'vitest';

describe('Tracking Pixel', () => {
  it('should export tracking pixel buffer', async () => {
    const { TRACKING_PIXEL } = await import('@/lib/tracking/pixel');
    expect(TRACKING_PIXEL).toBeInstanceOf(Buffer);
    expect(TRACKING_PIXEL.length).toBeGreaterThan(0);
  });

  it('should generate tracking pixel URL', async () => {
    const { generateTrackingPixelUrl } = await import('@/lib/tracking/pixel');
    const url = generateTrackingPixelUrl('test-id', 'https://example.com');
    expect(url).toBe('https://example.com/api/t/o/test-id');
  });

  it('should inject tracking pixel before </body>', async () => {
    const { injectTrackingPixel } = await import('@/lib/tracking/pixel');
    const html = '<html><body><p>Hello</p></body></html>';
    const result = injectTrackingPixel(html, 'rid-123', 'https://example.com');
    expect(result).toContain('src="https://example.com/api/t/o/rid-123"');
    expect(result).toContain('</body>');
    expect(result.indexOf('img')).toBeLessThan(result.indexOf('</body>'));
  });

  it('should append pixel if no </body> tag', async () => {
    const { injectTrackingPixel } = await import('@/lib/tracking/pixel');
    const html = '<p>Simple HTML</p>';
    const result = injectTrackingPixel(html, 'rid-456', 'https://example.com');
    expect(result).toContain('src="https://example.com/api/t/o/rid-456"');
  });
});

describe('Link Rewriting', () => {
  it('should rewrite links for click tracking', async () => {
    const { rewriteLinks } = await import('@/lib/tracking/links');
    const html = '<a href="https://example.com/page">Click</a>';
    const result = rewriteLinks(html, 'rid-789', 'https://track.example.com');
    expect(result).toContain('track.example.com/api/t/c/rid-789');
    expect(result).toContain('url=');
  });

  it('should not rewrite tracking URLs', async () => {
    const { rewriteLinks } = await import('@/lib/tracking/links');
    const html = '<a href="https://example.com/api/t/o/123">Pixel</a>';
    const result = rewriteLinks(html, 'rid-789', 'https://example.com');
    expect(result).toBe(html);
  });

  it('should generate unsubscribe URL', async () => {
    const { generateUnsubscribeUrl } = await import('@/lib/tracking/links');
    const url = generateUnsubscribeUrl('token-abc', 'https://example.com');
    expect(url).toBe('https://example.com/unsubscribe?token=token-abc');
  });

  it('should inject unsubscribe link', async () => {
    const { injectUnsubscribeLink } = await import('@/lib/tracking/links');
    const html = '<html><body><p>Content</p></body></html>';
    const result = injectUnsubscribeLink(html, 'token-xyz', 'https://example.com');
    expect(result).toContain('Unsubscribe');
    expect(result).toContain('token=token-xyz');
  });
});
