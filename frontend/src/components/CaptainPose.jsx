import { useEffect, useRef, useState } from 'react';
import { motionLibrary } from '@/data/motionLibrary';

const TRANSITION_MS = 220;

function poseById(id) {
  return motionLibrary.find((p) => p.id === id);
}

/**
 * <CaptainPose poseId={...} size={...} />
 *
 * Crossfades smoothly between poses. Uses two stacked <img> elements with
 * opacity transitions so the previous frame doesn't pop out before the new
 * one is rendered.
 */
export default function CaptainPose({ poseId, size = 360, className = '' }) {
  const [current, setCurrent] = useState(poseId);
  const [previous, setPrevious] = useState(null);
  const [entered, setEntered] = useState(false);
  const timerRef = useRef(null);
  const enterRef = useRef(null);

  useEffect(() => {
    if (poseId === current) return;
    setPrevious(current);
    setCurrent(poseId);
    setEntered(false);
    clearTimeout(timerRef.current);
    clearTimeout(enterRef.current);
    enterRef.current = setTimeout(() => setEntered(true), 20);
    timerRef.current = setTimeout(() => setPrevious(null), TRANSITION_MS + 50);
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(enterRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poseId]);

  useEffect(() => {
    // First-mount fade-in
    const id = setTimeout(() => setEntered(true), 20);
    return () => clearTimeout(id);
  }, []);

  const currentPose = poseById(current);
  const prevPose = previous ? poseById(previous) : null;

  return (
    <div
      className={`cck-captain-pose ${className}`}
      style={{
        position: 'relative',
        width: size,
        height: size,
        overflow: 'hidden',
      }}
      data-testid="captain-pose"
      data-pose-id={current}
    >
      {prevPose && (
        <img
          src={`/motions/${prevPose.file}`}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: 0,
            transition: `opacity ${TRANSITION_MS}ms ease`,
          }}
        />
      )}
      {currentPose && (
        <img
          src={`/motions/${currentPose.file}`}
          alt={`Captain Culinary — ${currentPose.note}`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: entered ? 1 : 0,
            transition: `opacity ${TRANSITION_MS}ms ease`,
          }}
        />
      )}
    </div>
  );
}
