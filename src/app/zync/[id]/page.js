"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

export default function DropIdPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [dropType, setDropType] = useState("");
  const [drop, setDrop] = useState(null);
  const [replyName, setReplyName] = useState("");

  // Try fetching from each drop type API, robustly
  const fetchDrop = async () => {
    setLoading(true);
    setError("");
    setDropType("");
    setDrop(null);
    const apis = [
      { type: "note", url: `/api/zync/note?id=${id}` },
      { type: "link", url: `/api/zync/link?id=${id}` },
      { type: "code", url: `/api/zync/code?id=${id}` },
      { type: "file", url: `/api/zync/file?id=${id}` },
    ];
    let found = false;
    for (const api of apis) {
      try {
        const res = await fetch(api.url);
        if (!res.ok) {
          // For debugging
          if (res.status !== 404) {
            const data = await res.json().catch(() => ({}));
            console.error(`API ${api.type} error:`, data.error || res.statusText);
          }
          continue;
        }
        const data = await res.json();
        setDrop(data);
        setDropType(api.type);
        found = true;
        break;
      } catch (err) {
        console.error(`API ${api.type} fetch failed:`, err);
      }
    }
    if (!found) {
      setError("Zync not found");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!id) return;
    fetchDrop();
    // eslint-disable-next-line
  }, [id]);

  async function handleReplySubmit(e) {
    e.preventDefault();
    setReplyLoading(true);
    setReplyError("");
    try {
      let apiUrl = "/api/zync/note";
      let body = { content: replyContent, replyTo: id, name: replyName };
      if (dropType === "link") {
        apiUrl = "/api/zync/link";
        body = { url: replyContent, replyTo: id, name: replyName };
      } else if (dropType === "code") {
        apiUrl = "/api/zync/code";
        body = { code: replyContent, replyTo: id, name: replyName };
      } else if (dropType === "file") {
        apiUrl = "/api/zync/file";
        body = { fileName: "Reply.txt", fileUrl: replyContent, fileSize: replyContent.length, replyTo: id, name: replyName };
      }
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      console.log('Reply API response:', data);
      if (!res.ok) throw new Error(data.error || "Failed to reply");
      setReplyContent("");
      setReplyName("");
      setShowReply(false);
      await fetchDrop();
    } catch (err) {
      setReplyError(err.message || "Something went wrong");
    } finally {
      setReplyLoading(false);
    }
  }

  // Card components for each drop type
  function NameLine({ name }) {
    const trimmed = (name || '').trim();
    const isAnon = !trimmed;
    return (
      <div className="w-full text-center mb-1">
        <span className="text-white/90 text-2xl font-extrabold" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>{isAnon ? 'Anonymous' : trimmed}</span>
      </div>
    );
  }
  function NoteCard({ drop }) {
    return (
      <>
        <div className="text-[#6366f1] text-3xl mb-2" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>📝</div>
        <NameLine name={drop.name} />
        <div className="w-full bg-white/10 rounded-lg px-4 py-3 text-white text-base whitespace-pre-wrap break-words min-h-[80px]" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
          {drop.content}
        </div>
        <div className="text-xs text-white/40 mt-2" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>Created: {new Date(drop.createdAt).toLocaleString()}</div>
      </>
    );
  }
  function LinkCard({ drop }) {
    return (
      <>
        <div className="text-[#f59e42] text-3xl mb-2" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>🔗</div>
        <NameLine name={drop.name} />
        <a href={drop.url} target="_blank" rel="noopener noreferrer" className="w-full bg-white/10 rounded-lg px-4 py-3 text-blue-300 underline break-all hover:text-orange-300 transition-all" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
          {drop.url}
        </a>
        <div className="text-xs text-white/40 mt-2" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>Created: {new Date(drop.createdAt).toLocaleString()}</div>
      </>
    );
  }
  function CodeCard({ drop }) {
    return (
      <>
        <div className="text-[#10b981] text-3xl mb-2" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>🧑‍💻</div>
        <NameLine name={drop.name} />
        <pre className="w-full bg-white/10 rounded-lg px-4 py-3 text-white text-sm overflow-x-auto min-h-[80px]" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
          <code>{drop.code}</code>
        </pre>
        <div className="text-xs text-white/40 mt-2" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>Language: {drop.language || "plaintext"}</div>
        <div className="text-xs text-white/40" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>Created: {new Date(drop.createdAt).toLocaleString()}</div>
      </>
    );
  }
  function FileCard({ drop }) {
    return (
      <>
        <div className="text-[#f472b6] text-3xl mb-2" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>💾</div>
        <NameLine name={drop.name} />
        <a href={drop.fileUrl} download className="w-full bg-white/10 rounded-lg px-4 py-3 text-pink-300 underline break-all hover:text-orange-300 transition-all" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
          {drop.fileName} ({(drop.fileSize / 1024).toFixed(1)} KB)
        </a>
        <div className="text-xs text-white/40 mt-2" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>Created: {new Date(drop.createdAt).toLocaleString()}</div>
      </>
    );
  }

  // Replies for each type
  function Replies() {
    if (!drop.replies || drop.replies.length === 0) return null;
    return (
      <div className="w-full mt-8">
        <div className="text-white/80 text-lg mb-4 font-bold flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
          <span className="text-2xl">💬</span> Replies
        </div>
        <div className="flex flex-col gap-5">
          {drop.replies.map((reply) => (
            <div key={reply._id} className="bg-white/10 rounded-xl px-5 py-4 flex flex-col shadow-md border border-white/10">
              <NameLine name={reply.name} />
              <div className="text-white text-base whitespace-pre-wrap break-words mt-1" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
                {dropType === "note" && reply.content}
                {dropType === "link" && (
                  <a href={reply.url} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline break-all hover:text-orange-300 transition-all" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>{reply.url}</a>
                )}
                {dropType === "code" && (
                  <pre className="text-sm overflow-x-auto" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}><code>{reply.code}</code></pre>
                )}
                {dropType === "file" && (
                  <a href={reply.fileUrl} download className="text-pink-300 underline break-all hover:text-orange-300 transition-all" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>{reply.fileName} ({(reply.fileSize / 1024).toFixed(1)} KB)</a>
                )}
              </div>
              <div className="text-xs text-white/40 mt-2" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>{new Date(reply.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#131118] flex flex-col items-center px-2 py-8" style={{ fontFamily: 'Inter, Space Grotesk, Noto Sans, sans-serif' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-gradient-to-br from-[#2d1a3a]/80 to-[#1a1a2e]/80 rounded-2xl border border-white/10 shadow-lg p-6 sm:p-8 backdrop-blur-md mt-8"
      >
        {loading ? (
          <div className="text-white/80 text-lg text-center">Loading...</div>
        ) : error ? (
          <div className="w-full bg-white/10 rounded-2xl border border-white/20 shadow-lg p-8 flex flex-col items-center gap-4 backdrop-blur-md">
            <div className="text-4xl mb-2" style={{color:'#f472b6'}}>622</div>
            <div className="text-white text-2xl font-extrabold mb-1" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
              Zync Expired
            </div>
            <div className="text-white/70 text-base text-center max-w-xs" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
              Sorry, this Zync is no longer available. Zyncs automatically expire after their set time for privacy and security.
            </div>
          </div>
        ) : drop ? (
          <>
            <div className="flex flex-col gap-4 items-center">
              {dropType === "note" && <NoteCard drop={drop} />}
              {dropType === "link" && <LinkCard drop={drop} />}
              {dropType === "code" && <CodeCard drop={drop} />}
              {dropType === "file" && <FileCard drop={drop} />}
            </div>
            {/* Reply button and always-present textarea */}
            <div className="w-full flex flex-col items-center mt-4">
              <button
                onClick={() => setShowReply(v => !v)}
                className="px-4 py-2 rounded-lg bg-[#6366f1] text-white font-semibold shadow hover:bg-[#4211d4] transition-all duration-150 mb-2"
              >
                {showReply ? "Cancel" : "Reply to this Zync"}
              </button>
              <form
                className={`w-full flex flex-col gap-2 transition-all duration-300 ${showReply ? '' : 'opacity-0 pointer-events-none h-0 overflow-hidden'}`}
                onSubmit={handleReplySubmit}
                style={{ minHeight: showReply ? 120 : 0 }}
              >
                <input
                  type="text"
                  placeholder="Name or handle (optional)"
                  value={replyName}
                  onChange={e => setReplyName(e.target.value)}
                  className="bg-white/5 rounded-lg px-4 py-3 min-h-[80px] text-white placeholder:text-white/50 border-none outline-none focus:ring-2 focus:ring-[#6366f1]"
                  disabled={replyLoading || !showReply}
                />
                <textarea
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  required={showReply}
                  placeholder="Write your reply..."
                  className="bg-white/5 rounded-lg px-4 py-3 min-h-[80px] text-white placeholder:text-white/50 border-none outline-none focus:ring-2 focus:ring-[#6366f1]"
                  disabled={replyLoading || !showReply}
                />
                {replyError && <div className="text-red-400 text-sm font-semibold">{replyError}</div>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition-all"
                    onClick={() => { setShowReply(false); setReplyContent(""); setReplyName(""); }}
                    disabled={replyLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#4211d4] text-white font-bold shadow hover:from-[#4211d4] hover:to-[#6366f1] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={replyLoading || !showReply}
                  >
                    {replyLoading ? "Replying..." : "Reply"}
                  </button>
                </div>
              </form>
            </div>
            {/* Replies */}
            <Replies />
          </>
        ) : null}
      </motion.div>
    </main>
  );
} 