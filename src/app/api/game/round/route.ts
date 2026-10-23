import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateRandomDelay, generateTargetBowl, isSuspicious } from '@/lib/game/scoring'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { session_id, round_number, reaction_time_ms, tapped_bowl } = await request.json()
    
    if (reaction_time_ms <= 0) {
      return NextResponse.json({ error: 'Invalid reaction time' }, { status: 400 })
    }
    
    const adminClient = createAdminClient()
    
    // Verify session belongs to user and is in progress
    const { data: session } = await adminClient
      .from('game_sessions')
      .select('*')
      .eq('id', session_id)
      .eq('user_id', user.id)
      .single()
      
    if (!session || session.status !== 'in_progress') {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
    }
    
    // Validate sequential round numbers
    if (round_number !== session.current_round) {
      return NextResponse.json({ error: 'Invalid round number' }, { status: 400 })
    }
    
    // Get the current round record
    const { data: round } = await adminClient
      .from('game_rounds')
      .select('*')
      .eq('session_id', session_id)
      .eq('round_number', round_number)
      .single()
      
    // Prevent duplicate submissions
    if (!round || round.reaction_time_ms !== null) {
      return NextResponse.json({ error: 'Round already submitted or invalid' }, { status: 400 })
    }
    
    const isEarly = reaction_time_ms < 80
    const isWrong = tapped_bowl !== round.target_bowl
    const isCorrect = !isEarly && !isWrong
    
    // Update the round record
    await adminClient
      .from('game_rounds')
      .update({
        reaction_time_ms,
        tapped_bowl,
        was_correct: isCorrect,
        early_tap: isEarly,
        wrong_tap: isWrong,
        tap_received_at: new Date().toISOString()
      })
      .eq('id', round.id)
      
    // Update tap counts directly on session
    if (isEarly) {
      await adminClient
        .from('game_sessions')
        .update({ early_taps: (session.early_taps || 0) + 1 })
        .eq('id', session_id)
    } else if (isWrong) {
      await adminClient
        .from('game_sessions')
        .update({ wrong_taps: (session.wrong_taps || 0) + 1 })
        .eq('id', session_id)
    }
    
    if (round_number < 10) {
      // Generate next round
      const delay_ms = generateRandomDelay()
      const target_bowl = generateTargetBowl()
      
      await adminClient
        .from('game_sessions')
        .update({ current_round: round_number + 1 })
        .eq('id', session_id)
        
      await adminClient
        .from('game_rounds')
        .insert({
          session_id,
          round_number: round_number + 1,
          delay_ms,
          target_bowl
        })
        
      return NextResponse.json({
        accepted: true,
        verified_reaction_time_ms: reaction_time_ms,
        was_correct: isCorrect,
        is_early: isEarly,
        is_wrong: isWrong,
        next_round: {
          round_number: round_number + 1,
          delay_ms,
          target_bowl
        }
      })
    } else {
      // Round 10 complete — finalize session
      const { data: allRounds } = await adminClient
        .from('game_rounds')
        .select('reaction_time_ms')
        .eq('session_id', session_id)
        .order('round_number')
        
      const times = (allRounds || [])
        .map(r => r.reaction_time_ms)
        .filter((t): t is number => t !== null && t > 0)
      
      const totalTime = times.reduce((a, b) => a + b, 0)
      const fastestTime = times.length > 0 ? Math.min(...times) : 0
      
      const suspiciousCheck = isSuspicious(totalTime, times)
      
      // Update session to completed
      await adminClient
        .from('game_sessions')
        .update({
          status: 'completed',
          total_reaction_time: totalTime,
          fastest_reaction_time: fastestTime,
          is_suspicious: suspiciousCheck.suspicious,
          suspicious_reason: suspiciousCheck.reason || null,
          completed_at: new Date().toISOString()
        })
        .eq('id', session_id)
        
      // For official sessions, create leaderboard entry
      if (session.session_type === 'official') {
        const { data: profile } = await adminClient
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single()
        
        await adminClient
          .from('leaderboard_entries')
          .upsert({
            giveaway_id: session.giveaway_id,
            user_id: user.id,
            session_id: session_id,
            player_name: profile?.name || 'Anonymous',
            total_reaction_time: totalTime,
            fastest_reaction_time: fastestTime,
            completed_at: new Date().toISOString(),
            is_suspicious: suspiciousCheck.suspicious
          }, { onConflict: 'user_id,giveaway_id' })
          
        // Update leaderboard ranks
        await adminClient.rpc('update_leaderboard_ranks', { p_giveaway_id: session.giveaway_id })
      }
      
      return NextResponse.json({
        accepted: true,
        verified_reaction_time_ms: reaction_time_ms,
        was_correct: isCorrect,
        is_early: isEarly,
        is_wrong: isWrong,
        session_complete: true,
        total_reaction_time: totalTime,
        fastest_reaction_time: fastestTime
      })
    }
  } catch (error) {
    console.error('Error submitting round:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
