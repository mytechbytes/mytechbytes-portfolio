/* ============================================================
   Vivek Kumar — Portfolio interactions
   - Theme toggle (data-theme, persisted to localStorage)
   - Scroll reveal (rect-based — robust in any embed context)
   - Animated skill bars
   - Nav shell on scroll + active section highlight
   - Dynamic footer year
   Mobile nav drawer is handled in pure CSS (hidden checkbox).
   ============================================================ */
(function () {
  "use strict";

  const root = document.documentElement;
  const THEME_KEY = "vk-theme";

  /* ---------- Theme toggle ---------- */
  // Initial theme is applied pre-paint by an inline script in <head>.
  function setTheme(name) {
    root.setAttribute("data-theme", name);
    try {
      localStorage.setItem(THEME_KEY, name);
    } catch (e) {
      /* storage unavailable — ignore */
    }
  }

  document.addEventListener("click", function (e) {
    const t = e.target.closest("[data-theme-toggle]");
    if (!t) return;
    const isDark = root.getAttribute("data-theme") === "dark";
    setTheme(isDark ? "light" : "dark");
  });

  /* Close the pure-CSS mobile drawer when a link inside it is tapped */
  const navToggle = document.getElementById("nav-toggle");
  document.querySelectorAll("[data-mobile-link]").forEach((a) =>
    a.addEventListener("click", () => {
      if (navToggle) navToggle.checked = false;
    })
  );

  /* ---------- Helpers ---------- */
  const vh = () => window.innerHeight || document.documentElement.clientHeight;
  function inView(el, margin) {
    const r = el.getBoundingClientRect();
    return r.top < vh() - (margin || 0) && r.bottom > 0;
  }

  const nav = document.getElementById("nav");
  const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
  const bars = Array.from(document.querySelectorAll(".skill-fill"));
  const sections = Array.from(document.querySelectorAll("section[id]"));
  const links = Array.from(document.querySelectorAll(".nav-link"));
  const linkFor = (id) => links.find((l) => l.getAttribute("href") === "#" + id);

  /* ---------- Main scroll-driven update ---------- */
  function update() {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 24);

    for (let i = revealEls.length - 1; i >= 0; i--) {
      const el = revealEls[i];
      if (inView(el, vh() * 0.08)) {
        el.classList.add("is-visible");
        revealEls.splice(i, 1);
      }
    }

    for (let i = bars.length - 1; i >= 0; i--) {
      const b = bars[i];
      if (inView(b, vh() * 0.12)) {
        const lvl = b.getAttribute("data-level") || "0";
        b.style.width = lvl + "%";
        bars.splice(i, 1);
      }
    }

    let current = null;
    const probe = vh() * 0.4;
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) {
        current = s.id;
        break;
      }
    }
    if (current) {
      links.forEach((l) => l.classList.remove("active"));
      const link = linkFor(current);
      if (link) link.classList.add("active");
    }
  }

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  window.addEventListener("load", update);

  update();
  requestAnimationFrame(update);
  setTimeout(update, 250);
  setTimeout(update, 800);

  /* ---------- Footer year ---------- */
  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
