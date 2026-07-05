(function(){

  /* =====================================================
     WEDDING GALLERY DATA — EDIT ME
     =====================================================
     Add, remove, or reorder photos here — the gallery,
     masonry layout, and lightbox all render from this file.

     To use your OWN photos: just set `src` (and optionally
     `full` for a larger lightbox version) to an image URL
     or an uploaded file path, e.g.:

       { src: "photos/ceremony-01.jpg", full: "photos/ceremony-01-large.jpg",
         alt: "Omar and Rowan exchanging vows", caption: "Walking the Aisle" }

     Until you do, `src`/`full` are left blank below and the
     gallery fills them in with soft generated artwork in the
     site's own palette, so nothing is ever hotlinked from an
     unverified source and there's zero broken-image risk.
     ===================================================== */

  function placeholderArt(seed, caption){
    var pairs = [
      ['#F1E7DA', '#E6B6AE'], ['#E6B6AE', '#D9C098'], ['#D9C098', '#F1D6D0'],
      ['#F1D6D0', '#C6867C'], ['#C6867C', '#B08D57'], ['#B08D57', '#F1E7DA']
    ];
    var pair = pairs[seed % pairs.length];
    var h = 640 + (seed % 4) * 110; // varied aspect ratio for a livelier masonry
    var label = (caption || 'Our Story').replace(/&/g, '&amp;').replace(/</g, '&lt;');
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="' + h + '">' +
        '<defs><linearGradient id="g' + seed + '" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="' + pair[0] + '"/>' +
          '<stop offset="1" stop-color="' + pair[1] + '"/>' +
        '</linearGradient></defs>' +
        '<rect width="100%" height="100%" fill="url(#g' + seed + ')"/>' +
        '<circle cx="50%" cy="42%" r="46" fill="none" stroke="#2A2321" stroke-opacity=".18" stroke-width="1.4"/>' +
        '<text x="50%" y="43%" font-family="Georgia, \'Times New Roman\', serif" font-style="italic" font-size="30" fill="#2A2321" fill-opacity=".55" text-anchor="middle" dominant-baseline="middle">O &amp; R</text>' +
        '<text x="50%" y="54%" font-family="Georgia, serif" font-size="15" letter-spacing="2" fill="#2A2321" fill-opacity=".4" text-anchor="middle" dominant-baseline="middle">' + label.toUpperCase() + '</text>' +
      '</svg>';
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  var captions = [
    ['The Proposal', 'A quiet moment neither of them expected'],
    ['Rings & Promises', 'Two rings, one forever'],
    ['The Bouquet', 'Blush and gold, just like the day'],
    ['Getting Ready', 'The calm before the celebration'],
    ['Walking the Aisle', 'Every step surrounded by love'],
    ['Sealed With a Ring', 'The moment it became official'],
    ['First Dance', 'Just the two of them, for a minute'],
    ['Stolen Glances', 'The look that started it all'],
    ['Golden Hour', 'La Beau Garden at its softest light'],
    ['Sharp & Ready', 'Omar, moments before it began'],
    ['The Little Details', 'Everything chosen with care'],
    ['Sweetness Ahead', 'Saved for the reception'],
    ['Raise a Glass', 'To Omar and Rowan'],
    ['Confetti & Cheers', 'The room erupts'],
    ['Evening Light', 'As the garden lit up for the night'],
    ['One Last Twirl', 'Closing out the night together']
  ];

  var gallery = captions.map(function(c, i){
    return {
      id: i + 1,
      src: '',
      full: '',
      alt: c[1],
      caption: c[0]
    };
  }).map(function(item, i){
    var art = placeholderArt(i, item.caption);
    return {
      id: item.id,
      src: item.src || art,
      full: item.full || art,
      alt: item.alt,
      caption: item.caption
    };
  });

  window.weddingData = {
    gallery: gallery
  };

})();
