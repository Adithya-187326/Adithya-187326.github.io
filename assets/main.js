// Language toggle
(function () {
  var root = document.documentElement;
  var buttons = document.querySelectorAll('[data-set-lang]');

  function apply(lang) {
    root.lang = lang;
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.setLang === lang));
    });
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var lang = b.dataset.setLang;
      apply(lang);
      try { localStorage.setItem('lang', lang); } catch (e) {}
    });
  });

  apply(root.lang === 'de' ? 'de' : 'en');
})();

// YouTube slots. data-yt takes a video ID or any YouTube link (Shorts included).
//  - On an element with class "yt": the player is drawn inside it.
//  - On a project card or open-source <li>: a player is inserted below the header.
// Shows a thumbnail first; the player only loads (from youtube-nocookie) on tap.
(function () {
  function parse(v) {
    var m = v.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/)([\w-]{11})/) || v.match(/^([\w-]{11})$/);
    return m ? { id: m[1], vertical: /\/shorts\//.test(v) } : null;
  }

  document.querySelectorAll('[data-yt]').forEach(function (el) {
    var info = parse((el.dataset.yt || '').trim());
    if (!info) return;
    var vertical = info.vertical || el.hasAttribute('data-yt-vertical');
    var host = el.closest('.card, li') || el;
    var title = host.querySelector('h3');
    var label = 'Play video: ' + (title ? title.textContent.trim() : '');
    var cls = 'media' + (vertical ? ' is-vertical' : '');

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = cls;
    btn.setAttribute('aria-label', label);
    btn.style.backgroundImage = 'url(https://i.ytimg.com/vi/' + info.id + '/hqdefault.jpg)';
    btn.innerHTML = '<span class="play" aria-hidden="true"></span>';

    btn.addEventListener('click', function () {
      var frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + info.id + '?autoplay=1&rel=0&playsinline=1';
      frame.title = label;
      frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      frame.allowFullscreen = true;
      var wrap = document.createElement('div');
      wrap.className = cls;
      wrap.appendChild(frame);
      btn.replaceWith(wrap);
    }, { once: true });

    if (el.classList.contains('yt')) { el.appendChild(btn); return; }
    var head = el.querySelector('.card-head');
    var links = el.querySelector('.links');
    if (head) head.after(btn);
    else if (links) links.before(btn);
    else el.append(btn);
  });
})();

// Short silent clips (<video class="clip">): loop while on screen, pause otherwise.
// With reduced motion requested, they get normal controls instead.
(function () {
  var clips = document.querySelectorAll('video.clip');
  if (!clips.length) return;
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (calm || !('IntersectionObserver' in window)) {
    clips.forEach(function (v) { v.controls = true; });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { var p = e.target.play(); if (p && p.catch) p.catch(function () {}); }
      else e.target.pause();
    });
  }, { threshold: 0.5 });
  clips.forEach(function (v) { io.observe(v); });
})();

// Back-to-top button: appears once the hero is scrolled past
(function () {
  var btn = document.querySelector('.to-top');
  if (!btn) return;
  function update() { btn.classList.toggle('is-visible', window.scrollY > 400); }
  window.addEventListener('scroll', update, { passive: true });
  update();
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.replaceState(null, '', location.pathname + location.search);
  });
})();
