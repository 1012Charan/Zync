# Zync

A straightforward way to share notes, links, and code. No sign-up, no clutter. Just type, share, and move on.

## 🌐 Live Demo

[Demo Link](https://zync.vercel.app) <!-- Replace with your actual URL if different -->

## Features

- Share notes, links, or code with a single click
- Clean and modern UI (Tailwind CSS + Framer Motion)
- Unique URL for every share
- Optional expiry times (10 mins to 48 hours)
- Anonymous replies supported
- Responsive and mobile-friendly
- Dark mode support

## Tech Stack

- **Frontend:** React + Next.js 15 (App Router)
- **Styling:** Tailwind CSS, Framer Motion
- **Backend:** Node.js, MongoDB
- **Hosting:** Vercel

## Getting Started

To run this project locally:

```bash
git clone https://github.com/1012Charan/ZYNC.git
cd ZYNC
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
zync-nextjs/
├── src/
│   ├── app/         # Main app pages & API routes
│   ├── components/  # Reusable UI components
│   └── lib/         # Utilities (e.g. MongoDB connection)
├── public/          # Static assets (SVGs, icons, etc.)
├── styles/          # Global and extra styles
├── pages/           # (Legacy Next.js pages, if any)
├── ...config files
```

## Roadmap / To-Do

- [x] Note / link / code support
- [x] Custom expiry logic
- [x] Anonymous replies
- [x] Dark mode
- [ ] File sharing (in progress)
- [ ] Real-time replies
- [ ] AI suggestions (future)

## Why Zync?

Built to make sharing quick and easy, especially for temporary or one-off content. Useful for students, teams, or anyone who wants a simple way to share something without extra steps.

## Contact

Created by [Charan Vengala](https://github.com/1012Charan)

---

© 2025 Charan Vengala
