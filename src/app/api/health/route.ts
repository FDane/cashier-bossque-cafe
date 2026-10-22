import { requireSession, jsonError } from "@/lib/auth/server";
export async function GET() {
  try { await requireSession(); } catch (error) { return jsonError(error); }
  return Response.json({
    ok: true,
    service: "bossque-cafe-pos",
    timestamp: new Date().toISOString(),
  });
}
