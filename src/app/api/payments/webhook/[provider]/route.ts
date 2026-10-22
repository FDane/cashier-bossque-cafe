export async function POST(request: Request) {
  const signature = request.headers.get("x-provider-signature");
  if (!signature)
    return Response.json({ error: "Missing signature" }, { status: 401 });
  return Response.json({ ok: true, stub: true });
}
