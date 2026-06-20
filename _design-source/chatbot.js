/* ============================================================
   Ask-about-Vivek — rule-based assistant (NO external AI)
   Matches a question against a resume-derived knowledge base
   and replies. All logic runs locally in the browser.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Knowledge base (most specific intents first) ---------- */
  const KB = [
    /* ===== Greetings / meta ===== */
    {
      keys: ["hi", "hii", "hey", "hello", "yo", "hola", "namaste", "good morning", "good evening", "good afternoon", "greetings", "sup", "howdy"],
      short: true,
      a: "Hi there — I'm Vivek's assistant. Ask me about his <b>experience</b>, <b>skills</b>, <b>projects</b>, <b>current work</b>, <b>education</b>, or how to <b>get in touch</b>."
    },
    {
      keys: ["who are you", "what are you", "are you a bot", "are you ai", "are you real", "are you human", "what can you do", "help", "how do you work"],
      a: "I'm a small assistant built into Vivek's portfolio — no external AI, just a curated knowledge base about his work. Try: <i>“current work”</i>, <i>“tell me about ResConnect”</i>, <i>“his skills”</i>, <i>“achievements”</i>, or <i>“how to contact him”</i>."
    },

    /* ===== Current work ===== */
    {
      keys: ["current", "currently", "right now", "these days", "present", "doing now", "latest role", "latest project", "dnata", "work now", "working on", "nowadays", "today"],
      a: "Right now Vivek is a <b>Senior Technical Lead</b> (Software Architect track) at <b>Coforge</b>, working for <b>Dnata Travel</b> — architecting an <b>image migration from SQL Server</b> (images stored inside SQL Server) <b>to Azure Blob Storage</b> and designing the supporting APIs on a <b>.NET</b> tech stack."
    },
    {
      keys: ["azure", "blob", "sql server", ".net", "dotnet", "image migration", "storage migration"],
      a: "On his current <b>Dnata Travel</b> engagement (via Coforge), Vivek is architecting a migration of images <b>stored inside SQL Server</b> over to <b>Azure Blob Storage</b>, and designing the supporting <b>.NET</b> APIs — improving scalability and decoupling binary storage from the database."
    },

    /* ===== ResConnect umbrella ===== */
    {
      keys: ["resconnect", "res connect", "emirates project", "emirates platform", "airline platform", "agent booking"],
      a: "<b>ResConnect</b> is Emirates' airline agent booking platform — a multi-year program Vivek worked on at Coforge across 6 projects:<br>• <b>Microservices transformation</b> (Bags, TIBCO→Wasola, data layer)<br>• <b>Sidecar authentication</b> (Azure AD, JWT)<br>• <b>Legacy development &amp; support</b> on the monolith<br>• <b>Monolith modularization</b><br>• <b>RBAC access management</b><br>• <b>Microfrontend POC</b><br>Ask about any of these for details!"
    },

    /* ===== Project 1: Microservices Transformation ===== */
    {
      keys: ["microservice transformation", "microservices transformation", "decomposition", "monolith to microservice", "bags", "ancillary", "wasola", "tibco", "soap to rest", "service decomposition", "booking service"],
      a: "<b>Microservices Transformation (2025–26)</b> — incremental decomposition of the legacy booking monolith, across four active modules:<br>• <b>Ancillary Services — Bags</b>: end-to-end UI + backend.<br>• <b>TIBCO → Wasola</b>: migrated SOAP integrations to RESTful Wasola services by extracting transformation/orchestration into a dedicated microservice — no big-bang rewrite.<br>• <b>Data-layer optimisation</b> for query performance.<br>Stack: Java 17, Spring Boot, React, REST, Oracle, Couchbase."
    },

    /* ===== Project 2: Authentication / Sidecar ===== */
    {
      keys: ["sidecar", "authentication", "auth", "access token", "jwt", "azure ad", "token validation", "spring security", "api gateway", "security pattern", "authorization gateway"],
      a: "<b>Authentication — Access Token &amp; Sidecar (2024–25)</b> — centralized auth for the microservices platform. A dedicated <b>access-token validation</b> service is attached to every service via the <b>sidecar pattern</b>, so auth logic isn't duplicated. Requests flow through a Spring Cloud Gateway → Azure AD token validation → Spring Security claims/role enforcement; invalid tokens are blocked with 401 before reaching the service. Stack: Java 17, Spring API Gateway, Azure AD, JWT, Spring Security."
    },

    /* ===== Project 3: Legacy Dev ===== */
    {
      keys: ["legacy development", "legacy enhancement", "change request", "production support", "monolith development", "feature development"],
      a: "<b>Legacy Development &amp; Enhancement (Aug 2022 – Mar 2025)</b> — feature work and production support on the high-traffic ResConnect monolith (Spring Framework + AngularJS): flight booking, agent workflows and ancillary services, integrating Oracle (RDBMS) and Couchbase (NoSQL), resolving live production issues while keeping the system stable and backward-compatible."
    },

    /* ===== Project 4: Modularization ===== */
    {
      keys: ["modularization", "modularisation", "modular architecture", "separate repo", "fat jar", "monolith refactor", "code structure"],
      a: "<b>Monolith Modularization (May 2023 – Mar 2025)</b> — refactored the monolith into a modular architecture as the foundation for microservices: separated frontend and backend into independent repositories, introduced modular design with Java 17 / Spring Boot, while retaining a single deployable (fat JAR). Improved code ownership, testability and migration-readiness."
    },

    /* ===== Project 5: RBAC ===== */
    {
      keys: ["rbac", "access management", "role based", "permission", "roles", "user access", "authorization platform"],
      a: "<b>Access Management — RBAC (Jan 2024 – Aug 2024)</b> — a centralized Role-Based Access Control system managing agent permissions across applications. Vivek extended role-location-permission mapping in <b>Couchbase</b> via a Spring Boot (Java 17) authorization microservice, and built a <b>React.js</b> UI for managing roles, permissions and user access — enabling dynamic authorization across services."
    },

    /* ===== Project 6: Microfrontend POC ===== */
    {
      keys: ["microfrontend", "micro frontend", "micro-frontend", "ui modernization", "ui modernisation", "module federation", "frontend architecture poc"],
      a: "<b>UI Modernization — Microfrontend POC (May 2024 – Aug 2024)</b> — a proof of concept modernizing the agent booking UI with a microfrontend architecture: modular UI for independent development and deployment, evaluating integration of <b>AngularJS with React.js</b> to improve frontend scalability, maintainability and team autonomy."
    },

    /* ===== Hindustan Times umbrella ===== */
    {
      keys: ["hindustan", "times", "ht ", "content platform", "publishing platform", "news platform", "media company"],
      a: "At <b>Hindustan Times</b> (Sep 2010 – Aug 2022), Vivek built content platforms at news scale — 5 projects:<br>• <b>Auto Crawling &amp; Scraping Platform</b><br>• <b>HTS Portal</b> (millions of articles, Solr search)<br>• <b>NewZZa Mobile Backend</b><br>• <b>NMS RSS Delivery</b> &amp; <b>RSS Splitter</b> modules.<br>Ask about any one for details!"
    },

    /* ===== Project 7: Crawling & Scraping ===== */
    {
      keys: ["crawling", "scraping", "crawler", "scraper", "selenium", "htmlunit", "content automation", "auto crawl", "templating", "delivery system", "css selector", "xpath scraping"],
      a: "<b>Auto Crawling &amp; Scraping Platform (2017–21, Hindustan Times)</b> — an end-to-end content automation platform of four integrated systems: <b>Configuration Management</b> (per-site rules via CSS selectors &amp; XPath), <b>Crawling &amp; Scraping</b> (Selenium + HTMLUnit), <b>Article Templating</b>, and a <b>Delivery System</b> (FTP &amp; RSS) — supporting the full writer → QA → client review lifecycle. Stack: Java, Spring Boot, Vue.js, Quasar."
    },

    /* ===== Project 8: NMS RSS Delivery ===== */
    {
      keys: ["rss delivery", "article delivery", "nms delivery", "rss feed", "basic authentication", "feed delivery", "client rss"],
      a: "<b>NMS — Article Delivery via RSS (2016, Hindustan Times)</b> — a configurable RSS-based content delivery system for external clients. Built a Vue.js + Quasar UI to manage client configurations and RSS mappings, backend APIs to generate dynamic feeds based on delivery rules, and secured the endpoints with Basic Authentication."
    },

    /* ===== Project 9: RSS Splitter ===== */
    {
      keys: ["rss splitter", "splitter", "feed processing", "jdom", "scheduler", "split feed", "category feed"],
      a: "<b>NMS — RSS Splitter (2016, Hindustan Times)</b> — a Spring Boot console application that parses and splits RSS feeds into category-based feeds using JDOM, with sources/rules configured in application.yml, scheduled jobs via Spring Scheduler, and per-feed article limits enforced on merge."
    },

    /* ===== Project 10: NewZZa ===== */
    {
      keys: ["newzza", "mobile backend", "mobile api", "rest backend", "solrj", "mobile app backend"],
      a: "<b>NewZZa Mobile Backend (2015, Hindustan Times)</b> — a RESTful backend serving articles and media to mobile apps. Built REST APIs with Spring MVC and Hibernate, integrated Apache Solr (SolrJ) for indexed retrieval, and used MySQL for configuration and metadata — scalable for content retrieval, filtering and mobile-specific use cases."
    },

    /* ===== Project 11: HTS Portal ===== */
    {
      keys: ["hts portal", "hts", "large scale content", "struts", "millions of articles", "search platform", "ingestion pipeline", "bootstrap portal"],
      a: "<b>HTS Portal (2012–14, Hindustan Times)</b> — a large-scale platform managing millions of articles and images across multiple publications with high-volume daily ingestion. Architecture: Spring DI, Struts 2 (MVC), Hibernate ORM, Bootstrap UI; an FTP ingestion pipeline storing content with metadata; Apache Solr for search/indexing; and MySQL query/index tuning for performance."
    },

    /* ===== Thomson umbrella + Project 12 ===== */
    {
      keys: ["thomson", "indesign", "pagination", "typesetting", "xslt", "xpath", "auto pagination", "elsevier", "pearson", "publishing automation", "dtd"],
      a: "<b>Adobe InDesign Auto Pagination (2008–10, Thomson Digital)</b> — an XML-driven pagination workflow built from scratch to automate InDesign typesetting for publishers like Elsevier and Pearson (each with their own XML DTDs). Vivek researched the InDesign JavaScript SDK, built XML→XML transformation in Java/XSLT/XPath, and wrote automation scripts that auto-fill and typeset pages <b>80–90%</b> — auto table/image placement, bookmarking, linking, XML-out and index generation."
    },

    /* ===== Project 13: Kiosk ===== */
    {
      keys: ["kiosk", "advertisement", "ad management", "ads", "wallet", "laravel", "php", "redis", "rajasthan", "bus terminal", "display system"],
      a: "<b>Centralised Kiosk Display &amp; Ad Management</b> — a Linux-based kiosk system displaying advertisements on schedule, with an <b>ad wallet</b> (debit on a successful play, refund on failure). Vivek built the Vue.js admin UI and a backend on PHP, Laravel, MySQL, Redis and queues. Deployed at Rajasthan bus terminals and some malls."
    },

    /* ===== XML / publishing (Thomson general) ===== */
    {
      keys: ["xml", "transformation pipeline", "r&d", "rnd", "research"],
      a: "Vivek's R&amp;D roots are at <b>Thomson Digital (2007–2010)</b>, automating XML-based publishing — Adobe InDesign typesetting via its JavaScript SDK, and XML transformation pipelines in Java, XSLT and XPath for publishers like Elsevier and Pearson."
    },

    /* ===== QuoteAssist POC ===== */
    {
      keys: ["quoteassist", "quote assist", "poc", "personal project", "side project", "ai project", "elixir", "phoenix project", "quote processing", "llm", "genai", "rag", "agentic", "outlook"],
      a: "<b>QuoteAssist</b> is Vivek's in-progress personal <b>AI POC (2025–26)</b> — a platform that ingests travel quote requests from Outlook or web forms, uses an <b>LLM</b> to extract structured fields (with per-field confidence), enforces corporate policies via <b>RAG</b>, generates pricing-ready JSON and drafts email replies. It self-improves: agent corrections become training signals that graduate trusted patterns to <b>auto-send</b>. Stack: Elixir/Phoenix/OTP, Python (LLM/RAG), React + MS Graph API, PostgreSQL."
    },

    /* ===== Resume download ===== */
    {
      keys: ["resume", "cv", "download resume", "download cv", "view resume", "curriculum", "pdf", "download", "his resume"],
      a: "You can view Vivek's résumé here: <a href='Vivek-Kumar-Resume.pdf' target='_blank' rel='noopener'>📄 View Resume (PDF)</a>. It's also linked in the chat header and on the page."
    },

    /* ===== Contact ===== */
    {
      keys: ["contact", "email", "reach", "hire", "linkedin", "phone", "connect", "get in touch", "available", "message", "mail", "recruit", "opportunity", "job offer"],
      a: "You can reach Vivek at <a href='mailto:viveksingh0143@gmail.com'>viveksingh0143@gmail.com</a> or on <a href='https://linkedin.com/in/viveksingh0143' target='_blank' rel='noopener'>LinkedIn</a>. He's open to architecture leadership and system-design roles."
    },

    /* ===== Education ===== */
    {
      keys: ["education", "degree", "study", "studied", "college", "university", "qualification", "bsc", "b.sc", "diploma", "graduate", "academic", "computer science"],
      a: "Vivek holds a <b>B.Sc. in Computer Science</b> from Sikkim Manipal University and a <b>Diploma in Information Technology</b> from the Board of Technical Education, Uttar Pradesh."
    },

    /* ===== Achievements ===== */
    {
      keys: ["achievement", "accomplish", "award", "recognition", "recognized", "proud", "highlight", "best work", "impact", "notable"],
      a: "Key highlights:<br>• <b>TIBCO → Wasola migration</b> — moved SOAP integrations to RESTful services incrementally, with no big-bang rewrite.<br>• Led a <b>monolith → microservices</b> transformation that shaped the platform's service design.<br>• Adopted <b>AI tooling</b> for unit-test generation and legacy-code comprehension, improving delivery efficiency."
    },

    /* ===== Skills: overview ===== */
    {
      keys: ["skill", "skills", "tech stack", "technolog", "expertise", "tools", "what does he know", "capabilities", "strength"],
      a: "Vivek's toolkit:<br>• <b>Architecture:</b> microservices, event-driven, distributed systems, DDD, API gateway, sidecar.<br>• <b>Backend:</b> Java 17, Spring Boot, Spring Cloud, Hibernate, Struts 2, REST.<br>• <b>Frontend:</b> AngularJS, React.js, Vue.js, micro-frontends (Module Federation).<br>• <b>Messaging &amp; Data:</b> Kafka, Solace, Couchbase, Oracle, MySQL, Apache Solr.<br>• <b>Platform:</b> CI/CD, Jenkins, Git, VAPT/PT, Agile.<br>• <b>Add-on:</b> Golang, PHP, Phoenix Framework."
    },
    /* ===== Skills: backend ===== */
    {
      keys: ["backend", "java", "spring", "spring boot", "hibernate", "rest api", "server side"],
      a: "<b>Backend:</b> Java 17, Spring Boot, Spring Cloud, Spring MVC, Spring Security, Hibernate, Struts 2 and REST APIs — the core of most of Vivek's platforms."
    },
    /* ===== Skills: frontend ===== */
    {
      keys: ["frontend", "front end", "front-end", "angular", "angularjs", "react", "vue", "quasar", "ui", "webpack"],
      a: "<b>Frontend:</b> AngularJS, React.js and Vue.js (with Quasar), plus micro-frontend architecture via Module Federation / Webpack. Vivek works full-stack — building UIs as well as the services behind them."
    },
    /* ===== Skills: data & messaging ===== */
    {
      keys: ["database", "data", "messaging", "kafka", "solace", "couchbase", "oracle", "mysql", "solr", "nosql", "queue"],
      a: "<b>Messaging &amp; Data:</b> Apache Kafka and Solace for event-driven messaging; Couchbase (distributed NoSQL), Oracle and MySQL for storage; Apache Solr for high-performance search indexing."
    },
    /* ===== Skills: add-on ===== */
    {
      keys: ["golang", "go lang", "phoenix", "elixir", "php", "laravel", "other languages", "add on", "add-on"],
      a: "Beyond his core JVM stack, Vivek also works with <b>Golang</b>, <b>PHP</b> (Laravel) and the <b>Phoenix Framework</b> as add-on skills."
    },
    /* ===== Architecture concepts ===== */
    {
      keys: ["architecture", "architect", "distributed system", "event driven", "event-driven", "domain driven", "ddd", "system design", "design pattern", "scalability"],
      a: "Vivek is a <b>software architect</b> who breaks monoliths into microservices, designs domain-driven service boundaries, event-driven communication (Kafka/Solace), API gateways and sidecar security — building in scalability, fault isolation and independent deployments from the start."
    },

    /* ===== Projects overview ===== */
    {
      keys: ["project", "projects", "built", "build", "portfolio", "case study", "shipped", "what did he make", "what has he built"],
      a: "Vivek has <b>14 projects</b> plus a personal AI POC:<br>• <b>Personal:</b> QuoteAssist — agentic AI quote-processing platform (Elixir/Phoenix + Python LLM).<br>• <b>Emirates / Coforge (6):</b> microservices transformation, sidecar auth, legacy dev, modularization, RBAC, microfrontend POC.<br>• <b>Hindustan Times (5):</b> crawling &amp; scraping platform, HTS Portal, NewZZa backend, RSS delivery, RSS splitter.<br>• <b>Thomson Digital (2):</b> InDesign auto-pagination, kiosk ad system.<br>Ask about any one for details!"
    },

    /* ===== Experience / career ===== */
    {
      keys: ["experience", "work history", "career", "companies", "employer", "worked", "jobs", "background", "journey", "where has he", "timeline", "coforge"],
      a: "Vivek's career spans three companies:<br>• <b>Coforge</b> — Senior Technical Lead / Software Architect (Aug 2022 – Present); Emirates &amp; Dnata Travel.<br>• <b>Hindustan Times</b> — Senior Software Engineer (2010 – 2022).<br>• <b>Thomson Digital</b> — Executive, R&amp;D (2007 – 2010)."
    },
    {
      keys: ["how many years", "how long", "years of experience", "experienced", "seniority", "14 years", "total experience"],
      a: "Vivek has <b>14+ years</b> of software engineering experience across airline, media and publishing domains."
    },

    /* ===== Leadership ===== */
    {
      keys: ["lead", "team", "mentor", "manage", "leadership", "people", "guide", "review", "mentoring", "direction"],
      a: "Vivek sets technical direction and leads teams — guiding 7+ developers and QA engineers, mentoring through design &amp; code reviews, and shaping the service architecture the platform is built on."
    },

    /* ===== Location ===== */
    {
      keys: ["location", "where", "based", "live", "city", "country", "ghaziabad", "india", "relocate", "remote", "place"],
      a: "Vivek is based in <b>Ghaziabad, Uttar Pradesh, India</b>."
    },

    /* ===== Domains ===== */
    {
      keys: ["domain", "industry", "industries", "sector", "airline", "aviation", "publishing", "media"],
      a: "Vivek has worked across three domains: <b>airline</b> (Emirates &amp; Dnata booking platforms), <b>media</b> (Hindustan Times content systems) and <b>publishing</b> (Thomson Digital typesetting automation)."
    },

    /* ===== Title / role ===== */
    {
      keys: ["title", "role", "position", "designation", "what is his job", "what does he do", "principal", "senior technical lead"],
      a: "Vivek is a <b>Senior Technical Lead</b> on the <b>Software Architect</b> track — setting technical direction, designing systems, and building hands-on across backend, frontend and data."
    },

    /* ===== Summary / about ===== */
    {
      keys: ["summary", "about", "tell me about", "who is", "yourself", "intro", "overview", "describe", "bio", "profile"],
      a: "<b>Vivek Kumar</b> is a Senior Technical Lead / Software Architect with <b>14+ years</b> building large-scale systems across airline, media and publishing domains. He breaks monoliths into microservices, designs how systems communicate, and builds in security and scale from the start — known for setting technical direction and mentoring teams."
    },

    /* ===== Pleasantries ===== */
    {
      keys: ["thank", "thanks", "thx", "appreciate", "great", "cool", "awesome", "nice", "perfect", "good"],
      short: true,
      a: "Anytime! Ask me anything else about Vivek's work, skills, projects, or how to reach him."
    },
    {
      keys: ["bye", "goodbye", "see you", "later", "cya", "good night"],
      short: true,
      a: "Thanks for stopping by — feel free to reach out to Vivek over email or LinkedIn anytime."
    }
  ];

  const FALLBACK =
    "I'm not sure about that one — I only know about Vivek. Try asking about his <b>experience</b>, <b>skills</b>, <b>projects</b>, <b>education</b>, <b>achievements</b>, or <b>contact</b> details.";

  const INTRO =
    "Hi — I'm Vivek's assistant. I can tell you about his experience, skills, projects, and more. What would you like to know?";

  const SUGGESTIONS = [
    "What is Vivek working on now?",
    "Tell me about ResConnect",
    "The sidecar auth project?",
    "His tech skills?",
    "Crawling & scraping platform?",
    "Notable achievements?",
    "View Resume",
    "How can I contact him?"
  ];

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
          // longer keys: substring, weighted by length & word count
          score += 1 + key.split(" ").length;
        }
      }
      if (score > bestScore) { bestScore = score; best = intent; }
    }
    return bestScore > 0 ? best.a : FALLBACK;
  }

  /* ---------- DOM wiring ---------- */
  const widget  = document.getElementById("chat");
  const toggle  = document.getElementById("chat-toggle");
  const closeBt = document.getElementById("chat-close");
  const log     = document.getElementById("chat-log");
  const form    = document.getElementById("chat-form");
  const input   = document.getElementById("chat-input");
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
