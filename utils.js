(function(){

  /* =====================================================
     SHARED UTILITIES
     Small helpers reused by script.js and messages.js so
     logic isn't duplicated across pages. Plain ES5 style
     to match the rest of the codebase — no build step.
     ===================================================== */

  function escapeHtml(str){
    var d = document.createElement('div');
    d.textContent = (str === null || str === undefined) ? '' : String(str);
    return d.innerHTML;
  }

  function formatDate(input){
    var d = (input instanceof Date) ? input : new Date(input);
    if (isNaN(d.getTime())) return '';
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  function timeAgo(input){
    var d = (input instanceof Date) ? input : new Date(input);
    if (isNaN(d.getTime())) return '';
    var diff = Math.max(0, Date.now() - d.getTime());
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + (mins === 1 ? ' minute ago' : ' minutes ago');
    var hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + (hrs === 1 ? ' hour ago' : ' hours ago');
    var days = Math.floor(hrs / 24);
    if (days < 7) return days + (days === 1 ? ' day ago' : ' days ago');
    return formatDate(d);
  }

  function getInitials(name){
    if (!name) return '?';
    var parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  // Deterministic palette color from a name — the same guest
  // always gets the same avatar tint without storing one.
  var AVATAR_PALETTE = ['#8A2540', '#641B31', '#A23F55', '#3D0F1C', '#B0596C', '#551C30'];
  function colorForName(name){
    var str = String(name || '');
    var hash = 0;
    for (var i = 0; i < str.length; i++){ hash = (hash * 31 + str.charCodeAt(i)) >>> 0; }
    return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
  }

  function debounce(fn, wait){
    var t;
    return function(){
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function(){ fn.apply(ctx, args); }, wait);
    };
  }

  function prefersReducedMotion(){
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // Shared preloader: waits for a minimum dwell time AND window load,
  // then fades #preloader and flags body.loaded (used by CSS entrance
  // animations on both pages).
  function initPreloader(minDelay){
    var pre = document.getElementById('preloader');
    if (!pre) return;
    var minTime = new Promise(function(res){ setTimeout(res, minDelay || 1700); });
    var loaded = new Promise(function(res){
      if (document.readyState === 'complete') res();
      else window.addEventListener('load', res);
    });
    Promise.all([minTime, loaded]).then(function(){
      pre.classList.add('hide');
      document.body.classList.add('loaded');
    });
  }

  // Shared scroll-reveal: fades in any element matching the selector
  // (default [data-reveal]) once it enters the viewport.
  function initScrollReveal(selector){
    var reveals = document.querySelectorAll(selector || '[data-reveal]');
    if (!reveals.length) return;
    if ('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if (e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target); }
        });
      }, { threshold: .15 });
      reveals.forEach(function(el){ io.observe(el); });
    } else {
      reveals.forEach(function(el){ el.classList.add('is-visible'); });
    }
  }

  window.WeddingUtils = {
    escapeHtml: escapeHtml,
    formatDate: formatDate,
    timeAgo: timeAgo,
    getInitials: getInitials,
    colorForName: colorForName,
    debounce: debounce,
    prefersReducedMotion: prefersReducedMotion,
    initPreloader: initPreloader,
    initScrollReveal: initScrollReveal
  };

})();
