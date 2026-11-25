import { NextRequest, NextResponse } from 'next/server';
import { AFFILIATE_PARTNERS } from '@/lib/affiliate/partners';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ partner: string }> }
) {
  const { partner: rawPartner } = await context.params;
  const partnerId = (rawPartner || '').toLowerCase().trim();
  const partner = AFFILIATE_PARTNERS[partnerId] || AFFILIATE_PARTNERS.nordvpn;

  // Custom environment variable check (allows user to drop in their affiliate link anytime)
  const envUrl = process.env[partner.envVar];
  const targetUrl = envUrl && envUrl.startsWith('http') ? envUrl : partner.defaultUrl;

  const response = NextResponse.redirect(targetUrl, 307);
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}
