(function(){

  /* =====================================================
     EDIT ME — quick personalization points
     ===================================================== */
  var SPOTIFY_TRACK_URL = "https://open.spotify.com/track/5k4lqXHUPP36MAaFkvBck9?si=1085254f42b6479c";           // paste a Spotify track/playlist share link here, e.g. "https://open.spotify.com/track/XXXXXXXX"
  var WEDDING_DATE = new Date(2026, 9, 31, 18, 0, 0); // Oct 31, 2026, 6:00 PM (change the "18" if the ceremony time differs)
  var ADMIN_PASSPHRASE = "alexandarisabella2026"; // couple-only passphrase to view RSVPs

  var U = window.WeddingUtils || {};
  var reducedMotion = U.prefersReducedMotion ? U.prefersReducedMotion() : false;

  /* ============ PRELOADER ============ */
  if (U.initPreloader) U.initPreloader(1700);

  /* ============ ENVELOPE INTRO (Removed - Now using shared component) ============ */


  /* ============ SCROLL REVEAL ============ */
  if (U.initScrollReveal) U.initScrollReveal();

  /* ============ COUNTDOWN ============ */
  function pad(n){ return String(n).padStart(2,'0'); }
  function tick(){
    var diff = WEDDING_DATE - new Date();
    if (diff < 0) diff = 0;
    var d = Math.floor(diff/86400000);
    var h = Math.floor(diff%86400000/3600000);
    var m = Math.floor(diff%3600000/60000);
    var s = Math.floor(diff%60000/1000);
    document.getElementById('cd-days').textContent = pad(d);
    document.getElementById('cd-hours').textContent = pad(h);
    document.getElementById('cd-mins').textContent = pad(m);
    document.getElementById('cd-secs').textContent = pad(s);
  }
  tick();
  setInterval(tick, 1000);

  /* ============ NARRATED LOVE STORY ============ */
  var narrateBtn = document.getElementById('narrate-btn');
  var narrateLabel = document.getElementById('narrate-label');
  var storyText = document.getElementById('story-text').innerText;
  var utterance = null;

  if ('speechSynthesis' in window){
    narrateBtn.addEventListener('click', function(){
      if (speechSynthesis.speaking){
        speechSynthesis.cancel();
        return;
      }
      utterance = new SpeechSynthesisUtterance(storyText);
      utterance.rate = 0.92;
      utterance.pitch = 1;
      utterance.onstart = function(){
        narrateBtn.classList.add('speaking');
        narrateBtn.setAttribute('aria-pressed','true');
        narrateLabel.textContent = 'Pause Narration';
      };
      utterance.onend = utterance.onerror = function(){
        narrateBtn.classList.remove('speaking');
        narrateBtn.setAttribute('aria-pressed','false');
        narrateLabel.textContent = 'Listen to Our Story';
      };
      speechSynthesis.speak(utterance);
    });
  } else {
    narrateBtn.style.display = 'none';
  }

  /* ============ MUSIC WIDGET ============ */
  var musicBtn = document.getElementById('music-btn');
  var musicPanel = document.getElementById('music-panel');
  var frameWrap = document.getElementById('music-frame-wrap');
  var emptyState = document.getElementById('music-empty-state');

  function spotifyEmbedSrc(url){
    var m = url.match(/spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
    if (!m) return null;
    return 'https://open.spotify.com/embed/' + m[1] + '/' + m[2] + '?utm_source=generator&theme=0';
  }

  var embedSrc = SPOTIFY_TRACK_URL ? spotifyEmbedSrc(SPOTIFY_TRACK_URL) : null;
  if (embedSrc){
    emptyState.style.display = 'none';
    frameWrap.style.display = 'block';
    frameWrap.innerHTML = '<iframe src="' + embedSrc + '" width="100%" height="152" frameborder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style="border-radius:12px;"></iframe>';
  }

  musicBtn.addEventListener('click', function(){
    var open = musicPanel.classList.toggle('open');
    musicBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    musicBtn.classList.toggle('playing', open && !!embedSrc);
  });

  /* ============ GALLERY + LIGHTBOX ============ */
  (function initGallery(){
    var grid = document.getElementById('gallery-grid');
    if (!grid) return;
    var items = (window.weddingData && window.weddingData.gallery) || [];

    if (!items.length){
      grid.style.display = 'none';
      var emptyEl = document.getElementById('gallery-empty');
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }

    grid.innerHTML = items.map(function(item, i){
      var alt = U.escapeHtml ? U.escapeHtml(item.alt || '') : (item.alt || '');
      var caption = item.caption ? '<figcaption class="gal-caption">' + (U.escapeHtml ? U.escapeHtml(item.caption) : item.caption) + '</figcaption>' : '';
      return '<figure class="gal-card" data-index="' + i + '" tabindex="0" role="button" aria-label="View photo: ' + alt + '">' +
        '<img src="' + item.src + '" alt="' + alt + '" loading="lazy" decoding="async">' +
        caption +
      '</figure>';
    }).join('');

    var cards = grid.querySelectorAll('.gal-card');
    if (!reducedMotion && 'IntersectionObserver' in window){
      var gio = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if (e.isIntersecting){ e.target.classList.add('is-visible'); gio.unobserve(e.target); }
        });
      }, {threshold:.1});
      cards.forEach(function(c, i){
        c.style.transitionDelay = Math.min(i * 60, 400) + 'ms';
        gio.observe(c);
      });
    } else {
      cards.forEach(function(c){ c.classList.add('is-visible'); });
    }

    /* ---- Lightbox ---- */
    var lightbox = document.getElementById('lightbox');
    var lbImg = document.getElementById('lightbox-img');
    var lbCaption = document.getElementById('lightbox-caption');
    var lbClose = document.getElementById('lightbox-close');
    var lbPrev = document.getElementById('lightbox-prev');
    var lbNext = document.getElementById('lightbox-next');
    var currentIndex = 0;

    function showLightbox(i){
      currentIndex = (i + items.length) % items.length;
      var item = items[currentIndex];
      lbImg.src = item.full || item.src;
      lbImg.alt = item.alt || '';
      lbCaption.textContent = item.caption || '';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function hideLightbox(){
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    cards.forEach(function(card){
      card.addEventListener('click', function(){
        showLightbox(parseInt(card.getAttribute('data-index'), 10));
      });
      card.addEventListener('keydown', function(e){
        if (e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          showLightbox(parseInt(card.getAttribute('data-index'), 10));
        }
      });
    });
    if (lbClose) lbClose.addEventListener('click', hideLightbox);
    if (lbPrev) lbPrev.addEventListener('click', function(){ showLightbox(currentIndex - 1); });
    if (lbNext) lbNext.addEventListener('click', function(){ showLightbox(currentIndex + 1); });

    if (lightbox){
      lightbox.addEventListener('click', function(e){
        if (e.target === lightbox) hideLightbox();
      });
      document.addEventListener('keydown', function(e){
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') hideLightbox();
        if (e.key === 'ArrowLeft') showLightbox(currentIndex - 1);
        if (e.key === 'ArrowRight') showLightbox(currentIndex + 1);
      });
      var touchStartX = null;
      lightbox.addEventListener('touchstart', function(e){ touchStartX = e.changedTouches[0].clientX; }, {passive:true});
      lightbox.addEventListener('touchend', function(e){
        if (touchStartX === null) return;
        var dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40){ dx < 0 ? showLightbox(currentIndex + 1) : showLightbox(currentIndex - 1); }
        touchStartX = null;
      }, {passive:true});
    }
  })();

  /* ============ RSVP SUBMIT ============ */
  var form = document.getElementById('rsvp-form');
  var confirmBox = document.getElementById('rsvp-confirm');

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var name = document.getElementById('r-name').value.trim();
    if (!name) return;

    var attendingInput = form.querySelector('input[name="attending"]:checked');
    var data = {
      name: name,
      attending: attendingInput ? attendingInput.value : 'Joyfully Accepts',
      guests: document.getElementById('r-guests').value,
      message: document.getElementById('r-msg').value.trim(),
      timestamp: new Date().toISOString()
    };

    var key = 'rsvp:' + Date.now() + '-' + name.toLowerCase().replace(/[^a-z0-9]+/g,'-');

    function showConfirm(){
      form.style.display = 'none';
      confirmBox.classList.add('show');
    }

    if (window.storage && window.storage.set){
      window.storage.set(key, JSON.stringify(data), true)
        .then(function(result){
          showConfirm();
          if (!result){ console.warn('RSVP may not have saved — storage returned empty result.'); }
        })
        .catch(function(err){
          console.error('RSVP storage error:', err);
          showConfirm();
        });
    } else {
      showConfirm();
    }
  });

  /* ============ ADMIN VIEW ============ */
  var adminLink = document.getElementById('admin-link');
  var adminModal = document.getElementById('admin-modal');
  var adminList = document.getElementById('admin-list');
  var adminClose = document.getElementById('admin-close');

  adminClose.addEventListener('click', function(){ adminModal.classList.remove('open'); });

  adminLink.addEventListener('click', function(){
    var pass = window.prompt('Couple\'s passphrase:');
    if (pass !== ADMIN_PASSPHRASE){
      if (pass !== null) alert('Incorrect passphrase.');
      return;
    }
    adminModal.classList.add('open');
    adminList.innerHTML = '<p class="admin-empty">Loading...</p>';

    if (!(window.storage && window.storage.list)){
      adminList.innerHTML = '<p class="admin-empty">Storage isn\'t available in this view.</p>';
      return;
    }

    window.storage.list('rsvp:', true).then(function(res){
      var keys = (res && res.keys) ? res.keys : [];
      if (!keys.length){
        adminList.innerHTML = '<p class="admin-empty">No RSVPs yet.</p>';
        return;
      }
      Promise.all(keys.map(function(k){
        return window.storage.get(k, true).catch(function(){ return null; });
      })).then(function(results){
        var entries = results
          .filter(Boolean)
          .map(function(r){ try { return JSON.parse(r.value); } catch(e){ return null; } })
          .filter(Boolean)
          .sort(function(a,b){ return new Date(b.timestamp) - new Date(a.timestamp); });

        if (!entries.length){
          adminList.innerHTML = '<p class="admin-empty">No RSVPs yet.</p>';
          return;
        }

        adminList.innerHTML = entries.map(function(e){
          var esc = U.escapeHtml || function(s){ return s; };
          return '<div class="admin-row"><b>' + esc(e.name) + ' — ' + esc(e.attending) + '</b>' +
            '<span>Guests: ' + esc(String(e.guests)) + '</span>' +
            (e.message ? '<div class="admin-note">' + esc(e.message) + '</div>' : '') +
            '</div>';
        }).join('');
      });
    }).catch(function(err){
      adminList.innerHTML = '<p class="admin-empty">Couldn\'t load responses.</p>';
      console.error(err);
    });
  });

})();
/* =============================================================================
   ENVELOPE OPENING EXPERIENCE (inlined component)
   Injects the envelope overlay, runs the opening sequence, then reveals the
   page. Dependency-free.

   - Reads window.ENVELOPE_CONFIG { groomName, brideName, displayDate,
     initials, hideSeal, theme, sounds: { seal, flap, unfold } }.
   - Exposes window.WS.initEnvelope(onDone) for templates that orchestrate the
     hand-off themselves. Returns true if the envelope takes over, false if
     skipped (reduced motion / already seen this session) so the caller can
     reveal directly.
   - Auto-runs only on pages that define ENVELOPE_CONFIG: immediately on
     DOMContentLoaded when there is no #preloader, otherwise once the
     preloader hides.
   - On completion: unhides #invitation (if present), dispatches
     "envelope:opened" on document, and invokes any registered callbacks.
   ============================================================================= */
