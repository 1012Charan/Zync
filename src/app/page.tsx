"use client";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col bg-[#131118] overflow-x-hidden" style={{ fontFamily: 'Space Grotesk, Noto Sans, sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 sm:px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Hero Section */}
            <section className="@container" aria-label="Hero">
              <div className="@[480px]:p-4">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-lg items-start justify-end px-4 pb-10 @[480px]:px-10 backdrop-blur-md bg-white/10 border border-white/10 shadow-2xl"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url(https://lh3.googleusercontent.com/aida-public/AB6AXuC6ABv4nhQ85ycxKEBn8ovE8_nIYGv5OD2Womm_o-c5dCEk_uM9VV3w6Ofqyd5m7jz8xefUMkLeHJR4aJhp9yF2c50WyrB_TpuUoYwV48nAtzP2AFJTV-2ieNNfbl5z34U8yEFp1iFdmGyOBkSkS0EzAHwSaC2wVABEgudMVDCpgAZcUFj7tfUX33e9TiRBWTFDqpi_AO3uRsrCdGKCH79nE_RjFDUj1AnBnOTYKZrLYfemllI1lBJCrHe94Q8Unn3TpmbAtNpD0Rk)'
                  }}
                >
                  <div className="flex flex-col gap-2 text-left">
                    <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                      Zync Anything. Share Instantly.
                    </h1>
                    {/* Gradient accent bar */}
                    <div className="h-1 w-24 rounded-full bg-gradient-to-r from-[#6366f1] via-[#ff6a3d] to-[#a3e635] mb-2 mt-1" />
                    <h2 className="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                      One-click disposable spaces for sharing files, links, notes, and code. No signup.
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 24px 4px #ff6a3d55" }}
                    whileTap={{ scale: 0.97 }}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 border-2 border-[#6366f1] text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] shadow-lg transition-all duration-200 hover:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:ring-offset-2 mt-4 backdrop-blur-md"
                    aria-label="Create a Zync"
                    onClick={() => window.location.href = '/zync'}
                  >
                    <span className="truncate">Create a Zync</span>
                  </motion.button>
                </motion.div>
        </div>
            </section>
            {/* Features Section */}
            <section aria-label="Features">
              <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Features</h2>
              <div className="flex flex-col gap-10 px-4 py-10 @container">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 p-0">
                  {/* Feature Cards */}
                  {[
                    {
                      color: "#a3e635",
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M137.54,186.36a8,8,0,0,1,0,11.31l-9.94,10A56,56,0,0,1,48.38,128.4L72.5,104.28A56,56,0,0,1,149.31,102a8,8,0,1,1-10.64,12,40,40,0,0,0-54.85,1.63L59.7,139.72a40,40,0,0,0,56.58,56.58l9.94-9.94A8,8,0,0,1,137.54,186.36Zm70.08-138a56.08,56.08,0,0,0-79.22,0l-9.94,9.95a8,8,0,0,0,11.32,11.31l9.94-9.94a40,40,0,0,1,56.58,56.58L172.18,140.4A40,40,0,0,1,117.33,142,8,8,0,1,0,106.69,154a56,56,0,0,0,76.81-2.26l24.12-24.12A56.08,56.08,0,0,0,207.62,48.38Z" /></svg>
                      ),
                      title: "Smart Link Sharing",
                      desc: "Share links with smart previews and customizable options."
                    },
                    {
                      color: "#38bdf8",
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z" /></svg>
                      ),
                      title: "Drag & Zync Files",
                      desc: "Easily upload files with a simple drag and zync interface."
                    },
                    {
                      color: "#f472b6",
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M88,96a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,96Zm8,40h64a8,8,0,0,0,0-16H96a8,8,0,0,0,0,16Zm32,16H96a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16ZM224,48V156.69A15.86,15.86,0,0,1,219.31,168L168,219.31A15.86,15.86,0,0,1,156.69,224H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48ZM48,208H152V160a8,8,0,0,1,8-8h48V48H48Zm120-40v28.7L196.69,168Z" /></svg>
                      ),
                      title: "Instant Notes",
                      desc: "Create and share notes instantly without any hassle."
                    },
                    {
                      color: "#facc15",
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M69.12,94.15,28.5,128l40.62,33.85a8,8,0,1,1-10.24,12.29l-48-40a8,8,0,0,1,0-12.29l48-40a8,8,0,0,1,10.24,12.3Zm176,27.7-48-40a8,8,0,1,0-10.24,12.3L227.5,128l-40.62,33.85a8,8,0,1,0,10.24,12.29l48-40a8,8,0,0,0,0-12.29ZM162.73,32.48a8,8,0,0,0-10.25,4.79l-64,176a8,8,0,0,0,4.79,10.26A8.14,8.14,0,0,0,96,224a8,8,0,0,0,7.52-5.27l64-176A8,8,0,0,0,162.73,32.48Z" /></svg>
                      ),
                      title: "Paste & Share Code",
                      desc: "Share code snippets with syntax highlighting and easy copying."
                    }
                  ].map((f, i) => (
                    <motion.div
                      key={f.title}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.5 + i * 0.1, ease: 'easeOut' }}
                      className="flex flex-1 gap-3 rounded-xl border border-[#3a2e5a] bg-gradient-to-br from-[#2d1a3a]/80 to-[#1a1a2e]/80 p-6 flex-col shadow-lg backdrop-blur-md hover:scale-[1.03] hover:shadow-2xl hover:border-[var(--tw-prose-bullets)] transition-all duration-200 group"
                      style={{ boxShadow: `0 4px 32px 0 ${f.color}22` }}
                      tabIndex={0}
                      aria-label={f.title}
                    >
                      <div className="" style={{ color: f.color }}>{f.icon}</div>
                      <div className="flex flex-col gap-1">
                        <h2 className="text-white text-base font-bold leading-tight">{f.title}</h2>
                        <p className="text-[#d1c4e9] text-sm font-normal leading-normal">{f.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
            {/* How It Works Section */}
            <section aria-label="How It Works">
              <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">How It Works</h2>
              <div className="grid grid-cols-[40px_1fr] gap-x-2 px-4">
                {/* Step 1 */}
                <div className="flex flex-col items-center gap-1 pt-5">
                  <div className="size-2 rounded-full bg-white"></div>
                  <div className="w-[1.5px] bg-[#413b54] h-4 grow"></div>
                </div>
                <div className="flex flex-1 flex-col py-3">
                  <p className="text-white text-base font-medium leading-normal">Create a Zync</p>
                  <p className="text-[#a49db9] text-base font-normal leading-normal">Create a temporary space for your content.</p>
                </div>
                {/* Step 2 */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-[1.5px] bg-[#413b54] h-4"></div>
                  <div className="size-2 rounded-full bg-white"></div>
                  <div className="w-[1.5px] bg-[#413b54] h-4 grow"></div>
                </div>
                <div className="flex flex-1 flex-col py-3">
                  <p className="text-white text-base font-medium leading-normal">Share the Link</p>
                  <p className="text-[#a49db9] text-base font-normal leading-normal">Share the unique link with your intended recipients.</p>
                </div>
                {/* Step 3 */}
                <div className="flex flex-col items-center gap-1 pb-3">
                  <div className="w-[1.5px] bg-[#413b54] h-4"></div>
                  <div className="size-2 rounded-full bg-white"></div>
                </div>
                <div className="flex flex-1 flex-col py-3">
                  <p className="text-white text-base font-medium leading-normal">Content Vanishes</p>
                  <p className="text-[#a49db9] text-base font-normal leading-normal">Once accessed, the content automatically disappears.</p>
                </div>
              </div>
            </section>
            {/* Footer */}
            <footer className="flex flex-col gap-6 px-5 py-10 text-center @container" aria-label="Footer">
              <div className="flex flex-wrap justify-center gap-4">
                <a href="https://github.com/1012Charan" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <div className="text-[#a49db9] transition-transform duration-200 hover:scale-110 hover:text-[#6366f1] focus:outline-none focus:ring-2 focus:ring-[#6366f1] rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.35a8,8,0,0,0,6.74-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8.09,8.09,0,0,0,1,7.65A41.72,41.72,0,0,1,200,104Z" />
                    </svg>
                  </div>
                </a>
                <a href="https://www.linkedin.com/in/charanvengala/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <div className="text-[#a49db9] transition-transform duration-200 hover:scale-110 hover:text-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#38bdf8] rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M216,24H40A16,16,0,0,0,24,40V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V40A16,16,0,0,0,216,24Zm0,192H40V40H216V216ZM96,112v64a8,8,0,0,1-16,0V112a8,8,0,0,1,16,0Zm88,28v36a8,8,0,0,1-16,0V140a20,20,0,0,0-40,0v36a8,8,0,0,1-16,0V112a8,8,0,0,1,15.79-1.78A36,36,0,0,1,184,140ZM100,84A12,12,0,1,1,88,72,12,12,0,0,1,100,84Z" />
                    </svg>
                  </div>
                </a>
              </div>
              <p className="text-[#a49db9] text-base font-normal leading-normal">&copy; 2025 Charan Vengala — Built Zync for the fastest drop-to-share on the web.</p>
      </footer>
    </div>
        </div>
      </div>
    </main>
  );
}
