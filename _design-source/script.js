/* ============================================================
   Vivek Kumar — Portfolio interactions
   - Theme toggle (persisted)
   - Scroll reveal (rect-based — robust in any embed context)
   - Animated skill bars
   - Smooth-scroll nav + active section highlight
   - Nav shell on scroll + mobile menu + dynamic year
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Theme ---------- */
  const root = document.documentElement;
  const stored = localStorage.getItem("vk-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (stored === "dark" || (!stored && prefersDark)) root.classList.add("dark");

  function setTheme(dark) {
    root.classList.toggle("dark", dark);
    localStorage.setItem("vk-theme", dark ? "dark" : "light");
  }

  document.addEventListener("click", function (e) {
    const t = e.target.closest("[data-theme-toggle]");
    if (t) setTheme(!root.classList.contains("dark"));
  });

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById("burger");
  const menu = document.getElementById("mobile-menu");
  if (burger && menu) {
    burger.addEventListener("click", () => {
      menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", menu.classList.contains("open"));
    });
    menu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        menu.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      })
    );
  }

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

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Main scroll-driven update ---------- */
  function update() {
    // nav shell
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 24);

    // reveals
    for (let i = revealEls.length - 1; i >= 0; i--) {
      const el = revealEls[i];
      if (inView(el, vh() * 0.08)) {
        el.classList.add("is-visible");
        revealEls.splice(i, 1);
      }
    }

    // skill bars
    for (let i = bars.length - 1; i >= 0; i--) {
      const b = bars[i];
      if (inView(b, vh() * 0.12)) {
        const lvl = b.getAttribute("data-level") || "0";
        b.style.width = lvl + "%";
        bars.splice(i, 1);
      }
    }

    // active nav link
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

  // throttle via rAF
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

  // initial passes (covers fonts/layout settling)
  update();
  requestAnimationFrame(update);
  setTimeout(update, 250);
  setTimeout(update, 800);

  /* ---------- Footer year ---------- */
  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
