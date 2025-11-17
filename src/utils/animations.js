import gsap from "gsap";

/**
 * Aplica una animación de float continua a un elemento
 * @param {HTMLElement|string} element - Elemento HTML o selector CSS
 * @param {Object} options - Opciones de configuración
 * @param {number} [options.distance=15] - Distancia del movimiento vertical en píxeles
 * @param {number} [options.duration=3] - Duración de la animación en segundos
 * @param {string} [options.ease="sine.inOut"] - Tipo de easing
 * @param {number} [options.delay=0] - Delay antes de iniciar la animación en segundos
 * @returns {gsap.core.Tween} La animación GSAP creada
 */
export function applyFloatAnimation(element, options = {}) {
  const {
    distance = 15,
    duration = 3,
    ease = "sine.inOut",
    delay = 0
  } = options;

  const el = typeof element === "string" 
    ? document.querySelector(element)
    : element;

  if (!el) {
    console.warn("Float animation: Element not found");
    return null;
  }

  return gsap.to(el, {
    y: `+=${distance}`,
    duration,
    ease,
    delay,
    repeat: -1,
    yoyo: true
  });
}

/**
 * Aplica un efecto parallax a un elemento basado en el movimiento del mouse
 * @param {HTMLElement|string} element - Elemento HTML o selector CSS
 * @param {Object} options - Opciones de configuración
 * @param {HTMLElement} [options.container=document.body] - Contenedor que activa el parallax
 * @param {number} [options.intensity=30] - Intensidad del movimiento en píxeles
 * @param {number} [options.duration=0.3] - Duración de la transición en segundos
 * @param {string} [options.ease="power2.out"] - Tipo de easing
 * @param {boolean} [options.enableX=true] - Aplicar parallax en eje X
 * @param {boolean} [options.enableY=false] - Aplicar parallax en eje Y
 * @param {boolean} [options.invertX=false] - Invertir dirección del parallax en eje X
 * @param {boolean} [options.invertY=false] - Invertir dirección del parallax en eje Y
 * @returns {Function} Función de limpieza para remover los event listeners
 */
export function applyParallaxEffect(element, options = {}) {
  const {
    container = document.body,
    intensity = 30,
    duration = 0.3,
    ease = "power2.out",
    enableX = true,
    enableY = false,
    invertX = false,
    invertY = false
  } = options;

  const el = typeof element === "string" 
    ? document.querySelector(element)
    : element;

  if (!el) {
    console.warn("Parallax effect: Element not found");
    return () => {};
  }

  let isMouseInside = false;

  const handleMouseEnter = () => {
    isMouseInside = true;
  };

  const handleMouseLeave = () => {
    isMouseInside = false;
    const resetProps = { duration, ease };
    if (enableX) resetProps.x = 0;
    if (enableY) resetProps.y = 0;
    gsap.to(el, resetProps);
  };

  const handleMouseMove = (e) => {
    if (!isMouseInside) return;

    const xPercent = (e.clientX / window.innerWidth - 0.5) * 2;
    const yPercent = (e.clientY / window.innerHeight - 0.5) * 2;

    // Aplicar multiplicador de dirección (-1 para invertir, 1 para normal)
    const xMultiplier = invertX ? 1 : -1;
    const yMultiplier = invertY ? 1 : -1;

    const animProps = { duration, ease, overwrite: "auto" };
    if (enableX) animProps.x = xPercent * xMultiplier * intensity;
    if (enableY) animProps.y = yPercent * yMultiplier * intensity;

    gsap.to(el, animProps);
  };

  container.addEventListener("mouseenter", handleMouseEnter);
  container.addEventListener("mouseleave", handleMouseLeave);
  window.addEventListener("mousemove", handleMouseMove);

  // Retorna función de limpieza
  return () => {
    container.removeEventListener("mouseenter", handleMouseEnter);
    container.removeEventListener("mouseleave", handleMouseLeave);
    window.removeEventListener("mousemove", handleMouseMove);
  };
}

