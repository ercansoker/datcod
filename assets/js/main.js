/* ==========================================================================
   Datcod — main.js
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // reveal stilleri yalnızca JS varken devreye girsin
  document.documentElement.classList.add("js");

  /* ---------- yıl ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- mobil menü ---------- */
  var nav = document.getElementById("mainNav");
  var toggle = document.getElementById("navToggle");

  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a") && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Menüyü aç");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ---------- header: hero'yu geçince beyaza dön ---------- */
  var header = document.getElementById("siteHeader");
  var hero = document.getElementById("anasayfa");

  if (header && hero) {
    var syncHeader = function () {
      var past = window.scrollY > hero.offsetHeight - 90;
      header.classList.toggle("solid", past);
    };
    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
    window.addEventListener("resize", syncHeader);
  }

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 70 + "ms";
      revealObserver.observe(el);
    });

    // Güvenlik ağı: observer hiç tetiklenmediyse içerik gizli kalmasın.
    window.setTimeout(function () {
      if (document.querySelector(".reveal.in")) return;
      reveals.forEach(function (el) { el.classList.add("in"); });
    }, 2500);
  }

  /* ---------- hero slider ---------- */
  var slider = document.getElementById("heroSlider");

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".slide"));
    var dotsWrap = slider.querySelector(".slider-dots");
    var current = 0;
    var timer = null;
    var paused = false;
    var DELAY = 5500;

    var dots = slides.map(function (slide, i) {
      var caption = slide.querySelector("figcaption");
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
      dot.setAttribute("aria-label", (i + 1) + ". görsel" + (caption ? ": " + caption.textContent.trim() : ""));
      dot.addEventListener("click", function () { go(i); restart(); });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function go(next) {
      current = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        var on = i === current;
        slide.classList.toggle("is-active", on);
        slide.setAttribute("aria-hidden", on ? "false" : "true");
        dots[i].setAttribute("aria-selected", on ? "true" : "false");
      });
    }

    function stop() { window.clearInterval(timer); timer = null; }

    function start() {
      if (reduceMotion || paused || document.hidden || slides.length < 2 || timer) return;
      timer = window.setInterval(function () { go(current + 1); }, DELAY);
    }

    // Elle gezinildiğinde sayaç sıfırlanır; duraklatılmışsa yeniden başlamaz.
    function restart() { stop(); start(); }

    function pause() { paused = true; stop(); }
    function resume() { paused = false; start(); }

    slider.querySelector(".slider-arrow.prev").addEventListener("click", function () { go(current - 1); restart(); });
    slider.querySelector(".slider-arrow.next").addEventListener("click", function () { go(current + 1); restart(); });

    slider.addEventListener("mouseenter", pause);
    slider.addEventListener("mouseleave", resume);
    slider.addEventListener("focusin", pause);
    slider.addEventListener("focusout", resume);

    slider.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { go(current - 1); restart(); }
      if (e.key === "ArrowRight") { go(current + 1); restart(); }
    });

    // sekme arka plandayken boşuna dönmesin
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });

    start();
  }

  /* ---------- menüde aktif bölüm ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav ul a[href^="#"]'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------- iletişim formu ---------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  if (form) {
    var setError = function (input, message) {
      var field = input.closest(".field");
      var err = field.querySelector(".err");
      field.classList.toggle("invalid", Boolean(message));
      if (err) err.textContent = message || "";
    };

    form.addEventListener("input", function (e) {
      if (e.target.closest(".field.invalid")) setError(e.target, "");
    });

    var submitBtn = form.querySelector('button[type="submit"]');

    var durumGoster = function (metin, tur) {
      if (!status) return;
      status.textContent = metin || "";
      status.classList.remove("ok", "err");
      if (tur) status.classList.add(tur);
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.elements.name;
      var email = form.elements.email;
      var message = form.elements.message;
      var ok = true;

      if (!name.value.trim()) { setError(name, "Lütfen adınızı yazın."); ok = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        setError(email, "Geçerli bir e-posta adresi girin."); ok = false;
      }
      if (message.value.trim().length < 10) {
        setError(message, "Biraz daha detay yazabilir misiniz?"); ok = false;
      }

      if (!ok) {
        durumGoster("");
        form.querySelector(".field.invalid input, .field.invalid textarea").focus();
        return;
      }

      // Turnstile, api.js yüklenince gizli bir input olarak token basar.
      var tokenAlani = form.querySelector('[name="cf-turnstile-response"]');
      var token = tokenAlani ? tokenAlani.value : "";
      if (!token) {
        durumGoster("Güvenlik doğrulaması henüz tamamlanmadı. Birkaç saniye sonra tekrar deneyin.", "err");
        return;
      }

      var veri = {
        name: name.value.trim(),
        company: form.elements.company.value.trim(),
        email: email.value.trim(),
        phone: form.elements.phone.value.trim(),
        topic: form.elements.topic.value,
        message: message.value.trim(),
        website: form.elements.website ? form.elements.website.value : "",
        turnstileToken: token
      };

      submitBtn.disabled = true;
      var eskiEtiket = submitBtn.textContent;
      submitBtn.textContent = "Gönderiliyor…";
      durumGoster("");

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(veri)
      })
        .then(function (r) {
          return r.json().catch(function () { return { ok: false }; });
        })
        .then(function (sonuc) {
          if (sonuc && sonuc.ok) {
            form.reset();
            durumGoster("Mesajınız ulaştı. En kısa sürede size döneceğiz.", "ok");
          } else {
            durumGoster(
              (sonuc && sonuc.hata) || "Mesaj gönderilemedi. info@datcod.com adresine yazabilirsiniz.",
              "err"
            );
          }
        })
        .catch(function () {
          durumGoster("Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.", "err");
        })
        .then(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = eskiEtiket;
          // Her gönderimde token bir kez kullanılır; yenisini almak için sıfırla.
          if (window.turnstile) {
            try { window.turnstile.reset(); } catch (err) { /* widget henüz yoksa önemsiz */ }
          }
        });
    });
  }
})();
