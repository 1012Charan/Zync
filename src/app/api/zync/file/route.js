import clientPromise from "@/lib/mongodb";

function generateId(length = 8) {
  return Math.random().toString(36).substr(2, length);
}

function generateAccessKey(length = 6) {
  return Math.random().toString(36).substr(2, length);
}

export async function POST(req) {
  try {
    const { fileName, fileSize, fileUrl, replyTo, name, expiry } = await req.json();
    if (!fileName || !fileUrl) {
      return new Response(JSON.stringify({ error: "File name and URL required" }), {
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
    await db.collection("files").insertOne({
      _id: id,
      accessKey,
      fileName,
      fileSize: fileSize || 0,
      fileUrl,
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
    
    // Find file by ID
    const file = await db.collection("files").findOne({ _id: id });
    if (!file) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Check if file has access key protection
    if (file.accessKey) {
      if (!accessKey || accessKey !== file.accessKey) {
        return new Response(JSON.stringify({ error: "Access denied" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    
    if (file.expiresAt && Date.now() > file.expiresAt) {
      // Optionally: await db.collection("files").deleteOne({ _id: id });
      return new Response(JSON.stringify({ error: "Zync expired" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Fetch replies to this file
    const replies = await db.collection("files").find({ replyTo: id }).sort({ createdAt: 1 }).toArray();
    const { accessKey: _, ...rest } = file;
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