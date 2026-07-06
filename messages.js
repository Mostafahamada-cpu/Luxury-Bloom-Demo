(function(){

  var U = window.WeddingUtils || {};
  if (U.initPreloader) U.initPreloader(900); // snappier on this secondary page
  if (U.initScrollReveal) U.initScrollReveal();

  var reduced = U.prefersReducedMotion ? U.prefersReducedMotion() : false;

  var data = window.MessagesData || { SHOW_SAMPLE_MESSAGES: false, SAMPLE_MESSAGES: [] };

  var searchInput = document.getElementById('msg-search');
  var sortSelect = document.getElementById('msg-sort');
  var grid = document.getElementById('messages-grid');
  var emptyState = document.getElementById('messages-empty');
  var noResultsState = document.getElementById('messages-no-results');
  var statTotalMessages = document.getElementById('stat-total-messages');
  var statTotalGuests = document.getElementById('stat-total-guests');
  var statLatest = document.getElementById('stat-latest-message');

  var allMessages = [];      // merged sample + real, each {id, name, message, date}
  var totalAcceptedGuests = 0;

  function normalizeRsvpEntry(e){
    if (!e || !e.message || !String(e.message).trim()) return null;
    return {
      id: 'rsvp-' + (e.timestamp || Math.random()),
      name: e.name || 'A Guest',
      message: String(e.message).trim(),
      date: e.timestamp || new Date().toISOString()
    };
  }

  function render(){
    var query = ((searchInput && searchInput.value) || '').trim().toLowerCase();
    var sortOrder = (sortSelect && sortSelect.value) || 'newest';

    var list = allMessages.filter(function(m){
      return !query || m.name.toLowerCase().indexOf(query) !== -1;
    });

    list.sort(function(a, b){
      var da = new Date(a.date).getTime(), db = new Date(b.date).getTime();
      return sortOrder === 'oldest' ? da - db : db - da;
    });

    if (!allMessages.length){
      grid.innerHTML = '';
      grid.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      if (noResultsState) noResultsState.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    if (!list.length){
      grid.innerHTML = '';
      grid.style.display = 'none';
      if (noResultsState) noResultsState.style.display = 'block';
      return;
    }

    if (noResultsState) noResultsState.style.display = 'none';
    grid.style.display = 'grid';

    grid.innerHTML = list.map(function(m, i){
      var initials = U.getInitials ? U.getInitials(m.name) : m.name.charAt(0);
      var color = U.colorForName ? U.colorForName(m.name) : '#641B31';
      var dateLabel = U.formatDate ? U.formatDate(m.date) : '';
      var delay = reduced ? '0ms' : Math.min(i * 55, 440) + 'ms';
      return '<div class="msg-card" style="animation-delay:' + delay + '">' +
          '<div class="msg-top">' +
            '<span class="msg-avatar" style="background:' + color + '">' + U.escapeHtml(initials) + '</span>' +
            '<div class="msg-meta"><span class="msg-name">' + U.escapeHtml(m.name) + '</span><span class="msg-date">' + U.escapeHtml(dateLabel) + '</span></div>' +
            '<svg class="msg-heart" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.7-10.2-9.3C.3 8.8 1.6 5 5.3 4.1c2-.5 4 .3 5.2 2 1.2-1.7 3.2-2.5 5.2-2 3.7.9 5 4.7 3.5 7.6C19.5 16.3 12 21 12 21z"/></svg>' +
          '</div>' +
          '<p class="msg-text">' + U.escapeHtml(m.message) + '</p>' +
        '</div>';
    }).join('');
  }

  function computeStats(){
    if (statTotalMessages) statTotalMessages.textContent = String(allMessages.length);
    if (statTotalGuests) statTotalGuests.textContent = String(totalAcceptedGuests);
    if (statLatest){
      if (!allMessages.length){
        statLatest.textContent = '—';
      } else {
        var latest = allMessages.slice().sort(function(a, b){ return new Date(b.date) - new Date(a.date); })[0];
        statLatest.textContent = latest.name + ' · ' + (U.timeAgo ? U.timeAgo(latest.date) : '');
      }
    }
  }

  function init(){
    var base = data.SHOW_SAMPLE_MESSAGES ? (data.SAMPLE_MESSAGES || []).map(function(m){
      return { id: 'sample-' + m.id, name: m.name, message: m.message, date: m.date };
    }) : [];

    function finish(realEntries){
      allMessages = base.concat(realEntries);
      computeStats();
      render();
    }

    if (window.storage && window.storage.list){
      window.storage.list('rsvp:', true).then(function(res){
        var keys = (res && res.keys) || [];
        if (!keys.length){ finish([]); return; }
        Promise.all(keys.map(function(k){
          return window.storage.get(k, true).catch(function(){ return null; });
        })).then(function(results){
          var real = [];
          results.filter(Boolean).forEach(function(r){
            try {
              var parsed = JSON.parse(r.value);
              if (parsed.attending === 'Joyfully Accepts'){
                var g = parseInt(parsed.guests, 10);
                if (!isNaN(g)) totalAcceptedGuests += g;
              }
              var norm = normalizeRsvpEntry(parsed);
              if (norm) real.push(norm);
            } catch (e){ /* skip malformed entry */ }
          });
          finish(real);
        }).catch(function(){ finish([]); });
      }).catch(function(){ finish([]); });
    } else {
      finish([]);
    }
  }

  if (searchInput) searchInput.addEventListener('input', U.debounce ? U.debounce(render, 120) : render);
  if (sortSelect) sortSelect.addEventListener('change', render);

  init();

})();