(function () {
  "use strict";

  var SEEN_KEY = "envlp-seen";
  var initialized = false;
  var finished = false;
  var callbacks = [];
  var overlay = null;

  /* ---------------------------------------------------------------- helpers */

  function getConfig() {
    var c = window.ENVELOPE_CONFIG || {};
    return {
      groom: c.groomName || "",
      bride: c.brideName || "",
      date: c.displayDate || "",
      initials: c.initials || "",
      hideSeal: !!c.hideSeal,
      theme: /^[a-z][a-z-]*$/.test(c.theme || "") ? c.theme : "",
      sounds: c.sounds || c.envelopeSounds || {}
    };
  }

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function seenThisSession() {
    try { return sessionStorage.getItem(SEEN_KEY) === "1"; } catch (e) { return false; }
  }

  function markSeen() {
    try { sessionStorage.setItem(SEEN_KEY, "1"); } catch (e) { /* private mode */ }
  }

  function playSound(src) {
    if (!src) { return; }
    try {
      var a = new Audio(src);
      a.volume = 0.55;
      var p = a.play();
      if (p && p.catch) { p.catch(function () {}); }
    } catch (e) { /* autoplay blocked or bad src — silent */ }
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text) { node.textContent = text; }
    return node;
  }

  /* ------------------------------------------------------------- completion */

  function revealSite() {
    if (finished) { return; }
    finished = true;
    markSeen();

    var main = document.getElementById("invitation");
    if (main) { main.classList.remove("hidden"); }

    var evt;
    try {
      evt = new CustomEvent("envelope:opened");
    } catch (e) {
      evt = document.createEvent("Event");
      evt.initEvent("envelope:opened", true, true);
    }
    document.dispatchEvent(evt);

    for (var i = 0; i < callbacks.length; i++) {
      try { callbacks[i](); } catch (err) { console.error("[envelope] onDone callback failed:", err); }
    }
    callbacks = [];
  }

  /* ------------------------------------------------------------------ build */

  function buildOverlay(cfg) {
    var root = el("div", "envlp-overlay");
    if (cfg.theme) { root.classList.add("envlp-theme-" + cfg.theme); }
    root.appendChild(el("div", "envlp-vignette"));

    var stage = el("div", "envlp-stage");
    var scene = el("div", "envlp-scene");

    var env = el("div", "envlp");
    env.setAttribute("role", "button");
    env.setAttribute("tabindex", "0");
    env.setAttribute("aria-label", "Open the wedding invitation");

    env.appendChild(el("div", "envlp-back"));

    /* Letter card */
    var letter = el("div", "envlp-letter");
    var inner = el("div", "envlp-letter-inner");
    inner.appendChild(el("p", "envlp-kicker", "Together with their families"));

    var names = el("h1", "envlp-names");
    names.appendChild(el("span", null, cfg.groom));
    names.appendChild(el("span", "envlp-amp", "&"));
    names.appendChild(el("span", null, cfg.bride));
    inner.appendChild(names);

    var rule = el("div", "envlp-rule");
    rule.appendChild(el("span"));
    rule.appendChild(el("i"));
    rule.appendChild(el("span"));
    inner.appendChild(rule);

    if (cfg.date) { inner.appendChild(el("p", "envlp-date", cfg.date)); }
    inner.appendChild(el("p", "envlp-line", "request the honour of your presence"));
    letter.appendChild(inner);
    env.appendChild(letter);

    /* Pocket folds */
    var pocket = el("div", "envlp-pocket");
    pocket.appendChild(el("div", "envlp-fold envlp-fold-left"));
    pocket.appendChild(el("div", "envlp-fold envlp-fold-right"));
    pocket.appendChild(el("div", "envlp-fold envlp-fold-bottom"));
    env.appendChild(pocket);

    env.appendChild(el("div", "envlp-flap"));

    if (cfg.hideSeal) {
      if (cfg.initials) { env.appendChild(el("div", "envlp-monogram", cfg.initials)); }
    } else {
      env.appendChild(el("div", "envlp-seal", cfg.initials));
    }

    scene.appendChild(env);
    stage.appendChild(scene);
    stage.appendChild(el("p", "envlp-hint", "Tap to open your invitation"));
    root.appendChild(stage);

    return { root: root, env: env };
  }

  /* --------------------------------------------------------------- sequence */

  function open(cfg) {
    if (overlay.classList.contains("is-opening")) { return; }
    overlay.classList.add("is-opening");

    var env = overlay.querySelector(".envlp");
    var hasSeal = !cfg.hideSeal && !!cfg.initials;
    var t = 0;

    if (hasSeal) {
      env.classList.add("stage-seal");
      playSound(cfg.sounds.seal);
      t += 450;
    } else {
      env.classList.add("stage-seal"); /* fades the monogram */
    }

    setTimeout(function () {
      env.classList.add("stage-flap");
      playSound(cfg.sounds.flap);
    }, t);

    setTimeout(function () {
      env.classList.add("stage-letter");
      playSound(cfg.sounds.unfold);
    }, t + 950);

    setTimeout(function () {
      env.classList.add("stage-card");
    }, t + 1950);

    /* Hold the card, then fade the overlay and reveal the site */
    setTimeout(function () {
      overlay.classList.add("is-leaving");
      revealSite();
    }, t + 3600);

    setTimeout(function () {
      if (overlay && overlay.parentNode) { overlay.parentNode.removeChild(overlay); }
      overlay = null;
    }, t + 4600);
  }

  function start() {
    if (initialized) { return true; }
    initialized = true;

    var cfg = getConfig();
    var built = buildOverlay(cfg);
    overlay = built.root;
    document.body.appendChild(overlay);

    var trigger = function () { open(cfg); };
    built.env.addEventListener("click", trigger);
    built.env.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.keyCode === 13 || e.keyCode === 32) {
        e.preventDefault();
        trigger();
      }
    });
    try { built.env.focus({ preventScroll: true }); } catch (e) { /* older browsers */ }
    return true;
  }

  /* ------------------------------------------------------------- public API */

  window.WS = window.WS || {};
  window.WS.initEnvelope = function (onDone) {
    /* Decline before registering the callback: when we return false the
       caller reveals the page itself, and holding its callback too would
       fire the reveal twice once autoStart() settles. */
    if (!initialized && (prefersReducedMotion() || seenThisSession())) { return false; }
    if (typeof onDone === "function") {
      if (finished) { onDone(); } else { callbacks.push(onDone); }
    }
    if (initialized) { return true; }
    return start();
  };

  /* -------------------------------------------------------------- auto-init */

  function autoStart() {
    if (initialized || finished) { return; }
    if (prefersReducedMotion() || seenThisSession()) {
      revealSite();
      return;
    }
    start();
  }

  function watchPreloader(pre) {
    var done = false;
    var kick = function () {
      if (done) { return; }
      done = true;
      /* Small beat so the preloader's fade-out and the envelope don't fight */
      setTimeout(autoStart, 150);
    };

    var isHidden = function () {
      return pre.classList.contains("hide") ||
             pre.classList.contains("is-hidden") ||
             pre.getAttribute("aria-hidden") === "true" ||
             getComputedStyle(pre).display === "none" ||
             getComputedStyle(pre).opacity === "0";
    };

    if (isHidden()) { kick(); return; }

    if (window.MutationObserver) {
      var mo = new MutationObserver(function () {
        if (isHidden()) { mo.disconnect(); kick(); }
      });
      mo.observe(pre, { attributes: true, attributeFilter: ["class", "style", "aria-hidden"] });
    }
    /* Safety net: never leave the page stuck behind a wedged preloader */
    setTimeout(kick, 8000);
  }

  function boot() {
    /* Only auto-run on pages that configure the envelope — secondary pages
       (guest messages) share this bundle but must never show it. */
    if (!window.ENVELOPE_CONFIG) { return; }
    var pre = document.getElementById("preloader");
    if (pre) {
      watchPreloader(pre);
    } else {
      autoStart();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
