# Guía de uso - Animaciones GSAP

Este archivo contiene ejemplos de cómo usar las funciones de animación reutilizables.

## Funciones disponibles

### 1. `applyFloatAnimation(element, options)`

Aplica una animación de float (flotación) continua a un elemento.

**Parámetros:**
- `element`: HTMLElement o selector CSS (string)
- `options`: Objeto con las siguientes propiedades opcionales:
  - `distance`: Distancia del movimiento vertical en píxeles (default: 15)
  - `duration`: Duración de la animación en segundos (default: 3)
  - `ease`: Tipo de easing (default: "sine.inOut")
  - `delay`: Delay antes de iniciar en segundos (default: 0)

**Ejemplo:**
```typescript
import { applyFloatAnimation } from "@/utils/animations";

// Usando selector CSS
applyFloatAnimation(".mi-icono", {
  distance: 20,
  duration: 2.5,
  delay: 0.5
});

// Usando elemento HTML
const icon = document.querySelector(".mi-icono");
applyFloatAnimation(icon, {
  distance: 10,
  duration: 4
});
```

### 2. `applyParallaxEffect(element, options)`

Aplica un efecto parallax basado en el movimiento del mouse.

**Parámetros:**
- `element`: HTMLElement o selector CSS (string)
- `options`: Objeto con las siguientes propiedades opcionales:
  - `container`: Contenedor que activa el parallax (default: document.body)
  - `intensity`: Intensidad del movimiento en píxeles (default: 30)
  - `duration`: Duración de la transición en segundos (default: 0.3)
  - `ease`: Tipo de easing (default: "power2.out")
  - `enableX`: Aplicar parallax en eje X (default: true)
  - `enableY`: Aplicar parallax en eje Y (default: false)
  - `invertX`: Invertir dirección del parallax en eje X (default: false)
  - `invertY`: Invertir dirección del parallax en eje Y (default: false)

**Retorna:** Función de limpieza para remover los event listeners

**Ejemplo:**
```javascript
import { applyParallaxEffect } from "@/utils/animations.js";

const banner = document.querySelector(".banner");

// Icono que se mueve en dirección normal
const cleanup1 = applyParallaxEffect(".icono-1", {
  container: banner,
  intensity: 50,
  enableX: true,
  invertX: false
});

// Icono que se mueve en dirección invertida
const cleanup2 = applyParallaxEffect(".icono-2", {
  container: banner,
  intensity: 50,
  enableX: true,
  invertX: true
});

// Cuando necesites limpiar los listeners:
// cleanup1();
// cleanup2();
```

### 3. `applyFloatWithParallax(element, floatOptions, parallaxOptions)`

Combina ambas animaciones (float + parallax) en un solo elemento.

**Parámetros:**
- `element`: HTMLElement o selector CSS (string)
- `floatOptions`: Opciones para la animación de float
- `parallaxOptions`: Opciones para el efecto parallax

**Retorna:** Objeto con `{ animation, cleanup }`

**Ejemplo:**
```typescript
import { applyFloatWithParallax } from "@/utils/animations";

const banner = document.querySelector(".banner");

const { animation, cleanup } = applyFloatWithParallax(
  ".mi-icono",
  {
    distance: 15,
    duration: 3,
    delay: 0.5
  },
  {
    container: banner,
    intensity: 30,
    enableX: true,
    enableY: false
  }
);
```

## Ejemplo completo en un componente Astro

```astro
---
import icon from "@/assets/images/mi-icono.png"
---

<!-- Agregar la clase icon_parallax, data-delay y data-invert-x -->
<img class="icon_parallax" data-delay="0.5" data-invert-x="false" src={icon.src} alt="Mi Icono">

<script>
  import { applyFloatWithParallax } from "@/utils/animations.js";
  
  const container = document.querySelector(".mi-seccion");
  const icons = document.querySelectorAll(".icon_parallax");
  
  icons.forEach((icon) => {
    const iconEl = icon as HTMLElement;
    const delay = parseFloat(iconEl.dataset.delay || "0");
    const invertX = iconEl.dataset.invertX === "true";
    
    applyFloatWithParallax(
      iconEl,
      {
        distance: 15,
        duration: 3,
        ease: "sine.inOut",
        delay: delay
      },
      {
        container: container,
        intensity: 30,
        duration: 0.3,
        ease: "power2.out",
        enableX: true,
        enableY: false,
        invertX: invertX
      }
    );
  });
</script>
```

## Notas importantes

1. **Evita conflictos con CSS**: No uses la clase `animate-float` de CSS junto con estas animaciones GSAP.

2. **Parallax solo en X**: Por defecto, el parallax solo afecta el eje X para no interferir con la animación de float en el eje Y.

3. **Delays personalizados**: Usa el atributo `data-delay` en tus elementos HTML para crear efectos escalonados.

4. **Direcciones diferentes**: Usa el atributo `data-invert-x="true"` o `data-invert-x="false"` para que cada icono se mueva en direcciones opuestas, creando un efecto más dinámico.

5. **Limpieza de listeners**: Si necesitas destruir las animaciones, usa la función `cleanup()` que retorna `applyParallaxEffect` o `applyFloatWithParallax`.
