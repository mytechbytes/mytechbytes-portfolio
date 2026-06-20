/* ============================================================
   QuoteAssist — animated request-flow loop
   Drives the live dot animation in the QuoteAssist architecture
   diagram. Safe no-op on pages where the SVG isn't present.
   ============================================================ */
(function () {
  "use strict";

  const dot = document.getElementById("animDot");
  const label = document.getElementById("qa-flow-label");
  if (!dot || !label) return; // diagram not on this page

  const steps = [
    { label: "1 — Quote request received via Outlook / Web Form", arrows: ["la1", "la2"], path: [{ x: 61, y: 63 }, { x: 200, y: 100 }], type: "normal" },
    { label: "2 — Message enqueued in Elixir / OTP Queue (Oban)", arrows: ["la3"], path: [{ x: 200, y: 100 }, { x: 238, y: 100 }], type: "normal" },
    { label: "3 — Queue dequeues → Phoenix Orchestrator", arrows: ["la4"], path: [{ x: 238, y: 160 }, { x: 406, y: 200 }], type: "normal" },
    { label: "4 — Orchestrator routes to Python AI Engine", arrows: ["la5"], path: [{ x: 480, y: 234 }, { x: 622, y: 150 }], type: "normal" },
    { label: "5 — AI: Quote Extraction (LLM + NLP + confidence)", arrows: [], path: [{ x: 622, y: 90 }, { x: 622, y: 140 }], type: "normal" },
    { label: "5a — ⚠ Extraction fails → Dead Letter Queue", arrows: ["lf1"], path: [{ x: 534, y: 86 }, { x: 482, y: 86 }], type: "failure" },
    { label: "6 — Confidence Gate: score checked per field", arrows: [], path: [{ x: 622, y: 160 }, { x: 622, y: 200 }], type: "normal" },
    { label: "6a — ⚠ Low confidence → Human Review queue", arrows: ["lf2"], path: [{ x: 534, y: 170 }, { x: 416, y: 335 }], type: "warning" },
    { label: "7 — Missing Data Detection: gap analysis", arrows: [], path: [{ x: 622, y: 240 }, { x: 622, y: 280 }], type: "normal" },
    { label: "7a — Missing fields → Clarification mail drafted", arrows: ["la8"], path: [{ x: 742, y: 260 }, { x: 905, y: 227 }], type: "warning" },
    { label: "8 — Policy Enforcement: corporate rules via RAG", arrows: [], path: [{ x: 622, y: 320 }, { x: 622, y: 360 }], type: "normal" },
    { label: "8a — ⚠ Policy breach → Rejected + audit logged", arrows: ["lf3"], path: [{ x: 534, y: 337 }, { x: 416, y: 457 }], type: "failure" },
    { label: "9 — Draft Generation: email + pricing JSON built", arrows: [], path: [{ x: 622, y: 400 }, { x: 622, y: 435 }], type: "normal" },
    { label: "10 — Output: JSON → Pricing Service", arrows: ["la6", "la9"], path: [{ x: 742, y: 420 }, { x: 905, y: 67 }], type: "normal" },
    { label: "11 — Draft email → Agent review or auto-send", arrows: ["la7"], path: [{ x: 742, y: 200 }, { x: 905, y: 149 }], type: "normal" },
    { label: "12 — High-value quote → Approval Workflow gate", arrows: [], path: [{ x: 905, y: 275 }, { x: 905, y: 335 }], type: "normal" },
    { label: "13 — Agent corrects → Feedback Loop triggered", arrows: ["lfb1", "lfb3"], path: [{ x: 416, y: 362 }, { x: 416, y: 528 }], type: "learning" },
    { label: "14 — Training signal stored → Model fine-tuning", arrows: ["lfb2"], path: [{ x: 622, y: 530 }, { x: 622, y: 450 }], type: "learning" },
    { label: "✅ Flow complete — replaying…", arrows: [], path: [{ x: 622, y: 400 }, { x: 622, y: 400 }], type: "done" },
  ];

  const allArrows = ["la1", "la2", "la3", "la4", "la5", "la6", "la7", "la8", "la9", "lf1", "lf2", "lf3", "lfb1", "lfb2", "lfb3"];
  const colorMap = { normal: "#ffffff", failure: "#f85149", warning: "#e3b341", learning: "#e3b341", done: "#30a46c" };

  let stepIdx = 0;
  let timer = null;
  let rafId = null;
  let watchdog = null;
  let visible = true;

  function resetDiagram() {
    clearTimeout(timer);
    stepIdx = 0;
    dot.setAttribute("opacity", "0");
    dot.setAttribute("cx", "-50");
    dot.setAttribute("cy", "-50");
    allArrows.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.setAttribute("opacity", "0.15");
    });
    label.textContent = "Auto-playing request flow…";
    label.classList.remove("active");
  }

  function animateDot(x1, y1, x2, y2, color, ms, cb) {
    dot.setAttribute("fill", color);
    dot.setAttribute("r", color === "#f85149" ? "8" : "7");
    dot.setAttribute("opacity", "1");
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      dot.setAttribute("cx", x2);
      dot.setAttribute("cy", y2);
      cb && cb();
    };
    const t0 = performance.now();
    function frame(now) {
      if (done) return;
      const t = Math.min((now - t0) / ms, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      dot.setAttribute("cx", x1 + (x2 - x1) * ease);
      dot.setAttribute("cy", y1 + (y2 - y1) * ease);
      if (t < 1) rafId = requestAnimationFrame(frame);
      else finish();
    }
    rafId = requestAnimationFrame(frame);
    // Watchdog: if rAF is throttled (background tab), still advance the flow
    clearTimeout(watchdog);
    watchdog = setTimeout(finish, ms + 300);
  }

  function runStep() {
    if (!visible) return; // paused while off-screen
    if (stepIdx >= steps.length) {
      resetDiagram();
      timer = setTimeout(runStep, 2000);
      return;
    }
    const s = steps[stepIdx];
    label.textContent = s.label;
    label.classList.add("active");
    s.arrows.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.setAttribute("opacity", "1");
    });
    const dotColor = colorMap[s.type] || "#fff";
    const p = s.path;
    const dur = s.type === "done" ? 400 : (s.type === "failure" ? 600 : 750);
    animateDot(p[0].x, p[0].y, p[1].x, p[1].y, dotColor, dur, () => {
      stepIdx++;
      const delay = s.type === "failure" ? 1000 : (s.type === "done" ? 500 : 700);
      timer = setTimeout(runStep, delay);
    });
  }

  function start() {
    resetDiagram();
    timer = setTimeout(runStep, 800);
  }

  // Respect reduced-motion: show the static diagram, no loop
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    label.textContent = "Request flow — Ingestion → Queue → Orchestrator → AI Engine → Output";
    return;
  }

  // Pause the loop when the diagram scrolls out of view (saves CPU)
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const wasVisible = visible;
        visible = e.isIntersecting;
        if (visible && !wasVisible) {
          clearTimeout(timer);
          timer = setTimeout(runStep, 400);
        } else if (!visible) {
          clearTimeout(timer);
          if (rafId) cancelAnimationFrame(rafId);
        }
      });
    }, { threshold: 0.15 });
    io.observe(dot.ownerSVGElement || dot);
  }

  start();
})();
