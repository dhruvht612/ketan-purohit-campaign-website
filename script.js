/* =================================================================
   Ketan Purohit — TDSB Ward 12 Campaign
   script.js  (vanilla JavaScript — no frameworks)

   Sections:
   1.  Footer year
   2.  Mobile hamburger menu
   3.  Dropdown menus (mobile tap + accessible)
   4.  Connect tabs (Volunteer / Updates / Feedback)
   5.  FAQ accordion
   6.  Form validation + captcha + submit handlers
   7.  Service placeholders (Sheets / Excel / Email)
   8.  Scroll reveal animations
   9.  Back-to-top button
   ================================================================= */

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  /* -----------------------------------------------------------------
     1. FOOTER YEAR
  ----------------------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -----------------------------------------------------------------
     2. MOBILE HAMBURGER MENU
  ----------------------------------------------------------------- */
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");

  function closeMenu() {
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var open = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    // Close the mobile menu after tapping any link
    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navMenu.classList.contains("is-open")) {
        closeMenu();
        navToggle.focus();
      }
    });
  }

  /* -----------------------------------------------------------------
     3. DROPDOWN MENUS
     Hover/focus is handled in CSS for desktop. On touch / small
     screens we toggle with a click for accessibility.
  ----------------------------------------------------------------- */
  document.querySelectorAll(".nav__dd-btn").forEach(function (btn) {
    var menu = document.getElementById(btn.getAttribute("aria-controls"));
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var isOpen = menu.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(isOpen));
    });
  });

  // Click outside closes any open dropdown (desktop)
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".has-dropdown")) {
      document.querySelectorAll(".dropdown.is-open").forEach(function (d) {
        d.classList.remove("is-open");
        var ctrl = document.querySelector('[aria-controls="' + d.id + '"]');
        if (ctrl) ctrl.setAttribute("aria-expanded", "false");
      });
    }
  });

  /* -----------------------------------------------------------------
     4. CONNECT TABS
     Buttons across the page carry data-tab="volunteer|updates|feedback"
     so any CTA can deep-link to the right form.
  ----------------------------------------------------------------- */
  var tabButtons = document.querySelectorAll(".tabs__btn");
  var panels = document.querySelectorAll(".tabs__panel");

  function activateTab(name) {
    tabButtons.forEach(function (b) {
      var active = b.dataset.tab === name;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", String(active));
      b.tabIndex = active ? 0 : -1;
    });
    panels.forEach(function (p) {
      var active = p.id === "panel-" + name;
      p.classList.toggle("is-active", active);
      p.hidden = !active;
    });
  }

  tabButtons.forEach(function (btn, i) {
    btn.addEventListener("click", function () { activateTab(btn.dataset.tab); });

    // Arrow-key navigation between tabs (WAI-ARIA pattern)
    btn.addEventListener("keydown", function (e) {
      var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      var next = (i + dir + tabButtons.length) % tabButtons.length;
      tabButtons[next].focus();
      activateTab(tabButtons[next].dataset.tab);
    });
  });

  // Any element (nav link, hero CTA) with data-tab jumps to Connect + opens the tab
  document.querySelectorAll('[data-tab]').forEach(function (el) {
    if (el.classList.contains("tabs__btn")) return;
    el.addEventListener("click", function () {
      activateTab(el.dataset.tab);
    });
  });

  /* -----------------------------------------------------------------
     5. FAQ ACCORDION
     Animated open/close using measured height so transitions are
     smooth. aria-expanded keeps screen readers in sync.
  ----------------------------------------------------------------- */
  document.querySelectorAll(".acc__trigger").forEach(function (trigger) {
    var panel = document.getElementById(trigger.getAttribute("aria-controls"));

    trigger.addEventListener("click", function () {
      var isOpen = trigger.getAttribute("aria-expanded") === "true";

      if (isOpen) {
        panel.style.height = panel.scrollHeight + "px";   // set current height
        requestAnimationFrame(function () { panel.style.height = "0px"; });
        panel.addEventListener("transitionend", function handler() {
          panel.hidden = true;
          panel.style.height = "";
          panel.removeEventListener("transitionend", handler);
        });
        trigger.setAttribute("aria-expanded", "false");
      } else {
        panel.hidden = false;
        var target = panel.scrollHeight;
        panel.style.height = "0px";
        requestAnimationFrame(function () { panel.style.height = target + "px"; });
        panel.addEventListener("transitionend", function handler() {
          panel.style.height = "";   // allow natural height afterwards
          panel.removeEventListener("transitionend", handler);
        });
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* -----------------------------------------------------------------
     6. FORMS — validation, captcha, clear, submit
  ----------------------------------------------------------------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^[\d\s()+.-]{7,}$/;

  // Set up a fresh math captcha for a form (keeps it human-friendly)
  function seedCaptcha(form) {
    var wrap = form.querySelector("[data-captcha]");
    if (!wrap) return;
    var a = Math.floor(Math.random() * 5) + 2; // 2..6
    var b = Math.floor(Math.random() * 4) + 1; // 1..4
    wrap.querySelector("[data-captcha-q]").textContent = a + " + " + b;
    wrap.dataset.answer = String(a + b);
  }

  function setError(input, message) {
    input.classList.toggle("is-invalid", !!message);
    input.setAttribute("aria-invalid", message ? "true" : "false");
    var slot = input.parentElement.querySelector("[data-error]");
    if (slot) slot.textContent = message || "";
  }

  function showMessage(form, text, type) {
    var box = form.querySelector("[data-message]");
    if (!box) return;
    box.textContent = text;
    box.classList.remove("is-success", "is-error");
    box.classList.add(type === "error" ? "is-error" : "is-success");
  }

  function clearMessage(form) {
    var box = form.querySelector("[data-message]");
    if (box) { box.textContent = ""; box.classList.remove("is-success", "is-error"); }
  }

  // Validate a single form. Returns a data object if valid, else null.
  function validateForm(form) {
    var ok = true;

    form.querySelectorAll("input, textarea").forEach(function (input) {
      if (input.type === "checkbox") return;
      var val = input.value.trim();
      var msg = "";

      if (input.hasAttribute("required") && !val) {
        msg = "This field is required.";
      } else if (input.type === "email" && val && !EMAIL_RE.test(val)) {
        msg = "Enter a valid email address.";
      } else if (input.type === "tel" && val && !PHONE_RE.test(val)) {
        msg = "Enter a valid phone number.";
      }
      setError(input, msg);
      if (msg) ok = false;
    });

    // Captcha check
    var captcha = form.querySelector("[data-captcha]");
    if (captcha) {
      var field = captcha.querySelector("[data-captcha-input]");
      if (field.value.trim() !== captcha.dataset.answer) {
        setError(field, "Incorrect — please try again.");
        ok = false;
      }
    }

    if (!ok) return null;

    // Build a clean data object (ready for an API / Sheet row)
    var data = {};
    form.querySelectorAll("input, textarea").forEach(function (input) {
      if (input.name === "captcha") return;
      if (input.type === "checkbox") {
        if (input.checked) {
          data[input.name] = data[input.name] || [];
          data[input.name].push(input.value);
        }
      } else {
        data[input.name] = input.value.trim();
      }
    });
    data.submittedAt = new Date().toISOString();
    return data;
  }

  // Wire one form to its submit handler
  function wireForm(formId, handler, successText) {
    var form = document.getElementById(formId);
    if (!form) return;
    seedCaptcha(form);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearMessage(form);
      var data = validateForm(form);
      if (!data) {
        showMessage(form, "Please fix the highlighted fields and try again.", "error");
        var firstBad = form.querySelector(".is-invalid");
        if (firstBad) firstBad.focus();
        return;
      }
      handler(data);                 // hand off to service placeholder
      showMessage(form, successText, "success");
      form.reset();
      seedCaptcha(form);             // refresh captcha for next time
    });

    // Clear button
    var clearBtn = form.querySelector("[data-clear]");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        form.reset();
        form.querySelectorAll(".is-invalid").forEach(function (el) { setError(el, ""); });
        clearMessage(form);
        seedCaptcha(form);
      });
    }
  }

  /* -----------------------------------------------------------------
     7. SERVICE PLACEHOLDERS
     These three functions are the single integration point. Today
     they just log the structured payload. Later, drop in a fetch()
     to Google Sheets / a serverless endpoint / an email service —
     the data object is already shaped as one clean row.
  ----------------------------------------------------------------- */
  function submitVolunteer(data) {
    console.log("[submitVolunteer] payload ready for Sheets/Email:", data);
    sendAutomatedEmail("volunteer", data);
    // Example wiring:
    // fetch("/api/volunteer", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data) });
  }

  function submitEnrollment(data) {
    console.log("[submitEnrollment] payload ready for Sheets/Email:", data);
    sendAutomatedEmail("updates", data);
  }

  function submitFeedback(data) {
    console.log("[submitFeedback] payload ready for Sheets/Email:", data);
    sendAutomatedEmail("feedback", data);
  }

  // Placeholder for the auto-reply email (samples 1/2/3 in the brief)
  function sendAutomatedEmail(type, data) {
    console.log("[email] auto-reply queued — template:", type, "→", data.email);
    // Later: call your transactional email provider here.
  }

  wireForm("volunteerForm", submitVolunteer,
    "Thank you for volunteering! We'll be in touch shortly with next steps.");
  wireForm("updatesForm", submitEnrollment,
    "You're on the list — watch your inbox for campaign updates.");
  wireForm("feedbackForm", submitFeedback,
    "Thank you for sharing your feedback. Every message is read.");

  /* -----------------------------------------------------------------
     8. SCROLL REVEAL ANIMATIONS
  ----------------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* -----------------------------------------------------------------
     9. BACK-TO-TOP BUTTON
  ----------------------------------------------------------------- */
  var toTop = document.getElementById("toTop");
  if (toTop) {
    toTop.hidden = false; // present in DOM; CSS .is-visible controls appearance
    window.addEventListener("scroll", function () {
      toTop.classList.toggle("is-visible", window.scrollY > 600);
    }, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* -----------------------------------------------------------------
     DONATE placeholder reminder
  ----------------------------------------------------------------- */
  var donate = document.getElementById("donateBtn");
  if (donate) {
    donate.addEventListener("click", function (e) {
      if (donate.getAttribute("href") === "#") {
        e.preventDefault();
        console.log("[donate] Replace href with your Square donation link.");
      }
    });
  }
});
