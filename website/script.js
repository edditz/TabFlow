/* =================================================================
   TabFlow — brand website script
   Vanilla JS · no dependencies
   -----------------------------------------------------------------
   MODULES
   1.  i18n (translations + language toggle + persistence)
   2.  Navigation (scroll state, mobile menu)
   3.  Reveal-on-scroll (IntersectionObserver)
   4.  Layout switcher (Compact / Card / Tree)
   5.  OS toggle (Mac / Win keycaps)
   6.  FAQ accordion (single-open behaviour)
   7.  Magnetic CTA buttons
   8.  Pause hero SVG when off-screen (perf)
   ================================================================= */

(function () {
  "use strict";

  /* ============================================================ */
  /* 1. i18n — translations                                       */
  /* ============================================================ */

  const translations = {
    en: {
      skipToContent: "Skip to content",
      navFeatures: "Features",
      navLayouts: "Layouts",
      navShortcuts: "Shortcuts",
      navFaq: "FAQ",
      navCta: "Add to Chrome",

      heroEyebrow: "TAB MANAGEMENT, REIMAGINED · v1.1.1",
      heroTitlePrefix: "Where chaos finds its",
      heroTitleEm: "flow",
      heroLead: "Search every open tab, organize them into groups, and restore what you closed — in Chrome & Edge.",
      heroMeta: "Open source · MIT · Works on Chrome & Edge",

      trust1: "WORKS ON CHROME & EDGE",
      trust2: "MIT LICENSED",
      trust3: "KEYBOARD-FIRST",
      trust4: "NO TRACKING",

      featuresEyebrow: "CAPABILITIES",
      featuresTitle: "Everything your tabs need",

      f1Eyebrow: "SEARCH",
      f1Title: "Global Search Panel",
      f1Desc: "Instantly filter every open tab by title, URL, or domain.",
      f2Eyebrow: "SIDEBAR",
      f2Title: "Sidebar Tab Manager",
      f2Desc: "A Chrome Side Panel with three layouts to browse & manage tabs.",
      f3Eyebrow: "RECOVERY",
      f3Title: "Recently Closed",
      f3Desc: "Restore closed tabs in one click, within your chosen window.",
      f4Eyebrow: "LAYOUTS",
      f4Title: "Three Layouts",
      f4Desc: "Compact, Card, and Tree — switch instantly.",
      f5Eyebrow: "APPEARANCE",
      f5Title: "Themes",
      f5Desc: "Light, Dark, System — isolated via Shadow DOM.",
      f6Eyebrow: "I18N",
      f6Title: "Bilingual",
      f6Desc: "Full English & Chinese with live switching.",
      f7Eyebrow: "SPEED",
      f7Title: "Custom Shortcuts",
      f7Desc: "Rebind every shortcut, with Mac symbols & conflict detection.",

      layoutsEyebrow: "SIDEBAR",
      layoutsTitle: "Three ways to see your tabs",
      layoutCompact: "Compact",
      layoutCard: "Card",
      layoutTree: "Tree",
      recentTabs: "Recent",
      ungrouped: "Ungrouped",

      catWork: "Work",
      catDev: "Dev",
      catSocial: "Social",
      catShopping: "Shopping",
      catEntertainment: "Entertainment",
      catNews: "News",
      catDocs: "Docs",
      catOther: "Other",

      shortcutsEyebrow: "KEYBOARD-FIRST",
      shortcutsTitle: "At your fingertips",
      sc1Label: "Toggle Search Panel",
      sc2Label: "Toggle Side Panel",
      sc3Label: "Open Popup",
      shortcutsCaption: "Fully rebindable in settings — with conflict detection.",

      num1: "LAYOUTS",
      num2: "LANGUAGES",
      num3: "TABS",

      faqEyebrow: "QUESTIONS",
      faqTitle: "Good to know",
      q1: "Is TabFlow free?",
      a1: "Yes, 100% free and open source under MIT.",
      q2: "Does it work on Edge?",
      a2: "Yes, Chrome and Edge.",
      q3: "Is my data sent anywhere?",
      a3: "No tracking. Your data stays in your browser.",
      q4: "How do I install it?",
      a4: "Load the unpacked build, or grab it from the releases. See GitHub for steps.",
      q5: "Can I customize shortcuts?",
      a5: "Yes — every shortcut, with conflict detection.",
      q6: "Which languages?",
      a6: "English & Chinese, with live switching.",

      finalTitle: "Ready to find your flow?",
      ctaAddChrome: "Add to Chrome",
      ctaAddEdge: "Add to Edge",
      ctaGithub: "Star on GitHub",

      footerTagline: "Where chaos finds its flow.",
      footerProduct: "Product",
      footerResources: "Resources",
      footerGithub: "GitHub",
      footerReleases: "Releases",
      footerDocs: "Documentation",
      footerMadeBy: "Made by",
    },

    zh: {
      skipToContent: "跳到主要内容",
      navFeatures: "功能",
      navLayouts: "布局",
      navShortcuts: "快捷键",
      navFaq: "常见问题",
      navCta: "添加到 Chrome",

      heroEyebrow: "标签页管理，重新定义 · v1.1.1",
      heroTitlePrefix: "让混乱的标签页，找回",
      heroTitleEm: "秩序",
      heroLead: "把上百个标签页，搜索、分组、一键恢复。在 Chrome 与 Edge 上更从容地浏览。",
      heroMeta: "开源 · MIT 协议 · 支持 Chrome 与 Edge",

      trust1: "支持 CHROME 与 EDGE",
      trust2: "MIT 开源协议",
      trust3: "键盘优先",
      trust4: "不做追踪",

      featuresEyebrow: "核心能力",
      featuresTitle: "标签页所需的一切",

      f1Eyebrow: "搜索",
      f1Title: "全局搜索面板",
      f1Desc: "按标题、网址或域名，即时过滤所有打开的标签页。",
      f2Eyebrow: "侧边栏",
      f2Title: "侧边栏标签管理",
      f2Desc: "Chrome 侧边栏，三种布局浏览与管理标签页。",
      f3Eyebrow: "恢复",
      f3Title: "最近关闭",
      f3Desc: "在所选时间窗口内，一键恢复已关闭的标签页。",
      f4Eyebrow: "布局",
      f4Title: "三种布局",
      f4Desc: "紧凑、卡片、树形，即时切换。",
      f5Eyebrow: "外观",
      f5Title: "主题系统",
      f5Desc: "浅色、深色、跟随系统，Shadow DOM 隔离。",
      f6Eyebrow: "国际化",
      f6Title: "双语界面",
      f6Desc: "完整中英文，实时切换。",
      f7Eyebrow: "速度",
      f7Title: "自定义快捷键",
      f7Desc: "自定义全部快捷键，Mac 符号显示与冲突检测。",

      layoutsEyebrow: "侧边栏",
      layoutsTitle: "三种方式查看标签页",
      layoutCompact: "紧凑",
      layoutCard: "卡片",
      layoutTree: "树形",
      recentTabs: "最近",
      ungrouped: "未分组",

      catWork: "工作",
      catDev: "开发",
      catSocial: "社交",
      catShopping: "购物",
      catEntertainment: "娱乐",
      catNews: "新闻",
      catDocs: "文档",
      catOther: "其他",

      shortcutsEyebrow: "键盘优先",
      shortcutsTitle: "触手可及",
      sc1Label: "切换搜索面板",
      sc2Label: "切换侧边栏",
      sc3Label: "打开弹窗",
      shortcutsCaption: "全部可在设置中自定义，并检测冲突。",

      num1: "种布局",
      num2: "种语言",
      num3: "标签页",

      faqEyebrow: "常见问题",
      faqTitle: "你需要知道的",
      q1: "TabFlow 是免费的吗？",
      a1: "是的，完全免费，MIT 开源。",
      q2: "支持 Edge 吗？",
      a2: "支持，Chrome 与 Edge 均可。",
      q3: "我的数据会上传吗？",
      a3: "不做任何追踪，数据仅保存在本地浏览器。",
      q4: "如何安装？",
      a4: "加载未打包构建，或从 releases 获取，详见 GitHub。",
      q5: "能自定义快捷键吗？",
      a5: "可以，全部快捷键均可自定义并检测冲突。",
      q6: "支持哪些语言？",
      a6: "中英文，实时切换。",

      finalTitle: "准备好找回你的秩序了吗？",
      ctaAddChrome: "添加到 Chrome",
      ctaAddEdge: "添加到 Edge",
      ctaGithub: "在 GitHub 上 Star",

      footerTagline: "让混乱的标签页，找回秩序。",
      footerProduct: "产品",
      footerResources: "资源",
      footerGithub: "GitHub",
      footerReleases: "发布版本",
      footerDocs: "文档",
      footerMadeBy: "由",
    },
  };

  const LANG_KEY = "tabflow.lang";

  function detectLanguage() {
    const saved = readStorage(LANG_KEY);
    if (saved === "en" || saved === "zh") return saved;
    return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
  }

  function readStorage(key) {
    try { return window.localStorage.getItem(key); }
    catch (_e) { return null; }
  }
  function writeStorage(key, value) {
    try { window.localStorage.setItem(key, value); }
    catch (_e) { /* storage may be blocked; fail silently */ }
  }

  function applyLanguage(lang) {
    const dict = translations[lang] || translations.en;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      const key = el.getAttribute("data-i18n");
      const value = dict[key];
      if (value !== undefined) el.textContent = value;
    });
    document.documentElement.lang = lang;
    // Toggle button shows the OTHER language label
    document.querySelectorAll("[data-lang-label]").forEach(function (el) {
      el.textContent = lang === "en" ? "中文" : "EN";
    });
  }

  function toggleLanguage(current) {
    const next = current === "en" ? "zh" : "en";
    writeStorage(LANG_KEY, next);
    applyLanguage(next);
    return next;
  }

  /* ============================================================ */
  /* 2. Navigation                                                */
  /* ============================================================ */

  function initNav() {
    const nav = document.querySelector("[data-nav]");
    const menuToggle = document.querySelector("[data-menu-toggle]");
    const mobileMenu = document.querySelector("[data-mobile-menu]");

    if (nav) {
      const onScroll = function () {
        nav.classList.toggle("is-scrolled", window.scrollY > 24);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener("click", function () {
        const isOpen = !mobileMenu.hasAttribute("hidden");
        if (isOpen) {
          mobileMenu.setAttribute("hidden", "");
          menuToggle.setAttribute("aria-expanded", "false");
        } else {
          mobileMenu.removeAttribute("hidden");
          menuToggle.setAttribute("aria-expanded", "true");
        }
      });
      // Close mobile menu when a link is clicked
      mobileMenu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          mobileMenu.setAttribute("hidden", "");
          menuToggle.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  /* ============================================================ */
  /* 3. Reveal on scroll                                          */
  /* ============================================================ */

  function initReveal() {
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = document.querySelectorAll(".reveal");
    if (reduceMotion) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ============================================================ */
  /* 4. Layout switcher                                           */
  /* ============================================================ */

  function initLayoutSwitcher() {
    const tabs = document.querySelectorAll("[data-layout-tab]");
    const panels = document.querySelectorAll("[data-layout-panel]");
    if (!tabs.length || !panels.length) return;

    function activate(name) {
      tabs.forEach(function (tab) {
        const active = tab.getAttribute("data-layout-tab") === name;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", active ? "true" : "false");
      });
      panels.forEach(function (panel) {
        const active = panel.getAttribute("data-layout-panel") === name;
        if (active) {
          panel.removeAttribute("hidden");
          // re-trigger transition
          panel.classList.remove("is-active");
          void panel.offsetWidth;
          panel.classList.add("is-active");
        } else {
          panel.setAttribute("hidden", "");
          panel.classList.remove("is-active");
        }
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        activate(tab.getAttribute("data-layout-tab"));
      });
    });
  }

  /* ============================================================ */
  /* 5. OS toggle (Mac / Win keycaps)                             */
  /* ============================================================ */

  function initOsToggle() {
    const tabs = document.querySelectorAll(".os-toggle__btn");
    if (!tabs.length) return;

    const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
    const initial = readStorage("tabflow.os") || (isMac ? "mac" : "win");
    setOs(initial);

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        const os = tab.getAttribute("data-os");
        writeStorage("tabflow.os", os);
        setOs(os);
      });
    });
  }

  function setOs(os) {
    document.body.setAttribute("data-os", os);
    document.querySelectorAll(".os-toggle__btn").forEach(function (tab) {
      const active = tab.getAttribute("data-os") === os;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  /* ============================================================ */
  /* 6. FAQ accordion (single-open)                               */
  /* ============================================================ */

  function initFaq() {
    const items = document.querySelectorAll(".faq__item");
    items.forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (item.open) {
          items.forEach(function (other) {
            if (other !== item && other.open) other.open = false;
          });
        }
      });
    });
  }

  /* ============================================================ */
  /* 7. Magnetic CTA                                              */
  /* ============================================================ */

  function initMagnetic() {
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    if (matchMedia("(hover: none)").matches) return; // skip on touch

    const magnets = document.querySelectorAll("[data-magnetic]");
    magnets.forEach(function (el) {
      const strength = 0.25;
      el.addEventListener("mousemove", function (e) {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = "translate(" + (x * strength) + "px," + (y * strength) + "px)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transform = "";
      });
    });
  }

  /* ============================================================ */
  /* 8. Pause hero SVG when off-screen (perf)                     */
  /* ============================================================ */

  function initHeroPause() {
    const svg = document.querySelector("[data-flow-streams]");
    if (!svg) return;
    // Pause CSS animations on child streams/nodes/chips when hero is off-screen.
    // We toggle a class on the SVG rather than visibility (avoids layout flash).
    if (!("IntersectionObserver" in window)) return;
    const animated = svg.querySelectorAll(".stream, .node, .chip");
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        const playState = entry.isIntersecting ? "running" : "paused";
        animated.forEach(function (el) {
          el.style.animationPlayState = playState;
        });
      });
    }, { threshold: 0 });
    observer.observe(svg);
  }

  /* ============================================================ */
  /* Boot                                                         */
  /* ============================================================ */

  function initLangToggles(currentLang) {
    document.querySelectorAll("[data-lang-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        currentLang = toggleLanguage(currentLang);
      });
    });
  }

  function init() {
    let lang = detectLanguage();
    applyLanguage(lang);
    initLangToggles(lang);
    initNav();
    initReveal();
    initLayoutSwitcher();
    initOsToggle();
    initFaq();
    initMagnetic();
    initHeroPause();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