/**
 * Aplica animación de float y parallax a un elemento simultáneamente
 * @param {HTMLElement|string} element - Elemento HTML o selector CSS
 * @param {Object} floatOptions - Opciones para la animación de float
 * @param {Object} parallaxOptions - Opciones para el efecto parallax
 * @returns {Object} Objeto con la animación y función de limpieza { animation, cleanup }
 */
export function applyFloatWithParallax(element, floatOptions = {}, parallaxOptions = {}) {
  const animation = applyFloatAnimation(element, floatOptions);
  const cleanup = applyParallaxEffect(element, parallaxOptions);

  return { animation, cleanup };
}

let preloadTimeline = null;

export function togglePreloadAnimation(show, options = {}) {
  const { selector = ".box_preload" } = options;

  const overlay = typeof selector === "string"
    ? document.querySelector(selector)
    : selector;

  if (!overlay) {
    console.warn("Preload animation: overlay element not found");
    return;
  }

  if (show) {
    overlay.classList.remove("opacity-0", "invisible");

    const maskCircle = overlay.querySelector('svg [data-mask-circle]');
    const shapeFirst = overlay.querySelector('svg [data-shape="first"]');
    const shapeMedium = overlay.querySelector('svg [data-shape="medium"]');
    const shapeLast = overlay.querySelector('svg [data-shape="last"]');

    if (!maskCircle || typeof maskCircle.getTotalLength !== "function") {
      return;
    }

    const length = maskCircle.getTotalLength();

    gsap.set(maskCircle, {
      strokeDasharray: length + 1,
      strokeDashoffset: length,
    });

    if (shapeFirst) {
      gsap.set(shapeFirst, {
        scaleY: 0.1,
        opacity: 0,
        transformOrigin: "50% 100%",
      });
    }
    if (shapeMedium) {
      gsap.set(shapeMedium, {
        scaleY: 0.1,
        opacity: 0,
        transformOrigin: "50% 100%",
      });
    }
    if (shapeLast) {
      gsap.set(shapeLast, {
        scaleX: 0.1,
        opacity: 0,
        transformOrigin: "0% 50%",
      });
    }

    preloadTimeline = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });

    preloadTimeline.fromTo(
      maskCircle,
      { strokeDashoffset: length },
      {
        strokeDashoffset: 0,
        duration: 0.9,
        ease: "power2.inOut",
      }
    );

    if (shapeFirst) {
      preloadTimeline.to(
        shapeFirst,
        {
          scaleY: 1,
          opacity: 1,
          duration: 0.35,
          ease: "back.out(1.4)",
        },
        0.6
      );
    }

    if (shapeMedium) {
      preloadTimeline.to(
        shapeMedium,
        {
          scaleY: 1,
          opacity: 1,
          duration: 0.35,
          ease: "back.out(1.4)",
        },
        ">-0.25"
      );
    }

    if (shapeLast) {
      preloadTimeline.to(
        shapeLast,
        {
          scaleX: 1,
          opacity: 1,
          duration: 0.35,
          ease: "back.out(1.4)",
        },
        ">-0.2"
      );
    }
    document.body.classList.add('overflow-hidden');
  } else {
    overlay.classList.add("opacity-0", "invisible");

    if (preloadTimeline) {
      preloadTimeline.kill();
      preloadTimeline = null;
    }

    const maskCircle = overlay.querySelector('svg [data-mask-circle]');
    const shapeFirst = overlay.querySelector('svg [data-shape="first"]');
    const shapeMedium = overlay.querySelector('svg [data-shape="medium"]');
    const shapeLast = overlay.querySelector('svg [data-shape="last"]');

    const elements = [maskCircle, shapeFirst, shapeMedium, shapeLast].filter(Boolean);
    if (elements.length) {
      gsap.killTweensOf(elements);
    }
    document.body.classList.remove('overflow-hidden');
  }
}
