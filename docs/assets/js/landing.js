(function () {
  "use strict";

  var root = document.documentElement;

  // Marca de JS activo: sin esta clase la navegacion sigue visible y usable.
  root.classList.add("js");

  // Modo liviano para hardware debil: apaga animaciones y glass.
  var cores = navigator.hardwareConcurrency || 8;
  var mem = navigator.deviceMemory || 8;
  if (cores <= 2 || mem <= 4) {
    root.classList.add("lite");
  }

  // Reveal agrupado por bloque, solo como mejora progresiva.
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && !root.classList.contains("lite") && "IntersectionObserver" in window) {
    root.classList.add("motion");
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) {
      observer.observe(el);
    });
  }

  // Menu de navegacion en pantallas chicas.
  var menuBtn = document.getElementById("menuBtn");
  var menu = document.getElementById("mobileNav");
  function closeMenu() {
    if (!menu || !menu.classList.contains("open")) return;
    menu.classList.remove("open");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
  }

  // Captura del producto: si carga, reemplaza la ilustracion rotulada.
  var shot = document.getElementById("shotImg");
  var caption = document.getElementById("shotCaption");
  if (shot) {
    var show = function (ok) {
      if (!ok) return;
      shot.classList.add("is-loaded");
      if (caption) caption.textContent = "Panel de TUSTOCK en la PC del local.";
    };
    if (shot.complete && shot.naturalWidth > 0) {
      show(true);
    } else {
      shot.addEventListener("load", function () { show(true); });
    }
    shot.addEventListener("error", function () {
      shot.style.display = "none";
    });
  }
})();
