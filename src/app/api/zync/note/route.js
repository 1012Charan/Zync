import clientPromise from "@/lib/mongodb";

function generateId(length = 8) {
  return Math.random().toString(36).substr(2, length);
}

export async function POST(req) {
  let rawBody = null;
  let parsedBody = null;
  try {
    rawBody = await req.text();
    console.log("[DEBUG] Raw request body:", rawBody);
    try {
      parsedBody = JSON.parse(rawBody);
    } catch (err) {
      console.error("[DEBUG] JSON parse error:", err);
      return new Response(JSON.stringify({ error: "Malformed JSON", details: String(err) }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.log("[DEBUG] Parsed body:", parsedBody);
    const { content, replyTo, name, expiry } = parsedBody;
    if (!content || typeof content !== "string" || !content.trim()) {
      return new Response(JSON.stringify({ error: "Note content required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const id = generateId();
    const now = Date.now();
    const expiresAt = expiry ? now + Number(expiry) * 1000 : now + 86400 * 1000;
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    await db.collection("notes").insertOne({
      _id: id,
      content,
      createdAt: now,
      expiresAt,
      ...(name ? { name: name.trim() } : {}),
      ...(replyTo ? { replyTo } : {}),
    });
    return new Response(JSON.stringify({ id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[DEBUG] Unhandled error in POST /api/zync/note:", err, { rawBody, parsedBody });
    return new Response(JSON.stringify({ error: "Invalid request", details: String(err) }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const note = await db.collection("notes").findOne({ _id: id });
  if (!note) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (note.expiresAt && Date.now() > note.expiresAt) {
    // Optionally: await db.collection("notes").deleteOne({ _id: id });
    return new Response(JSON.stringify({ error: "Zync expired" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  // Fetch replies
  const replies = await db.collection("notes").find({ replyTo: id }).sort({ createdAt: 1 }).toArray();
  console.log('GET /api/zync/note', { id, replies });
  const { ...rest } = note;
  return new Response(JSON.stringify({ ...rest, replies }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
} 