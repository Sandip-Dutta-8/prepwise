# PrepWise 🎯

**An AI-powered mock interview marketplace that connects candidates with realistic, on-demand interview practice — powered by AI-generated questions, live video sessions, and instant feedback.**

🔗 **Live App:** [prepwise-ten-tawny.vercel.app](https://prepwise-ten-tawny.vercel.app)
📦 **Repository:** [github.com/Sandip-Dutta-8/prepwise](https://github.com/Sandip-Dutta-8/prepwise)

---

## 📖 Overview

Landing a job often comes down to interview performance — yet most candidates only get real practice during the interviews that actually matter. **PrepWise** solves this by giving candidates a realistic, low-stakes environment to rehearse technical and behavioral interviews, get AI-generated questions tailored to a role, join live video interview sessions, chat in real time, and receive structured feedback they can act on before the real thing.

Rather than being a generic CRUD app, PrepWise is built as a full **marketplace/practice platform**: it combines authentication and role-based access, real-time video and chat infrastructure, generative AI, and transactional email — all wired into a production-style Next.js 16 architecture with PostgreSQL as the source of truth.

## 🎯 Problem It Solves

- **Interview anxiety & lack of practice** — Candidates rarely get to rehearse in conditions similar to a real interview (live video, real-time Q&A, structured feedback).
- **Generic prep resources** — Static question banks don't adapt to a candidate's target role or experience level.
- **Fragmented tooling** — Practicing usually means stitching together a video call app, a separate question bank, and self-graded notes. PrepWise unifies scheduling, live interviewing, AI-assisted question generation, and feedback into a single platform.
- **No feedback loop** — Without structured, consistent feedback, candidates repeat the same mistakes. PrepWise closes that loop with AI-assisted evaluation.

## ✨ Features

- 🔐 **Secure Authentication & Authorization** — User sign-up/sign-in and session management handled via **Clerk**, with role-based access control gating interview creation, participation, and admin actions.
- 🤖 **AI-Generated Interview Content** — **Google Gemini** (`@google/generative-ai`) generates role-specific interview questions and can assist in evaluating responses/feedback.
- 🎥 **Live Video Interviews** — Real-time video interview rooms powered by the **Stream Video SDK**, enabling face-to-face mock interviews between candidates and interviewers.
- 💬 **Real-Time Chat** — In-session and asynchronous messaging via **Stream Chat**, so participants can communicate before, during, and after interviews.
- 📧 **Automated Email Notifications** — Transactional emails (invites, reminders, confirmations) sent via **Resend**, with templates built using **React Email**.
- 🛡️ **Application Security & Bot/Abuse Protection** — **Arcjet** middleware protects API routes from bots, spam, and abusive traffic, and enforces rate limiting.
- 🗄️ **Relational Data Layer** — **PostgreSQL** with **Prisma ORM** (using the `@prisma/adapter-pg` driver adapter) models users, interviews, sessions, and feedback with strong type safety.
- 🎨 **Polished, Accessible UI** — Built with **Tailwind CSS v4**, **shadcn/ui**, and **Base UI** primitives for a responsive, accessible, dark-mode-ready interface (via `next-themes`), with smooth micro-interactions powered by **Motion**.
- ⚡ **Modern Next.js 16 Architecture** — Uses the App Router, Server Components, Server Actions (`/actions`), and middleware/proxy layer (`proxy.ts`) for a fast, SEO-friendly, and secure request pipeline.
- 🔔 **Toast Notifications** — User feedback and system alerts via **Sonner**.

## 🛠️ Tech Stack

**Framework & Language**
- [Next.js 16](https://nextjs.org) (App Router, Server Actions, Webpack build)
- TypeScript
- React 19

**Database & ORM**
- PostgreSQL
- Prisma ORM 7 (`@prisma/client`, `@prisma/adapter-pg`)

**Authentication & Security**
- Clerk (`@clerk/nextjs`, `@clerk/ui`) — authentication & session management
- Arcjet (`@arcjet/next`) — bot detection, rate limiting, abuse prevention

**AI**
- Google Generative AI / Gemini (`@google/generative-ai`)

**Real-Time Communication**
- Stream Video React SDK (`@stream-io/video-react-sdk`, `@stream-io/node-sdk`) — live video interviews
- Stream Chat (`stream-chat`, `stream-chat-react`) — real-time messaging

**Email**
- Resend — transactional email delivery
- React Email (`@react-email/components`, `@react-email/render`) — email templates

**UI & Styling**
- Tailwind CSS v4
- shadcn/ui, Base UI (`@base-ui/react`)
- Lucide React (icons)
- Motion (animations)
- Sonner (toasts)
- next-themes (dark/light mode)

**Tooling**
- ESLint 9
- dotenv
- npm

**Deployment**
- Vercel

## 🏗️ Project Structure

```
prepwise/
├── actions/       # Server Actions (data mutations, business logic)
├── app/           # Next.js App Router — routes, layouts, API handlers
├── components/    # Reusable UI components (shadcn/ui + custom)
├── emails/        # React Email templates for Resend
├── hooks/         # Custom React hooks
├── lib/           # Utilities, service clients (Prisma, Clerk, Stream, Gemini, etc.)
├── prisma/        # Prisma schema and migrations
├── public/        # Static assets
├── proxy.ts       # Middleware / request proxy layer (auth + Arcjet checks)
└── prisma.config.ts
```

## 🔒 Security & Real-World Considerations

- **Authentication & Authorization:** All protected routes and Server Actions verify the user's Clerk session before executing; role-based checks gate sensitive operations.
- **Bot & Abuse Protection:** Arcjet is used at the middleware/route level to rate-limit requests and block malicious or automated traffic.
- **Data Validation:** Inputs are validated and sanitized before reaching the database layer via Prisma, reducing injection and malformed-data risks.
- **Type Safety:** End-to-end TypeScript (Next.js, Prisma, React) minimizes runtime errors and improves maintainability.
- **Scalability:** Server Components and Server Actions reduce client bundle size; PostgreSQL + Prisma provide a scalable relational data layer; Stream's managed infrastructure handles video/chat scaling instead of self-hosting WebRTC/signaling servers.
- **Error Handling:** Structured error boundaries and toast-based (Sonner) user feedback surface failures gracefully instead of silent crashes.

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS)
- A PostgreSQL database
- API keys for: Clerk, Arcjet, Google Gemini, Stream (Video + Chat), Resend

### Installation

```bash
git clone https://github.com/Sandip-Dutta-8/prepwise.git
cd prepwise
npm install
```

### Environment Variables

Create a `.env` file in the root directory with the required keys (Clerk, database URL, Arcjet, Gemini, Stream, Resend). See `lib/` for the exact client initializations expected.

### Database Setup

```bash
npx prisma generate
npx prisma migrate dev
```

### Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
npm run build
npm run start
```

## ☁️ Deployment

PrepWise is deployed on **Vercel**, with automatic deployments triggered on pushes to `main` for continuous integration and delivery.

## 🗺️ Roadmap Ideas

- AI-generated post-interview scorecards with strengths/improvement areas
- Interviewer marketplace with ratings and availability scheduling
- Recorded session playback for self-review
- Resume-based interview question customization

## 👤 Author

**Sandip Dutta**
- GitHub: [@Sandip-Dutta-8](https://github.com/Sandip-Dutta-8)
- LinkedIn: [Sandip](https://www.linkedin.com/in/sandip-dutta-50415b25a/)

---

*Built as part of the House of Edtech Fullstack Developer assignment (Jan 2026).*
