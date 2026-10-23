export function calculateTotalTime(rounds: number[]): number {
  return rounds.reduce((sum, time) => sum + time, 0)
}

export function findFastestReaction(rounds: number[]): number {
  if (rounds.length === 0) return 0
  return Math.min(...rounds)
}

export function isSuspicious(totalTime: number, rounds: number[]): { suspicious: boolean, reason?: string } {
  // A reaction time faster than ~150ms on average is usually impossible for visual stimuli
  // Faster than 80ms on any tap is very suspicious
  if (rounds.some(t => t < 80)) {
    return { suspicious: true, reason: 'Implausible reaction time (< 80ms)' }
  }
  
  if (rounds.length === 10 && totalTime < 1500) {
    return { suspicious: true, reason: 'Implausible total reaction time (< 1.5s)' }
  }
  
  return { suspicious: false }
}

export function formatTime(ms: number): string {
  return `${(ms / 1000).toFixed(3)} s (${Math.round(ms).toLocaleString('en-US')} ms)`
}

export function formatReactionTime(ms: number): string {
  return formatTime(ms)
}

export function generateRandomDelay(): number {
  return Math.floor(Math.random() * (4000 - 1500 + 1)) + 1500
}

export function generateTargetBowl(): number {
  return Math.floor(Math.random() * 6)
}
