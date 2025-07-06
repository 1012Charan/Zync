import clientPromise from "@/lib/mongodb";

function generateId(length = 8) {
  return Math.random().toString(36).substr(2, length);
}

function generateAccessKey(length = 6) {
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
    const accessKey = generateAccessKey();
    const now = Date.now();
    const expiresAt = expiry ? now + Number(expiry) * 1000 : now + 86400 * 1000;
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    await db.collection("codes").insertOne({
      _id: id,
      accessKey,
      code,
      language: language || "plaintext",
      createdAt: now,
      expiresAt,
      ...(name ? { name: name.trim() } : {}),
      ...(replyTo ? { replyTo } : {}),
    });
    return new Response(JSON.stringify({ id, accessKey: replyTo ? undefined : accessKey }), {
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
  const accessKey = searchParams.get("key");
  
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Find code by ID
    const code = await db.collection("codes").findOne({ _id: id });
    if (!code) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Check if code has access key protection
    if (code.accessKey) {
      if (!accessKey || accessKey !== code.accessKey) {
        return new Response(JSON.stringify({ error: "Access denied" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
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
    const { accessKey: _, ...rest } = code;
    return new Response(JSON.stringify({ ...rest, replies }), {
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