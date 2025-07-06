import clientPromise from "@/lib/mongodb";

function generateId(length = 8) {
  return Math.random().toString(36).substr(2, length);
}

function generateAccessKey(length = 6) {
  return Math.random().toString(36).substr(2, length);
}

export async function POST(req) {
  try {
    const { url, content, replyTo, name, expiry } = await req.json();
    // If replying, allow content as reply; otherwise, require url
    if (replyTo && !content) {
      return new Response(JSON.stringify({ error: "Reply content required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (!replyTo && (!url || typeof url !== "string" || !url.trim())) {
      return new Response(JSON.stringify({ error: "Link URL required" }), {
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
    if (replyTo) {
      // Insert reply to a link
      await db.collection("links").insertOne({
        _id: id,
        content,
        replyTo,
        createdAt: now,
        expiresAt,
        ...(name ? { name: name.trim() } : {}),
      });
    } else {
      // Insert new link
      await db.collection("links").insertOne({
        _id: id,
        accessKey,
        url: url.trim(),
        createdAt: now,
        expiresAt,
        ...(name ? { name: name.trim() } : {}),
      });
    }
    return new Response(JSON.stringify({ id, accessKey: replyTo ? undefined : accessKey }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const accessKey = searchParams.get("key");
  
  if (!id) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  
  // Find link by ID
  const link = await db.collection("links").findOne({ _id: id });
  if (!link) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  // Check if link has access key protection
  if (link.accessKey) {
    if (!accessKey || accessKey !== link.accessKey) {
      return new Response(JSON.stringify({ error: "Access denied" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  
  if (link.expiresAt && Date.now() > link.expiresAt) {
    // Optionally: await db.collection("links").deleteOne({ _id: id });
    return new Response(JSON.stringify({ error: "Zync expired" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  // Fetch replies
  const replies = await db.collection("links").find({ replyTo: id }).sort({ createdAt: 1 }).toArray();
  const { accessKey: _, ...rest } = link;
  return new Response(JSON.stringify({ ...rest, replies }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
} 