/* ============================================================
   Ask-about-Vivek — rule-based assistant (no external AI)
   Matches a question against the knowledge base in chat.json
   and replies. All logic runs locally in the browser; the data
   is bundled from src/data/chat.json at build time, so answers
   are edited there without touching this file.
   ============================================================ */
import chat from "../data/chat.json";

(function () {
  "use strict";

  const KB = chat.knowledge || [];
  const FALLBACK = chat.assistant?.refusal ||
    "I can only help with questions related to Vivek Kumar's work and background.";
  const INTRO = chat.ui?.intro || "Hi — ask me about Vivek.";
  const SUGGESTIONS = chat.ui?.suggestions || [];

  /* ---------- Matching ---------- */
  function tokenize(s) {
    return s.toLowerCase().replace(/[^a-z0-9+#.& ]/g, " ").split(/\s+/).filter(Boolean);
  }

  function findAnswer(query) {
    const q = " " + query.toLowerCase().trim() + " ";
    const tokens = tokenize(query);
    let best = null, bestScore = 0;

    for (const intent of KB) {
      let score = 0;
      for (const key of intent.keys) {
        if (key.length <= 3 || intent.short) {
          // short keys: match whole words only (avoids "hi" inside "this")
          if (tokens.includes(key)) score += 2;
        } else if (q.includes(" " + key) || q.includes(key + " ") || q.includes(key)) {
          // longer keys: substring, weighted by word count, and boosted when the
          // key is specific (proper nouns / distinctive terms > 6 chars) so a
          // match like "resconnect" outranks a generic key like "about".
          let pts = 1 + key.split(" ").length;
          if (key.length > 6) pts *= 2;
          score += pts;
        }
      }
      if (score > bestScore) { bestScore = score; best = intent; }
    }
    return bestScore > 0 ? best.answer : FALLBACK;
  }

  /* ---------- DOM wiring ---------- */
  const widget = document.getElementById("chat");
  const toggle = document.getElementById("chat-toggle");
  const closeBt = document.getElementById("chat-close");
  const log = document.getElementById("chat-log");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const suggest = document.getElementById("chat-suggest");
  if (!widget) return;

  let opened = false;

  function scrollLog() { log.scrollTop = log.scrollHeight; }

  function addMsg(html, who) {
    const div = document.createElement("div");
    div.className = "msg " + who;
    div.innerHTML = html;
    log.appendChild(div);
    scrollLog();
    return div;
  }

  function showTyping() {
    const div = document.createElement("div");
    div.className = "msg bot typing";
    div.innerHTML = "<span></span><span></span><span></span>";
    log.appendChild(div);
    scrollLog();
    return div;
  }

  function botReply(query) {
    const answer = findAnswer(query);
    const typing = showTyping();
    const delay = 380 + Math.min(900, answer.length * 4);
    setTimeout(() => {
      typing.remove();
      addMsg(answer, "bot");
    }, delay);
  }

  function send(text) {
    const t = text.trim();
    if (!t) return;
    addMsg(t.replace(/</g, "&lt;"), "user");
    input.value = "";
    botReply(t);
  }

  function renderSuggestions() {
    suggest.innerHTML = "";
    SUGGESTIONS.forEach((s) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chat-chip";
      b.textContent = s;
      b.addEventListener("click", () => { send(s); });
      suggest.appendChild(b);
    });
  }

  function openChat() {
    widget.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    if (!opened) {
      opened = true;
      setTimeout(() => addMsg(INTRO, "bot"), 250);
      renderSuggestions();
    }
    setTimeout(() => input.focus(), 320);
  }
  function closeChat() {
    widget.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", () =>
    widget.classList.contains("open") ? closeChat() : openChat()
  );
  closeBt.addEventListener("click", closeChat);
  form.addEventListener("submit", (e) => { e.preventDefault(); send(input.value); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && widget.classList.contains("open")) closeChat();
  });
})();
