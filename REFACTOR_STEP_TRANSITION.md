# Refactorización: Step Transition como Módulo

## Objetivo
Convertir la lógica de transición de pasos de una implementación global (`window.bannerStepTransition`) a un módulo reutilizable en `src/utils/stepTransition.js`.

## Beneficios
- ✅ **Código más limpio y mantenible**
- ✅ **Reutilizable en múltiples contextos**
- ✅ **Más fácil de testear**
- ✅ **No contamina el scope global**
- ✅ **Mejor organización del código**

---

## Paso 1: Crear el módulo `src/utils/stepTransition.js`

```javascript
/**
 * Crea una instancia de gestión de transiciones entre pasos
 * @param {Object} config - Configuración de la transición
 * @param {HTMLElement} config.banner - Elemento contenedor principal del banner
 * @param {HTMLElement} config.btnBackStep - Botón de retroceso
 * @returns {Object} Objeto con métodos de transición
 */
export const createStepTransition = (config) => {
  const { banner, btnBackStep } = config;

  /**
   * Resetea las animaciones AOS de un elemento
   * @param {Element} element - Elemento a resetear
   */
  const resetAosAnimations = (element) => {
    const aosElements = element.querySelectorAll('[data-aos]');
    aosElements.forEach(el => {
      el.classList.remove('aos-animate', 'aos-init');
    });
  };

  /**
   * Preserva el estado de las animaciones AOS
   * @param {Element} element - Elemento a preservar
   */
  const preserveAosState = (element) => {
    const aosElements = element.querySelectorAll('[data-aos]');
    aosElements.forEach(el => {
      el.classList.remove('aos-animate');
      el.classList.add('aos-init');
    });
  };

  /**
   * Realiza la transición entre pasos
   * @param {number} currentStep - Paso actual
   * @param {number} nextStep - Paso destino
   */
  const nextToStep = (currentStep, nextStep) => {
    const currentStepEl = banner.querySelector(`[data-step="${currentStep}"]`);
    const nextStepEl = banner.querySelector(`[data-step="${nextStep}"]`);
    const iconGirl = banner.querySelector(".icon_girl");

    if (!currentStepEl || !nextStepEl) {
      console.warn(`Step elements not found: current=${currentStep}, next=${nextStep}`);
      return;
    }

    // Manejar visibilidad del botón de retroceso y el icono
    if (nextStep <= 1) {
      btnBackStep.classList.add("hidden");
      iconGirl?.classList.remove("hidden", "xl:block");
    } else {
      btnBackStep.classList.remove("hidden");
      iconGirl?.classList.add("hidden", "xl:block");
    }

    // Actualizar el paso previo en el botón de retroceso
    btnBackStep.dataset.prevStep = (nextStep - 1).toString();
    
    // Ocultar paso actual y preservar su estado
    currentStepEl.classList.add("hidden");
    preserveAosState(currentStepEl);
    
    // Mostrar paso siguiente y resetear animaciones
    nextStepEl.classList.remove("hidden");
    banner.dataset.currentStep = nextStep.toString();
    resetAosAnimations(nextStepEl);
    
    // Refrescar AOS
    setTimeout(() => {
      if (window.AOS) {
        window.AOS.refreshHard();
      }
    }, 50);
  };

  /**
   * Obtiene el paso actual
   * @returns {number} Número del paso actual
   */
  const getCurrentStep = () => Number(banner.dataset.currentStep || 1);

  return {
    nextToStep,
    resetAosAnimations,
    preserveAosState,
    getCurrentStep
  };
};
```

---

## Paso 2: Actualizar `src/components/Banner.astro`

### Antes (implementación actual):
```javascript
// Funciones definidas inline y expuestas globalmente
const nextToStep = (currentStep, nextStep) => { /* ... */ };
(window as any).bannerStepTransition = { nextToStep, /* ... */ };
```

