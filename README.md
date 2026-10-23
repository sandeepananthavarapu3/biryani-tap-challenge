# 🍗 Biryani Tap Challenge

An interactive web game where players race to tap a chicken piece popping out of biryani bowls — the fastest total reaction time wins the biryani!

## ✨ Features

- **3D Game Engine** — React Three Fiber scene with 6 copper handi bowls, animated chicken pop-ups, steam particles, and cinematic lighting
- **Precision Timing** — `performance.now()` based reaction measurement, `pointerdown` for instant touch response
- **Multi-Giveaway System** — Create unlimited separate giveaways with independent leaderboards
- **Secure Scoring** — Server-side validation, one official attempt per user per giveaway, suspicious score detection
- **Cinematic Winner Reveal** — Countdown → "GIVEAWAY CLOSED" → dramatic pause → confetti + golden crown + winner card
- **Real-time Leaderboard** — Server-time-synced countdown, animated rank changes
- **Admin Dashboard** — Full CRUD for giveaways, participant details with 10 round times, wrong/early tap counts, suspicious flags
- **Mobile-First** — Touch-oriented interface with animations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Install dependencies
```bash
cd biryani-tap-challenge
npm install
```

### 2. Set up Supabase
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
3. Copy your project URL and keys from **Settings → API**

### 3. Configure environment
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Make yourself admin
After signing up, run in Supabase SQL Editor:
```sql
UPDATE public.profiles SET is_admin = true WHERE email = 'your@email.com';
```

### 5. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| 3D Engine | React Three Fiber + Three.js |
| Animations | Framer Motion + React Spring |
| State | Zustand |
| Auth | Supabase Auth (email + verification) |
| Database | Supabase PostgreSQL + RLS |
| Deployment | Vercel |

## 📱 Pages

| Page | Description |
|------|-------------|
| `/` | Landing page with active giveaways |
| `/signup` | Player registration |
| `/login` | Player login |
| `/verify-email` | Email verification |
| `/profile` | User history & settings |
| `/giveaway/[id]` | Giveaway detail with countdown |
| `/giveaway/[id]/practice` | Practice mode (unlimited) |
| `/giveaway/[id]/play` | Official attempt (one per giveaway) |
| `/giveaway/[id]/leaderboard` | Live leaderboard |
| `/admin` | Admin dashboard |
| `/admin/giveaways` | Manage all giveaways |
| `/admin/giveaways/create` | Create new giveaway |
| `/admin/giveaways/[id]` | Giveaway detail + stats |
| `/admin/giveaways/[id]/participants` | View all participants |

## 🎮 Game Mechanics

1. **10 rounds** per attempt
2. **6 bowls** in a 2×3 grid — chicken appears from a random one
3. **Random delay** (1.5–4s) before each appearance
4. **Tap the correct bowl** as fast as possible
5. **Wrong bowl** = 1.5s penalty pause
6. **Too early** = 2s penalty pause
7. **Score** = sum of all 10 reaction times (lowest wins)
8. **Tiebreakers**: fastest single reaction → earliest completion

## 🔒 Anti-Cheat

- One official attempt per user per giveaway (database unique constraint)
- Sequential round validation
- Server-generated target bowls and delays
- Suspicious score detection (<80ms individual, <1500ms total)
- Email verification required
- Server-side score finalization

## 🚀 Deploy to Vercel

```bash
npx vercel
```

Add these environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 📄 License

MIT

## Repository preparation

This is a development/portfolio project. Repository preparation did not validate every feature end to end. Private environment files and generated builds are excluded. Replace the placeholders in `.env.local.example` with your own values in `.env.local`; never commit credentials.
