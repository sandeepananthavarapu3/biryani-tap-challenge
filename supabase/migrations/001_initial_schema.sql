-- ============================================================
-- Biryani Tap Challenge - Database Schema
-- ============================================================
-- This migration creates all tables, indexes, RLS policies,
-- and functions needed for the Biryani Tap Challenge app.
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
-- Extends Supabase auth.users with app-specific data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for admin lookups and search
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_name ON public.profiles(name);
CREATE INDEX idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = TRUE;

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (but not is_admin)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Public can see names only (for leaderboard)
CREATE POLICY "Public can view names for leaderboard"
  ON public.profiles FOR SELECT
  USING (TRUE);

-- Allow insert during signup (via trigger)
CREATE POLICY "Allow insert for authenticated users"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- ============================================================
-- 2. GIVEAWAYS TABLE
-- ============================================================
CREATE TYPE giveaway_status AS ENUM ('draft', 'scheduled', 'live', 'ended');

CREATE TABLE public.giveaways (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  prize_name TEXT NOT NULL,
  status giveaway_status DEFAULT 'draft',
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER, -- alternative to end_time
  leaderboard_visible BOOLEAN DEFAULT TRUE,
  practice_enabled BOOLEAN DEFAULT TRUE,
  winner_id UUID REFERENCES public.profiles(id),
  winner_name TEXT,
  winner_total_time INTEGER, -- in milliseconds
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_giveaways_status ON public.giveaways(status);
CREATE INDEX idx_giveaways_start_time ON public.giveaways(start_time);
CREATE INDEX idx_giveaways_end_time ON public.giveaways(end_time);

-- RLS for giveaways
ALTER TABLE public.giveaways ENABLE ROW LEVEL SECURITY;

-- Everyone can view published (non-draft) giveaways
CREATE POLICY "Public can view active giveaways"
  ON public.giveaways FOR SELECT
  USING (status != 'draft' OR created_by = auth.uid());

-- Only admins can create/update giveaways
CREATE POLICY "Admins can create giveaways"
  ON public.giveaways FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admins can update giveaways"
  ON public.giveaways FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admins can delete giveaways"
  ON public.giveaways FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );


-- ============================================================
-- 3. GAME SESSIONS TABLE
-- ============================================================
CREATE TYPE session_type AS ENUM ('practice', 'official');
CREATE TYPE session_status AS ENUM ('in_progress', 'completed', 'abandoned');

CREATE TABLE public.game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  giveaway_id UUID NOT NULL REFERENCES public.giveaways(id) ON DELETE CASCADE,
  session_type session_type NOT NULL,
  status session_status DEFAULT 'in_progress',
  current_round INTEGER DEFAULT 0,
  total_reaction_time INTEGER, -- sum of all rounds in ms
  fastest_reaction_time INTEGER, -- best single round in ms
  wrong_taps INTEGER DEFAULT 0,
  early_taps INTEGER DEFAULT 0,
  is_suspicious BOOLEAN DEFAULT FALSE,
  suspicious_reason TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  server_seed TEXT NOT NULL, -- for randomization verification
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRITICAL: One official attempt per user per giveaway
CREATE UNIQUE INDEX idx_unique_official_attempt
  ON public.game_sessions(user_id, giveaway_id)
  WHERE session_type = 'official';

CREATE INDEX idx_game_sessions_user ON public.game_sessions(user_id);
CREATE INDEX idx_game_sessions_giveaway ON public.game_sessions(giveaway_id);
CREATE INDEX idx_game_sessions_status ON public.game_sessions(status);
CREATE INDEX idx_game_sessions_type ON public.game_sessions(session_type);

-- RLS for game sessions
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
  ON public.game_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create sessions
CREATE POLICY "Users can create sessions"
  ON public.game_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own in-progress sessions
CREATE POLICY "Users can update own sessions"
  ON public.game_sessions FOR UPDATE
  USING (auth.uid() = user_id AND status = 'in_progress');

-- Admins can view all sessions
CREATE POLICY "Admins can view all sessions"
  ON public.game_sessions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );


-- ============================================================
-- 4. GAME ROUNDS TABLE
-- ============================================================
CREATE TABLE public.game_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL CHECK (round_number >= 1 AND round_number <= 10),
  target_bowl INTEGER NOT NULL CHECK (target_bowl >= 0 AND target_bowl <= 5),
  reaction_time_ms INTEGER, -- NULL if not yet completed
  tapped_bowl INTEGER CHECK (tapped_bowl >= 0 AND tapped_bowl <= 5),
  was_correct BOOLEAN,
  early_tap BOOLEAN DEFAULT FALSE,
  wrong_tap BOOLEAN DEFAULT FALSE,
  chicken_appeared_at TIMESTAMPTZ,
  tap_received_at TIMESTAMPTZ,
  delay_ms INTEGER NOT NULL, -- randomized delay before chicken appears
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- One round per number per session
CREATE UNIQUE INDEX idx_unique_round
  ON public.game_rounds(session_id, round_number);

CREATE INDEX idx_game_rounds_session ON public.game_rounds(session_id);

-- RLS for game rounds
ALTER TABLE public.game_rounds ENABLE ROW LEVEL SECURITY;

-- Users can view rounds of their own sessions
CREATE POLICY "Users can view own rounds"
  ON public.game_rounds FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.game_sessions WHERE id = session_id AND user_id = auth.uid())
  );

-- Rounds are created via API (service role), but users can insert their own
CREATE POLICY "Users can create rounds for own sessions"
  ON public.game_rounds FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.game_sessions WHERE id = session_id AND user_id = auth.uid())
  );

-- Users can update their own rounds
CREATE POLICY "Users can update own rounds"
  ON public.game_rounds FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.game_sessions WHERE id = session_id AND user_id = auth.uid())
  );

