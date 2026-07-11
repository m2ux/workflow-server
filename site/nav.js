/** Close nav dropdowns on selection; keep at most one section open at a time. */
(function () {
  const groups = document.querySelectorAll('.site-nav__group');
  if (!groups.length) return;

  groups.forEach((details) => {
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      groups.forEach((other) => {
        if (other !== details) other.removeAttribute('open');
      });
    });

    details.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        details.removeAttribute('open');
      });
    });
  });
})();
