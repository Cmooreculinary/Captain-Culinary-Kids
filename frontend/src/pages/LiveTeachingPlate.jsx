import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, MessageCircleQuestion, RefreshCw,
  BookOpen, ChevronDown, Volume2, VolumeX, Printer, Lock,
} from "lucide-react";
import { getLessonById, ASK_PROMPTS } from "@/data/lessons";
import { generateCaptainResponse } from "@/services/captainCulinaryCoach";
import { getPlate } from "@/components/teaching-plates";
import { CaptainCard, CaptainCulinary } from "@/components/CaptainCulinary";
import OrnamentDivider from "@/components/OrnamentDivider";
import { Storage } from "@/services/storage";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

// Only the first lesson is free; all others require the one-time purchase.
const FREE_LESSON_IDS = ["kitchen-safety-basics"];

export default function LiveTeachingPlate() {
  const { lessonId } = useParams();
  const nav = useNavigate();
  const lesson = useMemo(() => getLessonById(lessonId), [lessonId]);

  const [stepIdx, setStepIdx] = useState(-1); // -1 = welcome
  const [askOpen, setAskOpen] = useState(false);
  const [askQuery, setAskQuery] = useState("");
  const [askResponse, setAskResponse] = useState(null);
  const [biblicalShown, setBiblicalShown] = useState(false);

  const state = Storage.getState();
  const soundOn = state.settings?.soundOn ?? true;
  const { speak, stop, speaking, supported: ttsSupported } = useSpeechSynthesis();

  const isWelcome = stepIdx === -1;
  const totalSteps = lesson?.steps?.length || 0;
  const isLastStep = !!lesson && stepIdx === totalSteps - 1;

  const captainResponse = useMemo(() => {
    if (!lesson) return { kind: "greeting", text: "", followUp: null };
    if (isWelcome) {
      return generateCaptainResponse({
        ageGroup: lesson.ageGroup,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        lessonPath: lesson.path,
        currentTeachingPlate: lesson.plateKey,
        safetyLevel: lesson.safetyLevel,
        allowBiblicalConnection: false,
      });
    }
    return generateCaptainResponse({
      ageGroup: lesson.ageGroup,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      lessonPath: lesson.path,
      currentTeachingPlate: lesson.plateKey,
      lessonStep: lesson.steps[stepIdx].id,
      safetyLevel: lesson.safetyLevel,
      allowBiblicalConnection: false,
    });
  }, [stepIdx, isWelcome, lesson]);

  // Auto-speak Captain's text whenever the narration text changes and soundOn is true
  useEffect(() => {
    const text = askResponse ? askResponse.text : captainResponse.text;
    if (soundOn && ttsSupported && text) {
      speak(text);
    }
    // Cancel speech on step change if sound is off
    if (!soundOn) stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captainResponse.text, askResponse, soundOn]);

  if (!lesson) {
    return (
      <div className="cck-page" data-testid="lesson-not-found">
        <p>Lesson not found.</p>
        <button onClick={() => nav("/lessons")} className="cck-btn-ghost mt-4">
          Back to Library
        </button>
      </div>
    );
  }

  // Paywall gate — first lesson is always free
  const isLocked = !Storage.isUnlocked() && !FREE_LESSON_IDS.includes(lesson.id);
  if (isLocked) {
    return <PaywallGate lesson={lesson} nav={nav} />;
  }

  const Plate = getPlate(lesson.plateKey);

  const moveOn = () => {
    stop();
    setBiblicalShown(false);
    setAskResponse(null);
    if (isWelcome) {
      setStepIdx(0);
    } else if (isLastStep) {
      nav(`/quiz/${lesson.id}`);
    } else {
      setStepIdx(stepIdx + 1);
    }
  };

  const explainAgain = () => {
    const r = { kind: "explain", text: captainResponse.text, followUp: captainResponse.followUp };
    setAskResponse(r);
    if (soundOn && ttsSupported) speak(r.text);
  };

  const handleAsk = (q) => {
    const r = generateCaptainResponse({
      ageGroup: lesson.ageGroup,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      lessonPath: lesson.path,
      currentTeachingPlate: lesson.plateKey,
      lessonStep: isWelcome ? null : lesson.steps[stepIdx].id,
      safetyLevel: lesson.safetyLevel,
      allowBiblicalConnection: true,
      userQuestion: q,
    });
    setAskResponse(r);
    setAskQuery("");
    setAskOpen(false);
    if (soundOn && ttsSupported) speak(r.text);
  };

  const showBiblical = () => {
    setBiblicalShown(true);
    const r = {
      kind: "biblical",
      text: lesson.biblical,
      followUp: "Would you like to move on, or do you have any questions?",
    };
    setAskResponse(r);
    if (soundOn && ttsSupported) speak(r.text);
  };

  const handlePrint = () => {
    document.title = `Captain Culinary Kids — ${lesson.title}`;
    window.print();
    // Restore title after print dialog closes
    setTimeout(() => { document.title = "Captain Culinary Kids"; }, 1000);
  };

  const toggleSpeak = () => {
    const text = askResponse ? askResponse.text : captainResponse.text;
    if (speaking) {
      stop();
    } else {
      speak(text);
    }
  };

  return (
    <div className="cck-page" data-testid="live-teaching-plate-page">
      {/* top bar — hidden on print */}
      <div className="flex items-center justify-between gap-3 no-print" data-no-print>
        <button
          onClick={() => { stop(); nav("/lessons"); }}
          className="inline-flex items-center gap-2 text-sm font-semibold"
          style={{ color: "var(--cck-navy-soft)" }}
          data-testid="lesson-back-btn"
        >
          <ArrowLeft size={18} /> Library
        </button>
        <div className="flex items-center gap-3">
          {ttsSupported && (
            <button
              onClick={toggleSpeak}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full"
              style={{
                background: speaking ? "var(--cck-teal)" : "var(--cck-cream-deep)",
                color: speaking ? "#fff" : "var(--cck-navy)",
                border: `1px solid ${speaking ? "var(--cck-teal)" : "var(--cck-paper-line)"}`,
              }}
              title={speaking ? "Stop narration" : "Play narration"}
              data-testid="lesson-tts-btn"
            >
              {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
              {speaking ? "Stop" : "Listen"}
            </button>
          )}
          <div className="flex items-center gap-1.5" data-testid="lesson-step-dots">
            <Dot active={isWelcome} />
            {lesson.steps.map((s, i) => (
              <Dot key={s.id} active={i === stepIdx} done={i < stepIdx} />
            ))}
          </div>
        </div>
      </div>

      {/* lesson header — hidden on print */}
      <div className="mt-3 no-print" data-no-print>
        <div className="cck-eyebrow">{lesson.path}</div>
        <h1
          className="cck-h1 mt-1"
          style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)" }}
          data-testid="lesson-title"
        >
          {lesson.title}
        </h1>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="cck-tag cck-tag-gold">{lesson.time}</span>
          <span className="cck-tag cck-tag-teal">{lesson.safetyLevel}</span>
          <span className="cck-tag cck-tag-navy">{lesson.difficulty}</span>
        </div>
      </div>

      {/* print-only title header */}
      <div className="print-only print-header">
        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700 }}>
          Captain Culinary Kids
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "#555" }}>
          {lesson.title}
        </div>
      </div>

      {/* the plate — the main print content */}
      <div className="mt-5 cck-anim-fade-up print-plate-target" data-testid="teaching-plate-container">
        <Plate />
      </div>

      {/* everything below is hidden on print */}
      {!isWelcome && (
        <OrnamentDivider className="no-print">
          Step {stepIdx + 1} of {totalSteps} · {lesson.steps[stepIdx].title}
        </OrnamentDivider>
      )}
      {isWelcome && <OrnamentDivider className="no-print">Welcome</OrnamentDivider>}

      {/* captain narration */}
      <div className="no-print">
        <CaptainCard
          title="Captain Culinary"
          body={askResponse ? askResponse.text : captainResponse.text}
          footer={
            <div
              className="text-sm italic"
              style={{ fontFamily: "var(--font-body)", color: "var(--cck-teal-deep)" }}
              data-testid="captain-followup"
            >
              {askResponse?.followUp || captainResponse.followUp}
            </div>
          }
        />
      </div>

      {/* action buttons */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 no-print">
        <button
          onClick={moveOn}
          className="cck-btn-primary inline-flex items-center justify-center gap-2 text-sm sm:text-base"
          data-testid="lesson-move-on-btn"
        >
          {isLastStep ? "Take the Quiz" : isWelcome ? "Begin" : "Move On"}
          <ArrowRight size={16} />
        </button>
        <button
          onClick={() => setAskOpen((v) => !v)}
          className="cck-btn-coral inline-flex items-center justify-center gap-2 text-sm sm:text-base"
          data-testid="lesson-ask-question-btn"
        >
          <MessageCircleQuestion size={16} />
          Ask
        </button>
        <button
          onClick={explainAgain}
          className="cck-btn-ghost inline-flex items-center justify-center gap-2 text-sm"
          data-testid="lesson-explain-again-btn"
        >
          <RefreshCw size={16} />
          Explain Again
        </button>
        <button
          onClick={showBiblical}
          className="cck-btn-gold inline-flex items-center justify-center gap-2 text-sm"
          data-testid="lesson-biblical-btn"
          disabled={biblicalShown}
        >
          <BookOpen size={16} />
          Life Connection
        </button>
      </div>

      {/* print plate button */}
      <div className="mt-3 flex justify-end no-print">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{
            background: "var(--cck-cream-deep)",
            color: "var(--cck-navy-soft)",
            border: "1px solid var(--cck-paper-line)",
          }}
          title="Print this teaching plate"
          data-testid="lesson-print-btn"
        >
          <Printer size={13} />
          Print Plate
        </button>
      </div>

      {/* ask captain quick prompts */}
      {askOpen && (
        <div className="mt-5 cck-card p-5 cck-anim-fade-up no-print" data-testid="ask-captain-panel">
          <div className="flex items-center gap-3">
            <CaptainCulinary size="sm" />
            <div>
              <div className="cck-eyebrow">Ask Captain</div>
              <div className="text-sm mt-1" style={{ color: "var(--cck-navy-soft)" }}>
                Choose a question or type your own.
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {ASK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => handleAsk(p)}
                className="cck-btn-ghost text-xs sm:text-sm"
                data-testid={`ask-prompt-${p.replace(/\s+/g, "-").toLowerCase()}`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              value={askQuery}
              onChange={(e) => setAskQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && askQuery.trim()) handleAsk(askQuery.trim());
              }}
              placeholder="Type your question..."
              className="cck-input flex-1"
              data-testid="ask-captain-input"
            />
            <button
              onClick={() => askQuery.trim() && handleAsk(askQuery.trim())}
              className="cck-btn-primary text-sm"
              data-testid="ask-captain-submit"
            >
              Ask
            </button>
          </div>
          <button
            onClick={() => setAskOpen(false)}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold"
            style={{ color: "var(--cck-navy-soft)" }}
            data-testid="ask-captain-close"
          >
            <ChevronDown size={14} /> Close
          </button>
        </div>
      )}

      {/* lesson summary block */}
      <div className="mt-6 cck-card p-5 text-sm no-print" data-testid="lesson-meta">
        <div className="cck-eyebrow">Lesson Notes</div>
        <p className="mt-2" style={{ color: "var(--cck-navy-soft)", fontFamily: "var(--font-body)" }}>
          {lesson.summary}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="cck-tag cck-tag-blue">Family Challenge</span>
          <span className="text-sm" style={{ color: "var(--cck-navy)" }}>
            {lesson.familyChallenge}
          </span>
        </div>
      </div>
    </div>
  );
}

