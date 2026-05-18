/**
 * Gesture Selector
 *
 * Given an intent and a tier (and optional register), returns a pose object
 * from the motion library. In V1, callers pass intent manually. In V2,
 * an on-device classifier (Gemma 4 E2B) will call this with the same
 * signature — no refactor needed.
 *
 * Selection is stochastic-within-pool: among all poses matching the
 * filters, one is chosen at random, with a soft preference for poses
 * NOT recently used (tracked in module-local memory to avoid repeats).
 */
import { motionLibrary, INTENTS, TIERS } from '@/data/motionLibrary';

const RECENT_LIMIT = 5;
const recentlyUsed = [];

function remember(poseId) {
  recentlyUsed.push(poseId);
  if (recentlyUsed.length > RECENT_LIMIT) recentlyUsed.shift();
}

/**
 * pickPose({ intent, tier, register, allowRecent })
 *
 * @param {string} intent      one of INTENTS
 * @param {string} tier        one of TIERS ('7-12' | '13-16' | '17-19')
 * @param {string} [register]  optional emotional register filter
 * @param {boolean} [allowRecent=false]  if true, do not avoid recent poses
 * @returns {object|null}      a pose record from motionLibrary, or null if no match
 */
export function pickPose({ intent, tier, register, allowRecent = false }) {
  if (!INTENTS.includes(intent)) {
    console.warn(`[gestureSelector] unknown intent: ${intent}`);
    return null;
  }
  if (!TIERS.includes(tier)) {
    console.warn(`[gestureSelector] unknown tier: ${tier}`);
    return null;
  }

  let pool = motionLibrary.filter(
    (p) => p.intent === intent && p.tiers.includes(tier)
  );
  if (register) {
    const filtered = pool.filter((p) => p.register === register);
    if (filtered.length > 0) pool = filtered; // soft preference
  }

  if (pool.length === 0) {
    // Fallback: same intent, any tier
    pool = motionLibrary.filter((p) => p.intent === intent);
  }
  if (pool.length === 0) return null;

  let candidates = pool;
  if (!allowRecent && pool.length > recentlyUsed.length) {
    candidates = pool.filter((p) => !recentlyUsed.includes(p.id));
    if (candidates.length === 0) candidates = pool;
  }

  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  remember(chosen.id);
  return chosen;
}

/**
 * pickRestPose(tier) — pick a pose where canHold === true.
 * Used for idle / listening states.
 */
export function pickRestPose(tier) {
  const pool = motionLibrary.filter((p) => p.canHold && p.tiers.includes(tier));
  if (pool.length === 0) return motionLibrary.find((p) => p.canHold) || null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * resetMemory() — clears the recent-pose memory (test helper / scene change)
 */
export function resetMemory() {
  recentlyUsed.length = 0;
}
