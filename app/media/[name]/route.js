import { media } from '../../../server/api.mjs';
export const runtime = 'nodejs';
export async function GET(req, { params }) {
  return media((await params).name);
}