function PaywallGate({ lesson, nav }) {
  return (
    <div className="cck-page flex flex-col items-center text-center" data-testid="paywall-gate">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mt-4"
        style={{ background: "var(--cck-cream-deep)" }}
      >
        <Lock size={26} style={{ color: "var(--cck-navy)" }} />
      </div>
      <div className="cck-eyebrow mt-3">Full Unlock Required</div>
      <h2 className="cck-h2 mt-1">{lesson.title}</h2>
      <p
        className="mt-3 max-w-sm text-sm"
        style={{ fontFamily: "var(--font-body)", color: "var(--cck-navy-soft)" }}
      >
        This lesson is part of the full Captain Culinary Kids curriculum.
        Unlock all 7 lessons for a one-time purchase — no subscription.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => nav("/purchase")}
          className="cck-btn-primary inline-flex items-center gap-2"
          data-testid="paywall-unlock-btn"
        >
          <BookOpen size={16} />
          Unlock All Lessons — $14.99
        </button>
        <button
          onClick={() => nav("/lessons")}
          className="cck-btn-ghost"
          data-testid="paywall-back-btn"
        >
          Back to Library
        </button>
      </div>
      <p className="mt-4 text-xs" style={{ color: "var(--cck-navy-soft)" }}>
        First lesson (Kitchen Safety Basics) is always free.
      </p>
    </div>
  );
}

function Dot({ active, done }) {
  let bg = "var(--cck-paper-line-soft)";
  if (done) bg = "var(--cck-teal)";
  if (active) bg = "var(--cck-coral)";
  return (
    <div
      className="w-2 h-2 rounded-full transition-colors duration-300"
      style={{ background: bg }}
    />
  );
}
