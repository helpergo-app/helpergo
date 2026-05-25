/**
 * HelperGo — FR / EN / AR
 */
(function () {
  "use strict";

  var STORAGE_KEY = "helpergo-lang";
  var SUPPORTED = ["fr", "en", "ar"];
  var dict = window.HELPERGO_I18N || {};
  var LANG_LABELS = { fr: "Français", en: "English", ar: "العربية" };

  function normalizeLang(code) {
    var c = (code || "").toLowerCase().slice(0, 2);
    return SUPPORTED.indexOf(c) !== -1 ? c : "fr";
  }

  function getStoredLang() {
    try {
      return normalizeLang(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      return "fr";
    }
  }

  var currentLang = getStoredLang();

  function t(key) {
    var pack = dict[currentLang] || dict.fr || {};
    if (pack[key] != null) return pack[key];
    if (currentLang !== "fr" && dict.fr && dict.fr[key] != null) return dict.fr[key];
    return key;
  }

  function applyToElement(el) {
    var key = el.getAttribute("data-i18n");
    if (key) el.textContent = t(key);

    var ph = el.getAttribute("data-i18n-placeholder");
    if (ph) el.placeholder = t(ph);

    var aria = el.getAttribute("data-i18n-aria");
    if (aria) el.setAttribute("aria-label", t(aria));

    var htmlKey = el.getAttribute("data-i18n-html");
    if (htmlKey) el.innerHTML = t(htmlKey);
  }

  function applyOptions() {
    document.querySelectorAll("option[data-i18n]").forEach(function (opt) {
      opt.textContent = t(opt.getAttribute("data-i18n"));
    });
  }

  function applyTitle() {
    var page = document.body.getAttribute("data-page");
    if (!page) return;
    var titleKey = "meta.title." + page;
    var title = t(titleKey);
    if (title && title !== titleKey) document.title = title;
  }

  function applyDirAndLang() {
    var html = document.documentElement;
    html.lang = currentLang;
    html.dir = currentLang === "ar" ? "rtl" : "ltr";
    document.body.classList.toggle("is-rtl", currentLang === "ar");
  }

  function updateLangUi() {
    document.querySelectorAll(".lang-option").forEach(function (btn) {
      var code = btn.getAttribute("data-lang");
      var active = code === currentLang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });

    document.querySelectorAll(".lang-trigger").forEach(function (trigger) {
      var label = LANG_LABELS[currentLang] || "Français";
      var base = t("common.langAria");
      trigger.setAttribute("aria-label", base + " — " + label);
    });
  }

  function closeAllLangMenus() {
    document.querySelectorAll(".lang-dropdown.is-open").forEach(function (dropdown) {
      dropdown.classList.remove("is-open");
      var trigger = dropdown.querySelector(".lang-trigger");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });
  }

  function apply() {
    applyDirAndLang();
    applyTitle();
    document
      .querySelectorAll("[data-i18n], [data-i18n-placeholder], [data-i18n-aria], [data-i18n-html]")
      .forEach(applyToElement);
    applyOptions();
    updateLangUi();
    window.dispatchEvent(
      new CustomEvent("helpergo:langchange", { detail: { lang: currentLang } })
    );
  }

  function setLang(lang) {
    currentLang = normalizeLang(lang);
    try {
      localStorage.setItem(STORAGE_KEY, currentLang);
    } catch (e) {
      /* ignore */
    }
    closeAllLangMenus();
    apply();
  }

  function initLangDropdown() {
    document.querySelectorAll(".lang-dropdown").forEach(function (dropdown) {
      var trigger = dropdown.querySelector(".lang-trigger");
      var menu = dropdown.querySelector(".lang-menu");
      if (!trigger || !menu) return;

      trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        var willOpen = !dropdown.classList.contains("is-open");
        closeAllLangMenus();
        if (willOpen) {
          dropdown.classList.add("is-open");
          trigger.setAttribute("aria-expanded", "true");
        }
      });

      menu.querySelectorAll(".lang-option").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          setLang(btn.getAttribute("data-lang"));
        });
      });
    });

    document.addEventListener("click", function () {
      closeAllLangMenus();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAllLangMenus();
    });
  }

  window.HelperGoI18n = {
    t: t,
    getLang: function () {
      return currentLang;
    },
    setLang: setLang,
    apply: apply,
    getHeroPhrases: function () {
      return [t("index.hero.phrase0"), t("index.hero.phrase1"), t("index.hero.phrase2")];
    },
  };

  document.addEventListener("DOMContentLoaded", function () {
    initLangDropdown();
    apply();
  });
})();
