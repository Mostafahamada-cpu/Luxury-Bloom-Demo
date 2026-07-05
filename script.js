(function(){

  /* =====================================================
     EDIT ME — quick personalization points
     ===================================================== */
  var SPOTIFY_TRACK_URL = "https://open.spotify.com/track/5k4lqXHUPP36MAaFkvBck9?si=1085254f42b6479c";           // paste a Spotify track/playlist share link here, e.g. "https://open.spotify.com/track/XXXXXXXX"
  var WEDDING_DATE = new Date(2026, 9, 7, 18, 0, 0); // Oct 7, 2026, 6:00 PM (change the "18" if the ceremony time differs)
  var ADMIN_PASSPHRASE = "omarrowan2026"; // couple-only passphrase to view RSVPs

  var U = window.WeddingUtils || {};

  /* ============ PRELOADER ============ */
  if (U.initPreloader) U.initPreloader(1700);

  /* ============ ENVELOPE INTRO ============ */
  var ENVELOPE_SESSION_KEY = 'omarRowanEnvelopeOpened';
  var reducedMotion = U.prefersReducedMotion ? U.prefersReducedMotion() : false;
  var envelopeOpened = false;
  var envelopeWrapper = document.getElementById('envelope-wrapper');
  var envelopeContainer = document.querySelector('.envelope');
  var openEnvelopeBtn = document.getElementById('open-btn');

  var alreadyOpenedThisSession = false;
  try { alreadyOpenedThisSession = sessionStorage.getItem(ENVELOPE_SESSION_KEY) === '1'; }
  catch (e) { alreadyOpenedThisSession = false; } // storage unavailable (e.g. private browsing) — just show it every time

  if (alreadyOpenedThisSession && envelopeWrapper){
    envelopeWrapper.classList.add('skip-envelope');
  }

  function markEnvelopeOpened(){
    try { sessionStorage.setItem(ENVELOPE_SESSION_KEY, '1'); } catch (e) { /* ignore */ }
  }

  function openEnvelope(){
    if (envelopeOpened || alreadyOpenedThisSession) return;
    envelopeOpened = true;
    markEnvelopeOpened();
    if (envelopeContainer) envelopeContainer.classList.add('open');
    if (openEnvelopeBtn){
      openEnvelopeBtn.style.opacity = '0';
      openEnvelopeBtn.style.transform = 'translateY(10px)';
      openEnvelopeBtn.style.pointerEvents = 'none';
    }
    var revealDelay = reducedMotion ? 150 : 1900;
    var fadeDuration = reducedMotion ? 120 : 680;
    setTimeout(function(){
      if (envelopeWrapper) envelopeWrapper.classList.add('fade-out');
      setTimeout(function(){
        if (envelopeWrapper) envelopeWrapper.style.display = 'none';
      }, fadeDuration);
    }, revealDelay);
  }
  if (openEnvelopeBtn) openEnvelopeBtn.addEventListener('click', openEnvelope);
  if (envelopeContainer) envelopeContainer.addEventListener('click', openEnvelope);

  // Floating dust motes + gold sparkles — skipped for returning-this-session
  // visitors and for anyone who prefers reduced motion.
  (function spawnEnvelopeParticles(){
    if (!envelopeWrapper || alreadyOpenedThisSession || reducedMotion) return;
    var host = envelopeWrapper.querySelector('.envelope-particles');
    if (!host) return;
    var MOTES = 10, SPARKS = 7, i, j, m, s, size;
    for (i = 0; i < MOTES; i++){
      m = document.createElement('span');
      m.className = 'dust-mote';
      size = 2 + Math.random() * 3;
      m.style.width = size + 'px';
      m.style.height = size + 'px';
      m.style.left = (Math.random() * 100) + '%';
      m.style.top = (40 + Math.random() * 50) + '%';
      m.style.animationDuration = (6 + Math.random() * 6) + 's';
      m.style.animationDelay = (Math.random() * 6) + 's';
      host.appendChild(m);
    }
    for (j = 0; j < SPARKS; j++){
      s = document.createElement('span');
      s.className = 'spark';
      s.style.left = (Math.random() * 100) + '%';
      s.style.top = (Math.random() * 100) + '%';
      s.style.animationDuration = (2 + Math.random() * 2.2) + 's';
      s.style.animationDelay = (Math.random() * 3) + 's';
      host.appendChild(s);
    }
  })();

  // Wax seal monogram, generated from the names already in the hero heading
  // rather than hardcoded, so this stays correct if the couple's names change.
  (function setSealInitials(){
    var seal = document.querySelector('.wax-seal');
    var heading = document.querySelector('.hero-names');
    if (!seal || !heading) return;
    var names = heading.textContent.split('&').map(function(s){ return s.trim(); }).filter(Boolean);
    if (names.length < 2) return;
    seal.textContent = names[0].charAt(0).toUpperCase() + ' & ' + names[1].charAt(0).toUpperCase();
  })();

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
      return '<figure class="gal-card" data-index="' + i + '">' +
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

    var data = {
      name: name,
      attending: form.querySelector('input[name="attending"]:checked').value,
      guests: document.getElementById('r-guests').value,
      meal: document.getElementById('r-meal').value,
      song: document.getElementById('r-song').value.trim(),
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
            '<span>Guests: ' + esc(String(e.guests)) + ' &middot; Meal: ' + esc(e.meal) +
            (e.song ? ' &middot; Song: ' + esc(e.song) : '') + '</span>' +
            (e.message ? '<div style="margin-top:6px; font-style:italic;">' + esc(e.message) + '</div>' : '') +
            '</div>';
        }).join('');
      });
    }).catch(function(err){
      adminList.innerHTML = '<p class="admin-empty">Couldn\'t load responses.</p>';
      console.error(err);
    });
  });

})();