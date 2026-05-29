/**
 * HelperGo — Custom select (replaces native mobile picker)
 */
(function () {
  "use strict";

  function clearMenuHighlight(menu) {
    if (!menu) return;
    menu.querySelectorAll(".custom-select-option.is-highlighted").forEach(function (btn) {
      btn.classList.remove("is-highlighted");
    });
  }

  function highlightMenuOption(menu, option) {
    if (!menu || !option) return;
    var current = menu.querySelector(".custom-select-option.is-highlighted");
    if (current === option) return;
    clearMenuHighlight(menu);
    option.classList.add("is-highlighted");
  }

  function bindMenuHighlight(wrap, menu) {
    menu.addEventListener("mouseover", function (e) {
      if (!wrap.classList.contains("is-open")) return;
      var option = e.target.closest(".custom-select-option");
      if (option && menu.contains(option)) highlightMenuOption(menu, option);
    });

    menu.addEventListener("mouseleave", function () {
      clearMenuHighlight(menu);
    });

    menu.addEventListener(
      "touchmove",
      function (e) {
        if (!wrap.classList.contains("is-open")) return;
        var touch = e.touches[0];
        if (!touch) return;
        var el = document.elementFromPoint(touch.clientX, touch.clientY);
        var option = el && el.closest(".custom-select-option");
        if (option && menu.contains(option)) {
          highlightMenuOption(menu, option);
        }
      },
      { passive: true }
    );

    menu.addEventListener("touchend", function () {
      window.setTimeout(function () {
        clearMenuHighlight(menu);
      }, 120);
    });
  }

  function closeCustomSelect(wrap) {
    if (!wrap) return;
    wrap.classList.remove("is-open");
    var trigger = wrap.querySelector(".custom-select-trigger");
    var menu = wrap.querySelector(".custom-select-menu");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
    if (menu) {
      clearMenuHighlight(menu);
      menu.setAttribute("hidden", "");
    }
  }

  function closeAllCustomSelects(except) {
    document.querySelectorAll(".custom-select.is-open").forEach(function (wrap) {
      if (wrap !== except) closeCustomSelect(wrap);
    });
  }

  function openCustomSelect(wrap) {
    closeAllCustomSelects(wrap);
    wrap.classList.add("is-open");
    var trigger = wrap.querySelector(".custom-select-trigger");
    var menu = wrap.querySelector(".custom-select-menu");
    if (trigger) trigger.setAttribute("aria-expanded", "true");
    if (menu) {
      menu.removeAttribute("hidden");
      var selected = menu.querySelector(".custom-select-option.is-selected");
      if (selected) selected.scrollIntoView({ block: "nearest" });
    }
  }

  function updateTrigger(wrap) {
    var select = wrap.querySelector("select");
    var valueEl = wrap.querySelector(".custom-select-value");
    if (!select || !valueEl) return;

    var opt = select.options[select.selectedIndex];
    valueEl.textContent = opt ? opt.textContent : "";
    valueEl.classList.toggle("is-placeholder", !select.value);
  }

  function buildMenu(wrap) {
    var select = wrap.querySelector("select");
    var menu = wrap.querySelector(".custom-select-menu");
    if (!select || !menu) return;

    menu.innerHTML = "";
    Array.from(select.options).forEach(function (opt) {
      if (opt.disabled && opt.getAttribute("data-separator") === "true") {
        var sep = document.createElement("div");
        sep.className = "custom-select-separator";
        sep.setAttribute("role", "separator");
        sep.setAttribute("aria-hidden", "true");
        menu.appendChild(sep);
        return;
      }
      if (opt.disabled) return;

      var item = document.createElement("button");
      item.type = "button";
      item.className = "custom-select-option";
      item.setAttribute("role", "option");
      item.setAttribute("data-value", opt.value);
      item.textContent = opt.textContent;

      var isSelected = opt.value === select.value;
      item.setAttribute("aria-selected", isSelected ? "true" : "false");
      item.classList.toggle("is-selected", isSelected);
      if (!opt.value) item.classList.add("is-placeholder-option");

      item.addEventListener("click", function (e) {
        e.stopPropagation();
        selectOption(wrap, opt.value);
      });

      menu.appendChild(item);
    });
  }

  function selectOption(wrap, value) {
    var select = wrap.querySelector("select");
    var trigger = wrap.querySelector(".custom-select-trigger");
    if (!select) return;

    select.value = value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    buildMenu(wrap);
    updateTrigger(wrap);
    closeCustomSelect(wrap);
    if (trigger) trigger.focus();
  }

  function focusOption(menu, direction) {
    var options = Array.prototype.slice.call(menu.querySelectorAll(".custom-select-option"));
    if (!options.length) return;

    var idx = options.findIndex(function (btn) {
      return btn === document.activeElement;
    });
    if (idx === -1) {
      idx = options.findIndex(function (btn) {
        return btn.classList.contains("is-selected");
      });
    }
    if (idx === -1) idx = 0;

    idx += direction;
    if (idx < 0) idx = options.length - 1;
    if (idx >= options.length) idx = 0;
    options[idx].focus();
  }

  function initCustomSelect(wrap) {
    var select = wrap.querySelector("select");
    var trigger = wrap.querySelector(".custom-select-trigger");
    var menu = wrap.querySelector(".custom-select-menu");
    if (!select || !trigger || !menu) return;

    buildMenu(wrap);
    updateTrigger(wrap);

    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      if (wrap.classList.contains("is-open")) {
        closeCustomSelect(wrap);
      } else {
        openCustomSelect(wrap);
      }
    });

    trigger.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!wrap.classList.contains("is-open")) openCustomSelect(wrap);
        focusOption(menu, e.key === "ArrowDown" ? 1 : -1);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!wrap.classList.contains("is-open")) {
          openCustomSelect(wrap);
        }
      }
    });

    menu.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    menu.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        focusOption(menu, 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        focusOption(menu, -1);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (document.activeElement && document.activeElement.classList.contains("custom-select-option")) {
          document.activeElement.click();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeCustomSelect(wrap);
        trigger.focus();
      }
    });

    bindMenuHighlight(wrap, menu);

    wrap._refreshCustomSelect = function () {
      buildMenu(wrap);
      updateTrigger(wrap);
    };

    closeCustomSelect(wrap);
  }

  function initAll() {
    document.querySelectorAll("[data-custom-select]").forEach(initCustomSelect);
  }

  document.addEventListener("click", function (e) {
    document.querySelectorAll(".custom-select.is-open").forEach(function (wrap) {
      if (!wrap.contains(e.target)) closeCustomSelect(wrap);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAllCustomSelects();
  });

  window.addEventListener("helpergo:langchange", function () {
    document.querySelectorAll("[data-custom-select]").forEach(function (wrap) {
      if (wrap._refreshCustomSelect) wrap._refreshCustomSelect();
    });
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();