### Después (usando el módulo):
```javascript
import { createStepTransition } from "@/utils/stepTransition.js";

const banner = document.querySelector(".banner_sorteo");
const allBTns = banner.querySelectorAll(".btn_step");
const btnBackStep = banner.querySelector(".btn_back_step");

// Crear instancia de transición
const stepTransition = createStepTransition({ banner, btnBackStep });

// (Opcional) Exponer globalmente si otros componentes lo necesitan
window.bannerStepTransition = stepTransition;

// Botón de retroceso
btnBackStep.addEventListener("click", (e) => {
  e.preventDefault();
  const prevStep = Number(e.currentTarget.dataset.prevStep);
  const currentStep = stepTransition.getCurrentStep();
  stepTransition.nextToStep(currentStep, prevStep);
});

// Botones de avance (excluir submit buttons)
allBTns.forEach(btn => {
  if (btn.getAttribute('type') !== 'submit') {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const nextStep = Number(e.currentTarget.dataset.nextStep);
      const currentStep = stepTransition.getCurrentStep();
      btnBackStep.dataset.prevStep = currentStep.toString();
      stepTransition.nextToStep(currentStep, nextStep);
    });
  }
});
```

---

## Paso 3: Actualizar `src/components/Paso02.astro`

### Opción A: Usar la instancia global (más simple)
```javascript
document.addEventListener('DOMContentLoaded', () => {
  // ... código de validación ...
  
  validator.onSuccess((event) => {
    event.preventDefault();
    
    const nextStep = Number(submitBtn.dataset.nextStep);
    
    // Usar la instancia global
    if (window.bannerStepTransition) {
      const currentStep = window.bannerStepTransition.getCurrentStep();
      window.bannerStepTransition.nextToStep(currentStep, nextStep);
    }
    
    setTimeout(() => resetForm(), 500);
  });
});
```

### Opción B: Importar y crear nueva instancia (más puro)
```javascript
import { createStepTransition } from "@/utils/stepTransition.js";

document.addEventListener('DOMContentLoaded', () => {
  const banner = document.querySelector(".banner_sorteo");
  const btnBackStep = banner.querySelector(".btn_back_step");
  const stepTransition = createStepTransition({ banner, btnBackStep });
  
  // ... código de validación ...
  
  validator.onSuccess((event) => {
    event.preventDefault();
    
    const nextStep = Number(submitBtn.dataset.nextStep);
    const currentStep = stepTransition.getCurrentStep();
    stepTransition.nextToStep(currentStep, nextStep);
    
    setTimeout(() => resetForm(), 500);
  });
});
```

---

## Paso 4: Actualizar `src/components/Paso03.astro`

No requiere cambios si usa redirección directa. Si necesita transiciones, aplicar el mismo patrón que Paso02.

---

## Archivos a modificar

1. ✅ **Crear**: `src/utils/stepTransition.js`
2. 🔄 **Modificar**: `src/components/Banner.astro`
3. 🔄 **Modificar**: `src/components/Paso02.astro`
4. ⚠️ **Opcional**: `src/components/Paso03.astro` (si requiere transiciones)

---

## Consideraciones

### Compatibilidad con Astro
- Los imports funcionan correctamente en tags `<script>` de Astro
- El alias `@/` debe estar configurado en `tsconfig.json` o `astro.config.mjs`

### Manejo de errores
- El módulo incluye validaciones para elementos no encontrados
- Logs de advertencia en consola para debugging

### Testing
Con el módulo es más fácil crear tests unitarios:
```javascript
import { createStepTransition } from './stepTransition.js';

describe('stepTransition', () => {
  it('should transition to next step', () => {
    const mockBanner = document.createElement('div');
    const mockBtn = document.createElement('button');
    const transition = createStepTransition({ 
      banner: mockBanner, 
      btnBackStep: mockBtn 
    });
    // ... tests
  });
});
```

---

## Recomendación

**Para este proyecto**: Usar **Opción A** (instancia global) en Paso02 y Paso03 porque:
- Es más simple
- Evita duplicar la lógica de inicialización
- Mantiene una única fuente de verdad

**Para proyectos futuros**: Usar **Opción B** (importar módulo) porque:
- Es más testeable
- Mejor separación de responsabilidades
- No depende del scope global

---

## Prioridad
📌 **Mejora futura** - No urgente, el código actual funciona correctamente.
🎯 **Objetivo**: Mejorar la arquitectura y mantenibilidad del código.
