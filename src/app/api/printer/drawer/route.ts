import { requireSession } from "@/lib/auth/server";
export async function POST(request: Request) {
  await requireSession();
  const url = process.env.PRINTER_SERVER_URL;
  if (!url)
    return Response.json(
      { ok: false, reason: "Printer server not configured" },
      { status: 503 },
    );
  const response = await fetch(`${url}/drawer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-secret": process.env.PRINTER_API_SECRET ?? "",
    },
    body: await request.text(),
  });
  return new Response(await response.text(), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
