/* ==========================================================================
   ФКМ — общий скрипт сайта
   Без зависимостей. Всё опционально: блок работает, только если есть разметка.
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- Шапка */
  function initHeader() {
    var header = $('.header');
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ----------------------------------------------------------- Мега-меню */
  function initMegaMenu() {
    var items = $$('.nav__item--has-menu');
    if (!items.length) return;
    var closeTimer;

    function closeAll(except) {
      items.forEach(function (item) {
        if (item === except) return;
        item.classList.remove('is-open');
        var btn = $('.nav__link', item);
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }

    items.forEach(function (item) {
      var btn = $('.nav__link', item);
      if (!btn) return;

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var open = item.classList.contains('is-open');
        closeAll(item);
        item.classList.toggle('is-open', !open);
        btn.setAttribute('aria-expanded', String(!open));
      });

      item.addEventListener('mouseenter', function () {
        if (window.matchMedia('(hover: none)').matches) return;
        clearTimeout(closeTimer);
        closeAll(item);
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      });

      item.addEventListener('mouseleave', function () {
        if (window.matchMedia('(hover: none)').matches) return;
        closeTimer = setTimeout(function () {
          item.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
        }, 140);
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav__item--has-menu')) closeAll(null);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll(null);
    });
  }

  /* ----------------------------------------------------- Мобильное меню */
  function initMobileNav() {
    var burger = $('.burger');
    var panel  = $('.mobile-nav');
    if (!burger || !panel) return;

    function setOpen(open) {
      burger.classList.toggle('is-open', open);
      panel.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('is-locked', open);
    }

    burger.addEventListener('click', function () {
      setOpen(!panel.classList.contains('is-open'));
    });

    $$('.mobile-nav__toggle', panel).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var sub = btn.nextElementSibling;
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        if (sub) sub.classList.toggle('is-open', !open);
      });
    });

    $$('a', panel).forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) setOpen(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1120 && panel.classList.contains('is-open')) setOpen(false);
    });
  }

  /* ---------------------------------------------------------- Аккордеоны */
  function initAccordions() {
    $$('.acc').forEach(function (acc) {
      var single = acc.hasAttribute('data-single');
      $$('.acc__btn', acc).forEach(function (btn) {
        btn.addEventListener('click', function () {
          var panel = btn.nextElementSibling;
          var open  = btn.getAttribute('aria-expanded') === 'true';
          if (single && !open) {
            $$('.acc__btn', acc).forEach(function (other) {
              other.setAttribute('aria-expanded', 'false');
              if (other.nextElementSibling) other.nextElementSibling.classList.remove('is-open');
            });
          }
          btn.setAttribute('aria-expanded', String(!open));
          if (panel) panel.classList.toggle('is-open', !open);
        });
      });
    });
  }

  /* ------------------------------------------------------ Появление блоков */
  function initReveal() {
    var nodes = $$('[data-reveal]');
    if (!nodes.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* ------------------------------------------------------------ Наверх */
  function initToTop() {
    var btn = $('.to-top');
    if (!btn) return;
    var onScroll = function () {
      btn.classList.toggle('is-visible', window.scrollY > 700);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------- Активный пункт subnav */
  function initScrollSpy() {
    var nav = $('.subnav');
    if (!nav || !('IntersectionObserver' in window)) return;
    var links = $$('a[href^="#"]', nav);
    if (!links.length) return;

    var map = {};
    var targets = [];
    links.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      if (!el) return;
      map[id] = link;
      targets.push(el);
    });
    if (!targets.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove('is-active'); });
        var active = map[entry.target.id];
        if (active) {
          active.classList.add('is-active');
          if (active.scrollIntoView) {
            active.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
          }
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

    targets.forEach(function (t) { io.observe(t); });
  }

  /* -------------------------------------------------------------- Формы */
  function initForms() {
    $$('form[data-form]').forEach(function (form) {
      var status = $('.form__status', form);

      function say(state, text) {
        if (!status) return;
        status.setAttribute('data-state', state);
        status.textContent = text;
        status.classList.add('is-visible');
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        var data = new FormData(form);
        var endpoint = form.getAttribute('data-endpoint');

        // Пока бэкенд не подключён — открываем письмо в почтовом клиенте.
        if (!endpoint) {
          var to = form.getAttribute('data-mailto') || 'office@fkm-chemicals.ru';
          var lines = [];
          data.forEach(function (value, key) {
            if (key === 'consent' || key === 'company_website') return;
            lines.push(key + ': ' + value);
          });
          var subject = form.getAttribute('data-subject') || 'Запрос с сайта fkm-chemicals.ru';
          window.location.href = 'mailto:' + to +
            '?subject=' + encodeURIComponent(subject) +
            '&body=' + encodeURIComponent(lines.join('\n'));
          say('ok', 'Открылось окно письма. Если этого не произошло — напишите нам на ' + to);
          return;
        }

        var btn = $('button[type="submit"]', form);
        if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Отправляем…'; }

        fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
          .then(function (r) {
            if (!r.ok) throw new Error('bad status');
            form.reset();
            say('ok', 'Спасибо! Заявка отправлена — специалист свяжется с вами в течение рабочего дня.');
          })
          .catch(function () {
            say('err', 'Не удалось отправить. Позвоните нам: +7 (495) 926-27-96 или напишите на office@fkm-chemicals.ru');
          })
          .finally(function () {
            if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || 'Отправить'; }
          });
      });
    });
  }

  /* ----------------------------------------------------------- Мелочи */
  function initMisc() {
    $$('[data-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ------------------------------------------------------------- Старт */
  function boot() {
    initHeader();
    initMegaMenu();
    initMobileNav();
    initAccordions();
    initReveal();
    initToTop();
    initScrollSpy();
    initForms();
    initMisc();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
