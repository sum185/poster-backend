'use strict';

// Small progressive-enhancement helpers (menu toggle + delete confirm).
document.addEventListener('click', function (e) {
  var toggle = e.target.closest('[data-menu-toggle]');
  if (toggle) {
    var sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.toggle('open');
  }

  var del = e.target.closest('[data-confirm]');
  if (del && !window.confirm(del.getAttribute('data-confirm'))) {
    e.preventDefault();
  }
});
