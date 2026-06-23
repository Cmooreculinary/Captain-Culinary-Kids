import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, Check, Loader2, ShieldCheck, X, ChefHat, Globe, Truck } from "lucide-react";
import { CaptainCulinary } from "@/components/CaptainCulinary";
import { Storage } from "@/services/storage";
import { StripeService } from "@/services/stripeService";

const FEATURES = [
  { icon: ShieldCheck, text: "7 full lessons across 3 age paths (7–19)" },
  { icon: BookOpen, text: "7 vintage teaching plates — printable & reusable" },
  { icon: Globe, text: "Global food missions & family challenges" },
  { icon: Truck, text: "Food Truck & Restaurant concept builders" },
  { icon: ChefHat, text: "Captain Culinary narration + Ask Captain Q&A" },
];

export default function Purchase() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [phase, setPhase] = useState("idle"); // idle | verifying | success | cancelled | error
  const [loading, setLoading] = useState(false);

  const stripeSessionId = params.get("stripe_session_id");
  const cancelled = params.get("cancelled");

  useEffect(() => {
    if (cancelled === "true") {
      setPhase("cancelled");
      return;
    }
    if (stripeSessionId) {
      setPhase("verifying");
      StripeService.verifyPurchase(stripeSessionId).then((ok) => {
        if (ok) {
          Storage.setUnlocked(stripeSessionId);
          setPhase("success");
          setTimeout(() => nav("/lessons"), 2800);
        } else {
          setPhase("error");
        }
      });
    }
  }, [stripeSessionId, cancelled, nav]);

  const handleCheckout = async () => {
    setLoading(true);
    const url = await StripeService.createCheckout();
    if (url) {
      window.location.href = url;
    } else {
      setLoading(false);
      setPhase("error");
    }
  };

  if (phase === "verifying") {
    return (
      <PageWrap>
        <Loader2 size={40} className="animate-spin mx-auto" style={{ color: "var(--cck-teal)" }} />
        <h2 className="cck-h2 mt-4" style={{ textAlign: "center" }}>Verifying your purchase…</h2>
        <p className="mt-2 text-center" style={{ color: "var(--cck-navy-soft)" }}>
          Just a moment while we confirm your payment.
        </p>
      </PageWrap>
    );
  }

  if (phase === "success") {
    return (
      <PageWrap>
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          style={{ background: "var(--cck-teal)", color: "#fff" }}
        >
          <Check size={32} />
        </div>
        <h2 className="cck-h2 mt-4" style={{ textAlign: "center" }}>
          Welcome to the full kitchen!
        </h2>
        <p className="mt-2 text-center" style={{ color: "var(--cck-navy-soft)" }}>
          All lessons are unlocked. Redirecting to your lessons…
        </p>
      </PageWrap>
    );
  }

  if (phase === "cancelled") {
    return (
      <PageWrap>
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
          style={{ background: "var(--cck-cream-deep)", color: "var(--cck-coral-deep)" }}
        >
          <X size={28} />
        </div>
        <h2 className="cck-h2 mt-4" style={{ textAlign: "center" }}>No problem</h2>
        <p className="mt-2 text-center" style={{ color: "var(--cck-navy-soft)" }}>
          Your first lesson is still free whenever you're ready.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <button onClick={() => nav("/lessons")} className="cck-btn-primary">
            Back to Lessons
          </button>
          <button onClick={() => setPhase("idle")} className="cck-btn-ghost">
            See Pricing
          </button>
        </div>
      </PageWrap>
    );
  }

  if (phase === "error") {
    return (
      <PageWrap>
        <p className="text-center" style={{ color: "var(--cck-coral-deep)" }}>
          We couldn't confirm your payment. If you completed checkout, please
          contact support. Otherwise, try again.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <button onClick={() => setPhase("idle")} className="cck-btn-primary">
            Try Again
          </button>
          <button onClick={() => nav(-1)} className="cck-btn-ghost">
            Go Back
          </button>
        </div>
      </PageWrap>
    );
  }

  // Default: pricing / idle state
  return (
    <div className="cck-page" data-testid="purchase-page">
      <div className="text-center cck-anim-fade-up">
        <CaptainCulinary size="md" className="mx-auto" />
        <div className="cck-eyebrow mt-3">One-time purchase</div>
        <h1 className="cck-h1 mt-1" style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)" }}>
          Buy once. Learn for life.
        </h1>
        <p
          className="mt-3 max-w-lg mx-auto text-sm"
          style={{ fontFamily: "var(--font-body)", color: "var(--cck-navy-soft)" }}
        >
          One app · three age paths · years of food skills. No subscription,
          no renewals — just Captain Culinary teaching your family forever.
        </p>
      </div>

      {/* Price card */}
      <div
        className="mt-8 max-w-sm mx-auto cck-card p-7 text-center"
        style={{ borderColor: "var(--cck-teal)" }}
      >
        <div className="cck-eyebrow">Full Unlock</div>
        <div
          className="mt-2"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "3.5rem",
            fontWeight: 800,
            color: "var(--cck-navy)",
            lineHeight: 1,
          }}
        >
          $14.99
        </div>
        <div className="mt-1 text-xs" style={{ color: "var(--cck-navy-soft)" }}>
          one-time · no subscription
        </div>

        <ul className="mt-6 space-y-3 text-left">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <div
                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                style={{ background: "var(--cck-teal)", color: "#fff" }}
              >
                <Icon size={12} />
              </div>
              <span className="text-sm" style={{ color: "var(--cck-navy)" }}>
                {text}
              </span>
            </li>
          ))}
        </ul>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="cck-btn-primary w-full mt-7 inline-flex items-center justify-center gap-2"
          data-testid="purchase-checkout-btn"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Preparing checkout…
            </>
          ) : (
            <>
              <BookOpen size={16} />
              Unlock All Lessons — $14.99
            </>
          )}
        </button>

        <p className="mt-3 text-xs" style={{ color: "var(--cck-navy-soft)" }}>
          Secure checkout via Stripe · Instant unlock · Refund policy in footer
        </p>
      </div>

      <div className="mt-5 text-center">
        <button
          onClick={() => nav("/lessons")}
          className="cck-btn-ghost text-sm"
          data-testid="purchase-back-btn"
        >
          ← Back to Lessons
        </button>
      </div>
    </div>
  );
}

function PageWrap({ children }) {
  return (
    <div className="cck-page flex flex-col items-center justify-center min-h-[60vh]">
      {children}
    </div>
  );
}
