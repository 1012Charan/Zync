"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TABS = [
  { key: "note", label: "Note", icon: "📝" },
  { key: "link", label: "Link", icon: "🔗" },
  { key: "code", label: "Code", icon: "⌨️" },
  { key: "file", label: "File", icon: "📁" },
];

const EXPIRY_OPTIONS = [
  { label: "2 minutes", value: 120 },
  { label: "10 minutes", value: 600 },
  { label: "30 minutes", value: 1800 },
  { label: "1 hour", value: 3600 },
  { label: "6 hours", value: 21600 },
  { label: "12 hours", value: 43200 },
  { label: "1 day (default)", value: 86400 },
  { label: "2 days (max)", value: 172800 },
];

export default function DropPage() {
  const [activeTab, setActiveTab] = useState("note");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [success, setSuccess] = useState(false);
  const [dropId, setDropId] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [codeContent, setCodeContent] = useState("");
  const [codeLang, setCodeLang] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState(86400);
  // FAB hydration-safe state
  const [showFab, setShowFab] = useState(false);
  const [fabPath, setFabPath] = useState("");
  // Refs for main input/textarea
  const noteInputRef = useRef(null);
  const linkInputRef = useRef(null);
  const codeInputRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShowFab(window.innerWidth < 640);
      setFabPath(window.location.pathname);
      const handleResize = () => setShowFab(window.innerWidth < 640);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    // Auto-focus and scroll main input into view on tab change
    if (activeTab === "note" && noteInputRef.current) {
      noteInputRef.current.focus();
      noteInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (activeTab === "link" && linkInputRef.current) {
      linkInputRef.current.focus();
      linkInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (activeTab === "code" && codeInputRef.current) {
      codeInputRef.current.focus();
      codeInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeTab]);

  function handleTabChange(tab) {
    setActiveTab(tab);
    setSuccess(false);
    setDropId("");
    setAccessKey("");
    setError("");
    setNoteTitle("");
    setNoteContent("");
    setLinkUrl("");
    setCodeContent("");
    setCodeLang("");
    setFileName("");
    setFileUrl("");
    setFileSize("");
    setName("");
    setExpiry(86400);
  }

  function vibrate(pattern) {
    if (typeof window !== "undefined" && "vibrate" in window.navigator) {
      window.navigator.vibrate(pattern);
    }
  }

  async function handleNoteSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setCopied(false);
    try {
      const res = await fetch("/api/zync/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteContent, name, expiry, title: noteTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create drop");
      setDropId(data.id);
      setAccessKey(data.accessKey || "");
      setSuccess(true);
      setName("");
      
      // Save to recent Zyncs
      const recentZync = {
        id: data.id,
        type: 'note',
        title: noteTitle,
        content: noteContent,
        createdAt: Date.now(),
        accessKey: data.accessKey
      };
      saveToRecentZyncs(recentZync);
      
      vibrate(30); // Success haptic
    } catch (err) {
      setError(err.message || "Something went wrong");
      vibrate([30, 30, 30]); // Error haptic
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    const url = accessKey 
      ? `${window.location.origin}/zync/${dropId}?key=${accessKey}`
      : `${window.location.origin}/zync/${dropId}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      vibrate(15); // Copy haptic
      setTimeout(() => setCopied(false), 1500);
    } else {
      window.prompt('Copy this link:', url);
    }
  }

  function handleShare() {
    const url = accessKey 
      ? `${window.location.origin}/zync/${dropId}?key=${accessKey}`
      : `${window.location.origin}/zync/${dropId}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Check out this Zync!',
        text: 'I shared something with Zync - a quick way to share notes, links, and code.',
        url: url
      }).catch(() => {
        // Fallback to copy if share fails
        handleCopy();
      });
    } else {
      // Fallback to copy for browsers without Web Share API
      handleCopy();
    }
  }

  function saveToRecentZyncs(zync) {
    try {
      const stored = localStorage.getItem('recentZyncs');
      const recentZyncs = stored ? JSON.parse(stored) : [];
      
      // Remove if already exists (update existing)
      const filtered = recentZyncs.filter(z => z.id !== zync.id);
      
      // Add to beginning
      const updated = [zync, ...filtered].slice(0, 10); // Keep last 10
      
      localStorage.setItem('recentZyncs', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving to recent Zyncs:', e);
    }
  }

  function handleCreateAnother() {
    setSuccess(false);
    setDropId("");
    setAccessKey("");
    setCopied(false);
    setNoteContent("");
    setNoteTitle("");
    setLinkUrl("");
    setCodeContent("");
    setCodeLang("");
    setName("");
    setExpiry(86400);
    vibrate(20); // Success haptic
  }

  async function handleLinkSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setCopied(false);
    try {
      const res = await fetch("/api/zync/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: linkUrl, name, expiry }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create drop");
      setDropId(data.id);
      setAccessKey(data.accessKey || "");
      setSuccess(true);
      setName("");
      
      // Save to recent Zyncs
      const recentZync = {
        id: data.id,
        type: 'link',
        url: linkUrl,
        createdAt: Date.now(),
        accessKey: data.accessKey
      };
      saveToRecentZyncs(recentZync);
      
      vibrate(30); // Success haptic
    } catch (err) {
      setError(err.message || "Something went wrong");
      vibrate([30, 30, 30]); // Error haptic
    } finally {
      setLoading(false);
    }
  }

  async function handleCodeSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setCopied(false);
    try {
      const res = await fetch("/api/zync/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeContent, language: codeLang, name, expiry }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create drop");
      setDropId(data.id);
      setAccessKey(data.accessKey || "");
      setSuccess(true);
      setName("");
      
      // Save to recent Zyncs
      const recentZync = {
        id: data.id,
        type: 'code',
        content: codeContent,
        language: codeLang,
        createdAt: Date.now(),
        accessKey: data.accessKey
      };
      saveToRecentZyncs(recentZync);
      
      vibrate(30); // Success haptic
    } catch (err) {
      setError(err.message || "Something went wrong");
      vibrate([30, 30, 30]); // Error haptic
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#131118] flex flex-col items-center px-2 py-6 sm:py-8" style={{ fontFamily: 'Inter, Space Grotesk, Noto Sans, sans-serif', paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-white text-2xl sm:text-3xl font-bold mb-2 text-center"
      >
        Your Zync is Ready ⚡
        </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="text-white/70 text-base sm:text-lg mb-6 text-center max-w-xl"
      >
        Instantly share notes, links, code, or files. No sign up. No clutter. Just drop and share.
      </motion.p>
      {/* Tabs */}
      <nav className="flex gap-1 sm:gap-4 mb-8 w-full max-w-md justify-center">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`flex-1 flex items-center justify-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl font-semibold text-base sm:text-lg transition-all duration-150
              ${activeTab === tab.key
                ? "bg-gradient-to-r from-[#6366f1]/80 to-[#4211d4]/80 text-white shadow-md border border-white/10"
                : "bg-white/5 text-white/60 hover:bg-white/10 border border-transparent"}
            `}
            onClick={() => handleTabChange(tab.key)}
            aria-label={tab.label}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </nav>
      {/* Card Container */}
      <section className="w-full max-w-md flex-1 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {activeTab === "note" && (
            <motion.div
              key="note"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-[98vw] sm:max-w-md bg-white/10 rounded-2xl border border-white/20 shadow-lg p-4 sm:p-8 backdrop-blur-sm sm:backdrop-blur-md"
            >
              {!success ? (
                <form className="flex flex-col gap-4" onSubmit={handleNoteSubmit}>
                  <input
                    type="text"
                    placeholder="Name or handle (optional)"
                    className="bg-white/5 rounded-lg px-4 sm:px-4 py-3 sm:py-4 text-white placeholder:text-white/50 border-none outline-none focus:ring-2 focus:ring-[#6366f1]"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Title (optional)"
                    className="bg-white/5 rounded-lg px-4 sm:px-4 py-3 sm:py-4 text-white placeholder:text-white/50 border-none outline-none focus:ring-2 focus:ring-[#6366f1]"
                    value={noteTitle}
                    onChange={e => setNoteTitle(e.target.value)}
                  />
                  <textarea
                    ref={noteInputRef}
                    autoFocus={activeTab === "note"}
                    required
                    placeholder="Write your note here..."
                    className="bg-white/5 rounded-lg px-4 sm:px-4 py-3 sm:py-4 min-h-[120px] text-white placeholder:text-white/50 border-none outline-none focus:ring-2 focus:ring-[#6366f1] resize-vertical"
                    value={noteContent}
                    onChange={e => setNoteContent(e.target.value)}
                  />
                  <label className="text-white/80 font-medium mt-2" htmlFor="expiry">
                    Expiry
                    <span className="ml-1 text-xs text-white/50" title="Auto-deletes after time limit. No manual cleanup needed.">🕒</span>
                  </label>
                  <select
                    id="expiry"
                    value={expiry}
                    onChange={e => setExpiry(Number(e.target.value))}
                    className="bg-white/5 rounded-lg px-4 sm:px-4 py-3 sm:py-4 text-white border-none outline-none focus:ring-2 focus:ring-[#6366f1] mt-1"
                  >
                    {EXPIRY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {error && (
                    <div className="text-red-400 text-sm font-semibold">{error}</div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 0 16px 2px #f9a8d4aa" }}
                    whileTap={{ scale: 0.97 }}
                    className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#f472b6]/80 to-[#f9a8d4]/80 text-white font-bold py-4 text-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#f472b6] hover:from-[#f9a8d4]/90 hover:to-[#f472b6]/90 disabled:opacity-60 disabled:cursor-not-allowed border border-white/20 backdrop-blur-sm sm:backdrop-blur-md"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Zync Now"}
                  </motion.button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="text-green-400 text-2xl font-bold">Zync Ready!</div>
                  <div className="w-full flex flex-col items-center gap-2">
                    <div className="bg-white/10 rounded-lg px-4 sm:px-8 py-3 sm:py-4 text-white text-center break-all select-all">
                      {accessKey 
                        ? `${typeof window !== "undefined" ? window.location.origin : ""}/zync/${dropId}?key=${accessKey}`
                        : `${typeof window !== "undefined" ? window.location.origin : ""}/zync/${dropId}`
                      }
                    </div>
                    {success && expiry && (
                      <motion.div
                        initial={{ width: '100%' }}
                        animate={{ width: 0 }}
                        transition={{ duration: expiry, ease: 'linear' }}
                        className="h-2 mt-2 rounded-full bg-gradient-to-r from-[#6366f1] via-[#f472b6] to-[#facc15] shadow-inner"
                        aria-label="Time left until drop expires"
                        role="progressbar"
                        style={{ minWidth: 0 }}
                      />
                    )}
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={handleCopy}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-8 py-4 rounded-lg bg-[#6366f1] text-white font-semibold shadow hover:bg-[#4211d4] transition-all duration-150 ${copied ? "ring-2 ring-green-400" : ""}`}
                      >
                        {copied ? "Copied!" : "Copy Link"}
                      </button>
                      <button
                        onClick={handleShare}
                        className="flex items-center justify-center gap-2 px-3 py-4 rounded-lg bg-[#10b981] text-white font-semibold shadow hover:bg-[#059669] transition-all duration-150"
                        title="Share to social media"
                      >
                        <span className="text-base">📤</span>
                      </button>
                    </div>
                    <button
                      onClick={handleCreateAnother}
                      className="w-full flex items-center justify-center gap-2 px-4 sm:px-8 py-4 rounded-lg bg-white/10 text-white font-semibold shadow hover:bg-white/20 transition-all duration-150 border border-white/20"
                    >
                      <span className="text-lg">⚡</span>
                      Create Another
                    </button>
                    <div className="text-white/70 text-sm mt-2 text-center">Revisit this link to see replies.</div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
          {activeTab === "link" && (
            <motion.div
              key="link"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-[98vw] sm:max-w-md bg-white/10 rounded-2xl border border-white/20 shadow-lg p-4 sm:p-8 backdrop-blur-sm sm:backdrop-blur-md"
            >
              {!success ? (
                <form className="flex flex-col gap-4" onSubmit={handleLinkSubmit}>
                  <input
                    type="text"
                    placeholder="Name or handle (optional)"
                    className="bg-white/5 rounded-lg px-4 sm:px-4 py-3 sm:py-4 text-white placeholder:text-white/50 border-none outline-none focus:ring-2 focus:ring-[#f59e42]"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                  <input
                    ref={linkInputRef}
                    autoFocus={activeTab === "link"}
                    type="url"
                    required
                    placeholder="Paste your link here..."
                    className="bg-white/5 rounded-lg px-4 sm:px-4 py-3 sm:py-4 text-white placeholder:text-white/50 border-none outline-none focus:ring-2 focus:ring-[#f59e42]"
                    value={linkUrl}
                    onChange={e => setLinkUrl(e.target.value)}
                  />
                  <label className="text-white/80 font-medium mt-2" htmlFor="expiry">
                    Expiry
                    <span className="ml-1 text-xs text-white/50" title="Auto-deletes after time limit. No manual cleanup needed.">🕒</span>
                  </label>
                  <select
                    id="expiry"
                    value={expiry}
                    onChange={e => setExpiry(Number(e.target.value))}
                    className="bg-white/5 rounded-lg px-4 sm:px-4 py-3 sm:py-4 text-white border-none outline-none focus:ring-2 focus:ring-[#6366f1] mt-1"
                  >
                    {EXPIRY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {error && (
                    <div className="text-red-400 text-sm font-semibold">{error}</div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 0 16px 2px #d9f99daa" }}
                    whileTap={{ scale: 0.97 }}
                    className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#a3e635]/80 to-[#d9f99d]/80 text-white font-bold py-4 text-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#a3e635] hover:from-[#d9f99d]/90 hover:to-[#a3e635]/90 disabled:opacity-60 disabled:cursor-not-allowed border border-white/20 backdrop-blur-sm sm:backdrop-blur-md"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Zync Now"}
                  </motion.button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="text-green-400 text-2xl font-bold">Zync Ready!</div>
                  <div className="w-full flex flex-col items-center gap-2">
                    <div className="bg-white/10 rounded-lg px-4 sm:px-8 py-3 sm:py-4 text-white text-center break-all select-all">
                      {accessKey 
                        ? `${typeof window !== "undefined" ? window.location.origin : ""}/zync/${dropId}?key=${accessKey}`
                        : `${typeof window !== "undefined" ? window.location.origin : ""}/zync/${dropId}`
                      }
                    </div>
                    {success && expiry && (
                      <motion.div
                        initial={{ width: '100%' }}
                        animate={{ width: 0 }}
                        transition={{ duration: expiry, ease: 'linear' }}
                        className="h-2 mt-2 rounded-full bg-gradient-to-r from-[#6366f1] via-[#f472b6] to-[#facc15] shadow-inner"
                        aria-label="Time left until drop expires"
                        role="progressbar"
                        style={{ minWidth: 0 }}
                      />
                    )}
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={handleCopy}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-8 py-4 rounded-lg bg-[#f59e42] text-white font-semibold shadow hover:bg-[#fbbf24] transition-all duration-150 ${copied ? "ring-2 ring-green-400" : ""}`}
                      >
                        {copied ? "Copied!" : "Copy Link"}
                      </button>
                      <button
                        onClick={handleShare}
                        className="flex items-center justify-center gap-2 px-3 py-4 rounded-lg bg-[#10b981] text-white font-semibold shadow hover:bg-[#059669] transition-all duration-150"
                        title="Share to social media"
                      >
                        <span className="text-base">📤</span>
                      </button>
                    </div>
                    <button
                      onClick={handleCreateAnother}
                      className="w-full flex items-center justify-center gap-2 px-4 sm:px-8 py-4 rounded-lg bg-white/10 text-white font-semibold shadow hover:bg-white/20 transition-all duration-150 border border-white/20"
                    >
                      <span className="text-lg">⚡</span>
                      Create Another
                    </button>
                    <div className="text-white/70 text-sm mt-2 text-center">Revisit this link to see replies.</div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
          {activeTab === "code" && (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-[98vw] sm:max-w-md bg-white/10 rounded-2xl border border-white/20 shadow-lg p-4 sm:p-8 backdrop-blur-sm sm:backdrop-blur-md"
            >
              {!success ? (
                <form className="flex flex-col gap-4" onSubmit={handleCodeSubmit}>
                  <input
                    type="text"
                    placeholder="Name or handle (optional)"
                    className="bg-white/5 rounded-lg px-4 sm:px-4 py-3 sm:py-4 text-white placeholder:text-white/50 border-none outline-none focus:ring-2 focus:ring-[#10b981]"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                  <textarea
                    ref={codeInputRef}
                    autoFocus={activeTab === "code"}
                    required
                    placeholder="Paste your code here..."
                    className="bg-white/5 rounded-lg px-4 sm:px-4 py-3 sm:py-4 min-h-[100px] text-white placeholder:text-white/50 border-none outline-none focus:ring-2 focus:ring-[#10b981]"
                    value={codeContent}
                    onChange={e => setCodeContent(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Language (e.g. javascript)"
                    className="bg-white/5 rounded-lg px-4 sm:px-4 py-3 sm:py-4 text-white placeholder:text-white/50 border-none outline-none focus:ring-2 focus:ring-[#10b981]"
                    value={codeLang}
                    onChange={e => setCodeLang(e.target.value)}
                  />
                  <label className="text-white/80 font-medium mt-2" htmlFor="expiry">
                    Expiry
                    <span className="ml-1 text-xs text-white/50" title="Auto-deletes after time limit. No manual cleanup needed.">🕒</span>
                  </label>
                  <select
                    id="expiry"
                    value={expiry}
                    onChange={e => setExpiry(Number(e.target.value))}
                    className="bg-white/5 rounded-lg px-4 sm:px-4 py-3 sm:py-4 text-white border-none outline-none focus:ring-2 focus:ring-[#6366f1] mt-1"
                  >
                    {EXPIRY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {error && (
                    <div className="text-red-400 text-sm font-semibold">{error}</div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 0 16px 2px #fef9c3aa" }}
                    whileTap={{ scale: 0.97 }}
                    className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#facc15]/80 to-[#fef9c3]/80 text-white font-bold py-4 text-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#facc15] hover:from-[#fef9c3]/90 hover:to-[#facc15]/90 disabled:opacity-60 disabled:cursor-not-allowed border border-white/20 backdrop-blur-sm sm:backdrop-blur-md"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Zync Now"}
                  </motion.button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="text-green-400 text-2xl font-bold">Zync Ready!</div>
                  <div className="w-full flex flex-col items-center gap-2">
                    <div className="bg-white/10 rounded-lg px-4 sm:px-8 py-3 sm:py-4 text-white text-center break-all select-all">
                      {accessKey 
                        ? `${typeof window !== "undefined" ? window.location.origin : ""}/zync/${dropId}?key=${accessKey}`
                        : `${typeof window !== "undefined" ? window.location.origin : ""}/zync/${dropId}`
                      }
                    </div>
                    {success && expiry && (
                      <motion.div
                        initial={{ width: '100%' }}
                        animate={{ width: 0 }}
                        transition={{ duration: expiry, ease: 'linear' }}
                        className="h-2 mt-2 rounded-full bg-gradient-to-r from-[#6366f1] via-[#f472b6] to-[#facc15] shadow-inner"
                        aria-label="Time left until drop expires"
                        role="progressbar"
                        style={{ minWidth: 0 }}
                      />
                    )}
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={handleCopy}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-8 py-4 rounded-lg bg-[#10b981] text-white font-semibold shadow hover:bg-[#059669] transition-all duration-150 ${copied ? "ring-2 ring-green-400" : ""}`}
                      >
                        {copied ? "Copied!" : "Copy Link"}
                      </button>
                      <button
                        onClick={handleShare}
                        className="flex items-center justify-center gap-2 px-3 py-4 rounded-lg bg-[#6366f1] text-white font-semibold shadow hover:bg-[#4211d4] transition-all duration-150"
                        title="Share to social media"
                      >
                        <span className="text-base">📤</span>
                      </button>
                    </div>
                    <button
                      onClick={handleCreateAnother}
                      className="w-full flex items-center justify-center gap-2 px-4 sm:px-8 py-4 rounded-lg bg-white/10 text-white font-semibold shadow hover:bg-white/20 transition-all duration-150 border border-white/20"
                    >
                      <span className="text-lg">⚡</span>
                      Create Another
                    </button>
                    <div className="text-white/70 text-sm mt-2 text-center">Revisit this link to see replies.</div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
          {activeTab === "file" && (
            <motion.div
              key="file"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-[98vw] sm:max-w-md bg-white/10 rounded-2xl border border-white/20 shadow-lg p-4 sm:p-8 backdrop-blur-sm sm:backdrop-blur-md flex flex-col items-center justify-center min-h-[180px]"
            >
              <div className="text-4xl mb-2">🚧</div>
              <div className="text-white/80 text-lg text-center font-semibold">File Uploads<br/>Coming soon!</div>
              <div className="text-white/50 text-sm mt-2 text-center">Secure file uploads and sharing are on the way.</div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
      {/* How it works section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="w-full max-w-md mt-10 flex flex-col items-center"
      >
        <div className="bg-white/10 rounded-2xl border border-white/20 shadow-lg p-4 sm:p-8 backdrop-blur-sm sm:backdrop-blur-md w-full">
          <h2 className="text-white text-lg font-bold mb-4 text-center">How it works</h2>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between items-center">
            <div className="flex flex-col items-center flex-1">
              <div className="text-2xl mb-2">📝</div>
              <div className="text-white/80 text-sm text-center">1. Paste your note, link, code, or file</div>
            </div>
            <div className="flex flex-col items-center flex-1">
              <div className="text-2xl mb-2">🔗</div>
              <div className="text-white/80 text-sm text-center">2. Get a unique shareable link</div>
            </div>
            <div className="flex flex-col items-center flex-1">
              <div className="text-2xl mb-2">🚀</div>
              <div className="text-white/80 text-sm text-center">3. Send it. No sign up, no clutter</div>
            </div>
          </div>
        </div>
      </motion.section>
      {/* Sticky FAB for mobile */}
      {showFab && (
        <button
          onClick={() => {
            if (fabPath === "/zync") {
              window.location.href = "/zync";
            } else {
              window.location.href = "/zync";
            }
          }}
          aria-label={fabPath === "/zync" ? "Back to Home" : "Start a Zync"}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 sm:hidden bg-gradient-to-r from-[#6366f1] to-[#4211d4] text-white rounded-full shadow-lg flex items-center justify-center w-16 h-16 text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-[#6366f1] animate-bounce"
          style={{ boxShadow: '0 4px 24px 0 #6366f155', transition: 'background 0.2s', bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}
        >
          {fabPath === "/zync" ? (
            // Modern filled home icon, white
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 11.5L12 4l9 7.5V20a1 1 0 01-1 1h-5a1 1 0 01-1-1v-4h-4v4a1 1 0 01-1 1H4a1 1 0 01-1-1V11.5z"/>
            </svg>
          ) : (
            // Plus icon
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
          )}
        </button>
      )}
    </main>
  );
} 