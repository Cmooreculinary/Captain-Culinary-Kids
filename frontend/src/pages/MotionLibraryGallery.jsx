import React, { useMemo, useState } from "react";
import { X, ClipboardCopy, AlertTriangle } from "lucide-react";
import {
  motionLibrary,
  INTENTS,
  INTENT_LABELS,
  TIERS,
  TIER_LABELS,
  COVERAGE_GAPS,
} from "@/data/motionLibrary";
import CaptainPose from "@/components/CaptainPose";
import CaptainEyes from "@/components/CaptainEyes";

const ALL = "__all__";

function countBy(list, key) {
  const out = {};
  for (const item of list) {
    const v = item[key];
    if (Array.isArray(v)) {
      for (const t of v) out[t] = (out[t] || 0) + 1;
    } else {
      out[v] = (out[v] || 0) + 1;
    }
  }
  return out;
}

export default function MotionLibraryGallery() {
  const [tier, setTier] = useState(ALL);
  const [intent, setIntent] = useState(ALL);
  const [activeId, setActiveId] = useState(null);

  const filtered = useMemo(() => {
    return motionLibrary.filter((p) => {
      if (tier !== ALL && !p.tiers.includes(tier)) return false;
      if (intent !== ALL && p.intent !== intent) return false;
      return true;
    });
  }, [tier, intent]);

  const intentCounts = useMemo(() => countBy(motionLibrary, "intent"), []);
  const tierCounts = useMemo(() => countBy(motionLibrary, "tiers"), []);

  const activePose = activeId
    ? motionLibrary.find((p) => p.id === activeId)
    : null;

  return (
    <div className="cck-page" data-testid="motion-library-page">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="cck-eyebrow">Internal review</div>
          <h1
            className="cck-h1 mt-1"
            style={{ fontSize: "clamp(1.7rem, 4.5vw, 2.6rem)" }}
            data-testid="motion-library-title"
          >
            Captain Culinary — Motion Library
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--cck-navy-soft)" }}
            data-testid="motion-library-count"
          >
            {filtered.length} of {motionLibrary.length} poses shown
          </p>
        </div>
      </div>

      {/* Coverage gap banner */}
      {COVERAGE_GAPS.length > 0 && (
        <div
          className="mt-5 rounded-xl p-4 flex gap-3 items-start"
          style={{
            background: "rgba(242, 184, 75, 0.15)",
            border: "1px solid var(--cck-gold)",
          }}
          data-testid="motion-coverage-gap-banner"
        >
          <AlertTriangle
            size={20}
            color="var(--cck-gold-deep)"
            className="shrink-0 mt-0.5"
          />
          <div className="text-sm" style={{ color: "var(--cck-navy)" }}>
            <div className="font-semibold mb-1">Coverage gaps</div>
            <ul className="space-y-1">
              {COVERAGE_GAPS.map((g) => (
                <li key={g.intent}>
                  <span className="font-semibold">
                    {INTENT_LABELS[g.intent] || g.intent}
                  </span>{" "}
                  — need {g.needed} more pose
                  {g.needed === 1 ? "" : "s"}. {g.description}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Coverage panel — counts */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {INTENTS.map((it) => (
          <div
            key={it}
            className="cck-card p-3"
            data-testid={`motion-count-intent-${it}`}
          >
            <div className="cck-eyebrow text-xs">{INTENT_LABELS[it]}</div>
            <div
              className="text-lg font-semibold"
              style={{ color: "var(--cck-navy)" }}
            >
              {intentCounts[it] || 0} poses
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {TIERS.map((t) => (
          <div
            key={t}
            className="cck-card p-3"
            data-testid={`motion-count-tier-${t}`}
          >
            <div className="cck-eyebrow text-xs">{TIER_LABELS[t]}</div>
            <div
              className="text-lg font-semibold"
              style={{ color: "var(--cck-navy)" }}
            >
              {tierCounts[t] || 0} poses
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3 items-end">
        <div>
          <label
            className="cck-eyebrow text-xs block mb-1"
            htmlFor="motion-filter-tier"
          >
            Tier
          </label>
          <select
            id="motion-filter-tier"
            data-testid="motion-filter-tier"
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm"
            style={{
              background: "var(--cck-cream)",
              border: "1px solid var(--cck-paper-line)",
              color: "var(--cck-navy)",
            }}
          >
            <option value={ALL}>All tiers</option>
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {t} — {TIER_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="cck-eyebrow text-xs block mb-1"
            htmlFor="motion-filter-intent"
          >
            Intent
          </label>
          <select
            id="motion-filter-intent"
            data-testid="motion-filter-intent"
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm"
            style={{
              background: "var(--cck-cream)",
              border: "1px solid var(--cck-paper-line)",
              color: "var(--cck-navy)",
            }}
          >
            <option value={ALL}>All intents</option>
            {INTENTS.map((it) => (
              <option key={it} value={it}>
                {INTENT_LABELS[it]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tile grid */}
      <div
        className="mt-6 grid gap-4"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        }}
        data-testid="motion-grid"
      >
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveId(p.id)}
            className="cck-card p-3 text-left flex flex-col gap-2 hover:translate-y-[-1px] transition-transform"
            data-testid={`motion-tile-${p.id}`}
          >
            <div
              className="rounded-md overflow-hidden"
              style={{
                background: "var(--cck-cream)",
                border: "1px solid var(--cck-paper-line-soft)",
                aspectRatio: "1 / 1",
              }}
            >
              <img
                src={`/motions/${p.file}`}
                alt={`Captain pose ${p.id} — ${p.note}`}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span
                className="font-semibold"
                style={{ color: "var(--cck-navy)" }}
              >
                #{String(p.id).padStart(3, "0")}
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{
                  background: "var(--cck-soft-blue)",
                  color: "var(--cck-teal-deep)",
                }}
              >
                {INTENT_LABELS[p.intent]}
              </span>
            </div>
            <div
              className="text-xs"
              style={{ color: "var(--cck-navy-soft)" }}
            >
              {p.tiers.join(" · ")} · {p.register}
              {p.canHold ? " · hold-ok" : ""}
            </div>
            <div
              className="text-xs italic"
              style={{ color: "var(--cck-navy-soft)" }}
            >
              {p.note}
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div
            className="col-span-full text-center py-12 text-sm"
            style={{ color: "var(--cck-navy-soft)" }}
            data-testid="motion-grid-empty"
          >
            No poses match these filters.
          </div>
        )}
      </div>

      {activePose && (
        <PoseModal pose={activePose} onClose={() => setActiveId(null)} />
      )}
    </div>
  );
}

function PoseModal({ pose, onClose }) {
  const [amplitude, setAmplitude] = useState(0.5);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(pose.id));
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(16, 42, 67, 0.55)" }}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      data-testid="motion-modal"
    >
      <div
        className="cck-card w-full max-w-lg p-5 relative"
        style={{ background: "var(--cck-cream)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center"
          style={{
            background: "var(--cck-cream-deep)",
            border: "1px solid var(--cck-paper-line)",
          }}
          aria-label="Close pose details"
          data-testid="motion-modal-close"
        >
          <X size={18} color="var(--cck-navy)" />
        </button>

        <div className="cck-eyebrow">
          Pose #{String(pose.id).padStart(3, "0")}
        </div>
        <h2
          className="text-xl font-semibold mt-1"
          style={{ color: "var(--cck-navy)", fontFamily: "Fraunces, serif" }}
        >
          {INTENT_LABELS[pose.intent]}
        </h2>

        <div
          className="mt-4 mx-auto"
          style={{
            position: "relative",
            width: "min(360px, 100%)",
            aspectRatio: "1 / 1",
            background: "white",
            borderRadius: "12px",
            border: "1px solid var(--cck-paper-line-soft)",
            overflow: "hidden",
          }}
        >
          <CaptainPose poseId={pose.id} size="100%" />
          <CaptainEyes amplitude={amplitude} state="idle" />
        </div>

        <div className="mt-4">
          <label
            className="cck-eyebrow text-xs block mb-1"
            htmlFor="motion-modal-amplitude"
          >
            Eye amplitude ({amplitude.toFixed(2)})
          </label>
          <input
            id="motion-modal-amplitude"
            data-testid="motion-modal-amplitude"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={amplitude}
            onChange={(e) => setAmplitude(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <dl
          className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm"
          style={{ color: "var(--cck-navy)" }}
        >
          <dt className="cck-eyebrow text-xs">Tiers</dt>
          <dd>{pose.tiers.join(", ")}</dd>
          <dt className="cck-eyebrow text-xs">Register</dt>
          <dd>{pose.register}</dd>
          <dt className="cck-eyebrow text-xs">Can hold</dt>
          <dd>{pose.canHold ? "Yes — rest-safe" : "No — transient"}</dd>
          <dt className="cck-eyebrow text-xs">File</dt>
          <dd className="font-mono text-xs">{pose.file}</dd>
        </dl>
        <p
          className="mt-3 text-sm italic"
          style={{ color: "var(--cck-navy-soft)" }}
        >
          {pose.note}
        </p>

        <button
          onClick={handleCopy}
          className="cck-btn-primary mt-5 inline-flex items-center gap-2"
          data-testid="motion-modal-copy-id"
        >
          <ClipboardCopy size={16} />
          {copied ? "Copied!" : "Use this pose (copy ID)"}
        </button>
      </div>
    </div>
  );
}
