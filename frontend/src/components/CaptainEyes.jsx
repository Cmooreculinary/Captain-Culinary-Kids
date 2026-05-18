import { useEffect, useRef, useState } from 'react';

/**
 * <CaptainEyes amplitude={0..1} state="idle|listening|speaking|alert|calm" />
 *
 * V1: self-pulses with a sine wave when no amplitude prop is given.
 * V2: caller passes audio amplitude (0..1) and a semantic state; this layer
 *     modulates eye glow intensity and color temperature in response.
 *
 * Renders a transparent overlay sized to match its parent. Intended to be
 * positioned above <CaptainPose /> in the same container.
 */
export default function CaptainEyes({ amplitude, state = 'idle' }) {
  const [t, setT] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (amplitude != null) return; // amplitude-driven; no self-anim
    const tick = () => {
      setT((prev) => prev + 0.04);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [amplitude]);

  const pulse =
    amplitude != null
      ? Math.min(1, Math.max(0, amplitude))
      : 0.5 + 0.5 * Math.sin(t);

  const glowColor =
    state === 'alert'
      ? 'rgba(242, 184, 75, ' + (0.4 + 0.4 * pulse) + ')'
      : state === 'calm'
      ? 'rgba(221, 243, 255, ' + (0.3 + 0.3 * pulse) + ')'
      : 'rgba(120, 200, 255, ' + (0.4 + 0.5 * pulse) + ')';

  return (
    <div
      className="cck-captain-eyes"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        mixBlendMode: 'screen',
        background: `radial-gradient(circle at 50% 30%, ${glowColor} 0%, transparent 18%)`,
        transition: 'background 80ms linear',
      }}
      data-testid="captain-eyes"
      data-state={state}
    />
  );
}
