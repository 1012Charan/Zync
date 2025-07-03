import clientPromise from "@/lib/mongodb";

function generateId(length = 8) {
  return Math.random().toString(36).substr(2, length);
}

export async function POST(req) {
  try {
    const { code, language, replyTo, name, expiry } = await req.json();
    if (!code || typeof code !== "string" || !code.trim()) {
      return new Response(JSON.stringify({ error: "Code content required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const id = generateId();
    const now = Date.now();
    const expiresAt = expiry ? now + Number(expiry) * 1000 : now + 86400 * 1000;
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    await db.collection("codes").insertOne({
      _id: id,
      code,
      language: language || "plaintext",
      createdAt: now,
      expiresAt,
      ...(name ? { name: name.trim() } : {}),
      ...(replyTo ? { replyTo } : {}),
    });
    return new Response(JSON.stringify({ id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const code = await db.collection("codes").findOne({ _id: id });
    if (!code) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (code.expiresAt && Date.now() > code.expiresAt) {
      // Optionally: await db.collection("codes").deleteOne({ _id: id });
      return new Response(JSON.stringify({ error: "Zync expired" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    // Fetch replies to this code
    const replies = await db.collection("codes").find({ replyTo: id }).sort({ createdAt: 1 }).toArray();
    return new Response(JSON.stringify({ ...code, replies }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 