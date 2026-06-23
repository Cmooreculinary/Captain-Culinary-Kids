import { useCallback, useEffect, useRef, useState } from "react";

export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false);
  const [supported] = useState(() => typeof window !== "undefined" && !!window.speechSynthesis);
  const utteranceRef = useRef(null);

  const speak = useCallback((text) => {
    if (!supported || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.88;
    u.pitch = 1.05;
    u.lang = "en-US";
    // Prefer a clear, warm voice when available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) =>
      ["Samantha", "Karen", "Google US English", "Microsoft Aria"].some((n) =>
        v.name.includes(n)
      )
    );
    if (preferred) u.voice = preferred;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
  }, [supported]);

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  // Cancel any active speech when the component unmounts
  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, [supported]);

  return { speak, stop, speaking, supported };
}
