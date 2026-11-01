import { handle } from '../../../server/api.mjs';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
async function route(request, { params }) {
  const { path } = await params;
  return handle(request, path.join('/'));
}
export { route as GET, route as POST };
