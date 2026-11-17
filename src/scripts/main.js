/* ==========================================================================
   GPTCLONE Blog — client interactions (vanilla JavaScript)
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;

  /* ------------------------------------------------------------------------
     Theme
     ------------------------------------------------------------------------ */
  var THEME_KEY = 'gptclone-theme';

  function getTheme() {
    return doc.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function setTheme(theme) {
    doc.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      /* storage unavailable */
    }
  }

  var themeToggle = doc.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      setTheme(getTheme() === 'light' ? 'dark' : 'light');
    });
  }

  /* ------------------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------------------ */
  var navToggle = doc.getElementById('nav-toggle');
  var mainNav = doc.getElementById('main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      navToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    });
  }

  /* ------------------------------------------------------------------------
     Search
     ------------------------------------------------------------------------ */
  var indexMeta = doc.querySelector('meta[name="search-index"]');
  var INDEX_URL = indexMeta ? indexMeta.getAttribute('content') : '/blog/search-index.json';
  var searchCache = null;

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalise(value) {
    return String(value == null ? '' : value).toLowerCase();
  }

  function loadIndex() {
    if (searchCache) return Promise.resolve(searchCache);
    return fetch(INDEX_URL)
      .then(function (response) {
        if (!response.ok) throw new Error('search index unavailable');
        return response.json();
      })
      .then(function (payload) {
        searchCache = Array.isArray(payload) ? payload : payload.items || [];
        return searchCache;
      })
      .catch(function () {
        searchCache = [];
        return searchCache;
      });
  }

  function searchItems(items, query) {
    var q = normalise(query).trim();
    if (!q) return [];
    return items
      .filter(function (item) {
        var haystack = [
          item.title,
          item.description,
          item.category,
          (item.tags || []).join(' '),
        ]
          .map(normalise)
          .join(' ');
        return haystack.includes(q);
      })
      .slice(0, 30);
  }

  function highlight(text, query) {
    var safe = escapeHtml(text);
    var q = query.trim();
    if (!q) return safe;
    var escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      return safe.replace(new RegExp('(' + escaped + ')', 'gi'), '<mark>$1</mark>');
    } catch (error) {
      return safe;
    }
  }

  function renderResults(container, results, query) {
    if (!container) return;
    if (!results.length) {
      container.innerHTML = '';
      return;
    }
    container.innerHTML = results
      .map(function (item) {
        var type = escapeHtml(item.type || 'article');
        return (
          '<a class="search-result" href="' +
          escapeHtml(item.url) +
          '">' +
          '<span class="search-result-title">' +
          highlight(item.title, query) +
          '<span class="search-result-type">' +
          type +
          '</span></span>' +
          '<span class="search-result-desc">' +
          highlight(item.description || '', query) +
          '</span>' +
          '</a>'
        );
      })
      .join('');
  }

  // Modal search
  var modal = doc.getElementById('search-modal');
  var modalInput = doc.getElementById('search-input');
  var modalResults = doc.getElementById('search-results');
  var modalEmpty = doc.getElementById('search-empty');
  var openButton = doc.getElementById('search-open');
  var lastFocused = null;

  function openSearch() {
    if (!modal) return;
    lastFocused = doc.activeElement;
    modal.hidden = false;
    doc.body.style.overflow = 'hidden';
    if (modalInput) {
      modalInput.value = '';
      modalInput.focus();
    }
    if (modalResults) modalResults.innerHTML = '';
    if (modalEmpty) modalEmpty.hidden = true;
  }

  function closeSearch() {
    if (!modal) return;
    modal.hidden = true;
    doc.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  if (openButton) openButton.addEventListener('click', openSearch);

  if (modal) {
    modal.querySelectorAll('[data-search-close]').forEach(function (el) {
      el.addEventListener('click', closeSearch);
    });

    if (modalInput) {
      modalInput.addEventListener('input', function () {
        var query = modalInput.value;
        loadIndex().then(function (items) {
          var results = searchItems(items, query);
          renderResults(modalResults, results, query);
          if (modalEmpty) modalEmpty.hidden = results.length > 0;
        });
      });
    }
  }

  // Dedicated search page
  var pageForm = doc.querySelector('[data-page-search]');
  var pageInput = doc.querySelector('[data-page-search-input]');
  var pageResults = doc.getElementById('page-search-results');
  var pageEmpty = doc.getElementById('page-search-empty');

  if (pageForm && pageInput) {
    pageForm.addEventListener('submit', function (event) {
      event.preventDefault();
    });
    var runPageSearch = function () {
      var query = pageInput.value;
      loadIndex().then(function (items) {
        var results = searchItems(items, query);
        renderResults(pageResults, results, query);
        if (pageEmpty) pageEmpty.hidden = results.length > 0;
      });
    };
    pageInput.addEventListener('input', runPageSearch);
    // Pre-fill from ?q= URL parameter
    try {
      var initialQuery = new URLSearchParams(window.location.search).get('q');
      if (initialQuery) {
        pageInput.value = initialQuery;
        runPageSearch();
        pageInput.focus();
      }
    } catch (error) {
      /* URL parsing unavailable */
    }
  }

  // Global keyboard shortcuts
  doc.addEventListener('keydown', function (event) {
    var target = event.target;
    var typing =
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable);

    if (event.key === '/' && !typing) {
      event.preventDefault();
      openSearch();
    }
    if (event.key === 'Escape' && modal && !modal.hidden) {
      closeSearch();
    }
  });

  /* ------------------------------------------------------------------------
     Collection filtering (article listings and libraries)
     ------------------------------------------------------------------------ */
  doc.querySelectorAll('[data-collection-filter]').forEach(function (bar) {
    var scope = bar.parentElement;
    if (!scope) return;
    var grid = scope.querySelector('[data-filter-grid]');
    var empty = scope.querySelector('[data-filter-empty]');
    var search = bar.querySelector('[data-filter-search]');
    var category = bar.querySelector('[data-filter-category]');
    if (!grid) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.card'));

    function apply() {
      var q = normalise(search && search.value).trim();
      var cat = category ? normalise(category.value).trim() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalise(card.getAttribute('data-search'));
        var cardCategory = normalise(card.getAttribute('data-category'));
        var matches = (!q || haystack.includes(q)) && (!cat || cardCategory === cat);
        card.hidden = !matches;
        if (matches) visible += 1;
      });

      if (empty) empty.hidden = visible !== 0;
    }

    if (search) search.addEventListener('input', apply);
    if (category) category.addEventListener('change', apply);
    apply();
  });

  /* ------------------------------------------------------------------------
     Table of contents + scrollspy
     ------------------------------------------------------------------------ */
  var articleContent = doc.querySelector('[data-article-content]');
  var tocNav = doc.getElementById('toc-nav');

  function slugify(text) {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  if (articleContent && tocNav) {
    var headings = Array.prototype.slice.call(articleContent.querySelectorAll('h2, h3'));
    var used = {};
    var links = [];

    headings.forEach(function (heading) {
      var base = slugify(heading.textContent) || 'secao';
      var id = base;
      var counter = 2;
      while (used[id]) {
        id = base + '-' + counter;
        counter += 1;
      }
      used[id] = true;
      heading.id = id;

      var link = doc.createElement('a');
      link.href = '#' + id;
      link.textContent = heading.textContent;
      link.className = 'toc-level-' + heading.tagName.charAt(1);
      link.setAttribute('data-target', id);
      tocNav.appendChild(link);
      links.push(link);
    });

    if (links.length && 'IntersectionObserver' in window) {
      var visible = new Set();
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) visible.add(entry.target.id);
            else visible.delete(entry.target.id);
          });
          var activeId = null;
          for (var i = 0; i < headings.length; i += 1) {
            if (visible.has(headings[i].id)) {
              activeId = headings[i].id;
              break;
            }
          }
          links.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('data-target') === activeId);
          });
        },
        { rootMargin: '-96px 0px -68% 0px', threshold: 0 }
      );
      headings.forEach(function (heading) {
        observer.observe(heading);
      });
    }
  }

  /* ------------------------------------------------------------------------
     Audio players
     ------------------------------------------------------------------------ */
  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return mins + ':' + String(secs).padStart(2, '0');
  }

  doc.querySelectorAll('[data-audio-player]').forEach(function (player) {
    var audio = player.querySelector('[data-audio]');
    var playButton = player.querySelector('[data-play]');
    var progress = player.querySelector('[data-progress]');
    var volume = player.querySelector('[data-volume]');
    var currentEl = player.querySelector('[data-current]');
    var durationEl = player.querySelector('[data-duration]');
    if (!audio || !playButton) return;

    function setPlaying(playing) {
      player.setAttribute('data-playing', playing ? 'true' : 'false');
      playButton.setAttribute('aria-label', playing ? 'Pausar' : 'Reproduzir');
    }

    playButton.addEventListener('click', function () {
      if (audio.paused) {
        var promise = audio.play();
        if (promise && typeof promise.catch === 'function') promise.catch(function () {});
      } else {
        audio.pause();
      }
    });

    audio.addEventListener('play', function () {
      setPlaying(true);
    });
    audio.addEventListener('pause', function () {
      setPlaying(false);
    });
    audio.addEventListener('ended', function () {
      setPlaying(false);
      if (progress) progress.value = '0';
      if (currentEl) currentEl.textContent = '0:00';
    });
    audio.addEventListener('loadedmetadata', function () {
      if (durationEl) durationEl.textContent = formatTime(audio.duration);
    });
    audio.addEventListener('timeupdate', function () {
      if (currentEl) currentEl.textContent = formatTime(audio.currentTime);
      if (progress && audio.duration) {
        progress.value = String((audio.currentTime / audio.duration) * 100);
      }
    });

    if (progress) {
      progress.addEventListener('input', function () {
        if (audio.duration) {
          audio.currentTime = (parseFloat(progress.value) / 100) * audio.duration;
        }
      });
    }

    if (volume) {
      audio.volume = parseFloat(volume.value);
      volume.addEventListener('input', function () {
        audio.volume = parseFloat(volume.value);
      });
    }
  });
})();
