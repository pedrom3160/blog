/* ==========================================================================
   GPTCLONE Blog — client interactions (vanilla JavaScript, no dependencies)
   Theme, navigation, search, filters, table of contents, reading progress,
   copy-code / copy-link, and the audio player.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;

  /* ------------------------------------------------------------------------
     Theme
     ------------------------------------------------------------------------ */
  var THEME_KEY = 'gptclone-theme';

  function getTheme() {
    return doc.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
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

  function setNav(open) {
    if (!navToggle || !mainNav) return;
    mainNav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var open = !mainNav.classList.contains('is-open');
      setNav(open);
      if (open) {
        var firstLink = mainNav.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    });

    mainNav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setNav(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 980) setNav(false);
    });

    doc.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && mainNav.classList.contains('is-open')) {
        setNav(false);
        navToggle.focus();
      }
    });
  }

  /* ------------------------------------------------------------------------
     Clipboard helper
     ------------------------------------------------------------------------ */
  function copyText(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var area = doc.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.top = '-1000px';
        doc.body.appendChild(area);
        area.select();
        var ok = doc.execCommand && doc.execCommand('copy');
        doc.body.removeChild(area);
        if (ok) resolve();
        else reject(new Error('copy failed'));
      } catch (error) {
        reject(error);
      }
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
    return String(value == null ? '' : value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
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
        var haystack = [item.title, item.description, item.category, (item.tags || []).join(' ')]
          .map(normalise)
          .join(' ');
        return haystack.indexOf(q) !== -1;
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
        return (
          '<a class="search-result" href="' +
          escapeHtml(item.url) +
          '">' +
          '<span class="search-result-title">' +
          highlight(item.title, query) +
          '<span class="search-result-type">' +
          escapeHtml(item.type || 'article') +
          '</span></span>' +
          '<span class="search-result-desc">' +
          highlight(item.description || '', query) +
          '</span></a>'
        );
      })
      .join('');
  }

  var modal = doc.getElementById('search-modal');
  var modalInput = doc.getElementById('search-input');
  var modalResults = doc.getElementById('search-results');
  var modalEmpty = doc.getElementById('search-empty');
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
    loadIndex();
  }

  function closeSearch() {
    if (!modal) return;
    modal.hidden = true;
    doc.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  Array.prototype.forEach.call(doc.querySelectorAll('[data-search-open]'), function (button) {
    button.addEventListener('click', openSearch);
  });

  if (modal) {
    Array.prototype.forEach.call(modal.querySelectorAll('[data-search-close]'), function (el) {
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

    modal.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab') return;
      var focusable = modal.querySelectorAll(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && doc.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && doc.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
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
  Array.prototype.forEach.call(doc.querySelectorAll('[data-collection-filter]'), function (bar) {
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
      var cat = normalise(category ? category.value : '').trim();
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalise(card.getAttribute('data-search'));
        var cardCategory = normalise(card.getAttribute('data-category'));
        var matches = (!q || haystack.indexOf(q) !== -1) && (!cat || cardCategory === cat);
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
     Table of contents, heading anchors and scrollspy
     ------------------------------------------------------------------------ */
  var articleContent = doc.querySelector('[data-article-content]');
  var tocNav = doc.getElementById('toc-nav');
  var tocNavMobile = doc.getElementById('toc-nav-mobile');

  function slugify(text) {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  if (articleContent && (tocNav || tocNavMobile)) {
    var headings = Array.prototype.slice.call(articleContent.querySelectorAll('h2, h3'));
    var used = {};
    var links = [];
    var mobileLinks = [];

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

      [tocNav, tocNavMobile].forEach(function (nav) {
        if (!nav) return;
        var link = doc.createElement('a');
        link.href = '#' + id;
        link.textContent = heading.textContent;
        link.className = 'toc-level-' + heading.tagName.charAt(1);
        link.setAttribute('data-target', id);
        nav.appendChild(link);
        if (nav === tocNav) links.push(link);
        else mobileLinks.push(link);
      });
    });

    if (!links.length && tocNavMobile) {
      var details = tocNavMobile.closest('details');
      if (details) details.hidden = true;
    }

    headings.forEach(function (heading) {
      if (!heading.id) return;
      var anchor = doc.createElement('a');
      anchor.className = 'heading-anchor';
      anchor.href = '#' + heading.id;
      anchor.textContent = '#';
      anchor.setAttribute('aria-label', 'Ligação direta para esta secção');
      heading.appendChild(anchor);
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
          links.concat(mobileLinks).forEach(function (link) {
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
     Copy code blocks
     ------------------------------------------------------------------------ */
  if (articleContent) {
    Array.prototype.forEach.call(articleContent.querySelectorAll('pre'), function (pre) {
      var code = pre.querySelector('code');
      if (!code) return;
      var button = doc.createElement('button');
      button.type = 'button';
      button.className = 'code-copy';
      button.textContent = 'Copiar';
      button.setAttribute('aria-label', 'Copiar bloco de código');
      pre.appendChild(button);

      button.addEventListener('click', function () {
        copyText(code.textContent)
          .then(function () {
            button.textContent = 'Copiado';
            window.setTimeout(function () {
              button.textContent = 'Copiar';
            }, 2000);
          })
          .catch(function () {
            button.textContent = 'Falhou';
          });
      });
    });
  }

  /* ------------------------------------------------------------------------
     Copy article/share link
     ------------------------------------------------------------------------ */
  Array.prototype.forEach.call(doc.querySelectorAll('[data-copy-link]'), function (button) {
    button.addEventListener('click', function () {
      var url = button.getAttribute('data-copy-link');
      var status = doc.querySelector('[data-copy-status]');
      copyText(url)
        .then(function () {
          if (status) status.textContent = 'Ligação copiada';
        })
        .catch(function () {
          if (status) status.textContent = 'Não foi possível copiar';
        });
      if (status) {
        window.setTimeout(function () {
          status.textContent = '';
        }, 3000);
      }
    });
  });

  /* ------------------------------------------------------------------------
     Reading progress
     ------------------------------------------------------------------------ */
  var progressBar = doc.querySelector('[data-reading-progress]');
  if (progressBar && articleContent) {
    var ticking = false;

    var updateProgress = function () {
      var docHeight = doc.documentElement.scrollHeight - window.innerHeight;
      var ratio = docHeight > 0 ? window.scrollY / docHeight : 0;
      progressBar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, ratio)) + ')';
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(updateProgress);
        }
      },
      { passive: true }
    );

    updateProgress();
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

  Array.prototype.forEach.call(doc.querySelectorAll('[data-audio-player]'), function (player) {
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