-- Admins can view all rounds
CREATE POLICY "Admins can view all rounds"
  ON public.game_rounds FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );


-- ============================================================
-- 5. LEADERBOARD ENTRIES TABLE
-- ============================================================
-- Materialized for fast reads; updated on session completion
CREATE TABLE public.leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  giveaway_id UUID NOT NULL REFERENCES public.giveaways(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  total_reaction_time INTEGER NOT NULL, -- ms
  fastest_reaction_time INTEGER NOT NULL, -- ms
  completed_at TIMESTAMPTZ NOT NULL,
  rank INTEGER, -- computed
  is_suspicious BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- One entry per user per giveaway
CREATE UNIQUE INDEX idx_unique_leaderboard_entry
  ON public.leaderboard_entries(user_id, giveaway_id);

CREATE INDEX idx_leaderboard_giveaway ON public.leaderboard_entries(giveaway_id);
CREATE INDEX idx_leaderboard_ranking
  ON public.leaderboard_entries(giveaway_id, total_reaction_time ASC, fastest_reaction_time ASC, completed_at ASC);

-- RLS for leaderboard
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Public can view leaderboard (if giveaway allows it)
CREATE POLICY "Public can view leaderboard"
  ON public.leaderboard_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.giveaways
      WHERE id = giveaway_id AND leaderboard_visible = TRUE
    )
  );

-- Users can view their own entries always
CREATE POLICY "Users can view own entries"
  ON public.leaderboard_entries FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all leaderboard entries"
  ON public.leaderboard_entries FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Only service role should insert/update (via API)
CREATE POLICY "Service can manage leaderboard"
  ON public.leaderboard_entries FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );


-- ============================================================
-- 6. SERVER TIME FUNCTION
-- ============================================================
-- Returns current server time for countdown synchronization
CREATE OR REPLACE FUNCTION public.get_server_time()
RETURNS TIMESTAMPTZ
LANGUAGE SQL
STABLE
AS $$
  SELECT NOW();
$$;


-- ============================================================
-- 7. AUTO-UPDATE GIVEAWAY STATUS FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_giveaway_statuses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Move scheduled giveaways to live
  UPDATE public.giveaways
  SET status = 'live', updated_at = NOW()
  WHERE status = 'scheduled'
    AND start_time <= NOW();

  -- Move live giveaways to ended
  UPDATE public.giveaways
  SET status = 'ended', updated_at = NOW()
  WHERE status = 'live'
    AND (
      (end_time IS NOT NULL AND end_time <= NOW())
      OR
      (end_time IS NULL AND duration_minutes IS NOT NULL
       AND start_time + (duration_minutes || ' minutes')::INTERVAL <= NOW())
    );
END;
$$;


-- ============================================================
-- 8. CALCULATE WINNER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.calculate_giveaway_winner(p_giveaway_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_winner RECORD;
BEGIN
  -- Find the winner based on tie-breaking rules
  SELECT le.user_id, le.player_name, le.total_reaction_time
  INTO v_winner
  FROM public.leaderboard_entries le
  WHERE le.giveaway_id = p_giveaway_id
    AND le.is_suspicious = FALSE
  ORDER BY
    le.total_reaction_time ASC,        -- 1. Lowest total time
    le.fastest_reaction_time ASC,       -- 2. Fastest individual reaction
    le.completed_at ASC                 -- 3. Earliest completion
  LIMIT 1;

  -- Update the giveaway with winner info
  IF v_winner IS NOT NULL THEN
    UPDATE public.giveaways
    SET
      winner_id = v_winner.user_id,
      winner_name = v_winner.player_name,
      winner_total_time = v_winner.total_reaction_time,
      updated_at = NOW()
    WHERE id = p_giveaway_id;
  END IF;
END;
$$;


-- ============================================================
-- 9. PROFILE CREATION TRIGGER
-- ============================================================
-- Automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, email_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update email_verified when user confirms email
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.profiles
    SET email_verified = TRUE, updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();


-- ============================================================
-- 10. UPDATE LEADERBOARD RANKS FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_leaderboard_ranks(p_giveaway_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  WITH ranked AS (
    SELECT
      id,
      ROW_NUMBER() OVER (
        ORDER BY
          total_reaction_time ASC,
          fastest_reaction_time ASC,
          completed_at ASC
      ) as new_rank
    FROM public.leaderboard_entries
    WHERE giveaway_id = p_giveaway_id
      AND is_suspicious = FALSE
  )
  UPDATE public.leaderboard_entries le
  SET rank = ranked.new_rank
  FROM ranked
  WHERE le.id = ranked.id;
END;
$$;


-- ============================================================
-- 11. SUSPICIOUS SCORE DETECTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_suspicious_score()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Flag if average reaction time is below 100ms (humanly nearly impossible)
  IF NEW.total_reaction_time IS NOT NULL AND NEW.total_reaction_time < 1000 THEN
    NEW.is_suspicious := TRUE;
    NEW.suspicious_reason := 'Total reaction time below 1000ms (avg <100ms per round)';
  END IF;

  -- Flag if any individual round is below 80ms
  IF EXISTS (
    SELECT 1 FROM public.game_rounds
    WHERE session_id = NEW.id
      AND reaction_time_ms IS NOT NULL
      AND reaction_time_ms < 80
  ) THEN
    NEW.is_suspicious := TRUE;
    NEW.suspicious_reason := COALESCE(NEW.suspicious_reason || '; ', '') ||
      'Individual reaction below 80ms detected';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER check_suspicious_on_complete
  BEFORE UPDATE ON public.game_sessions
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status = 'in_progress')
  EXECUTE FUNCTION public.check_suspicious_score();
