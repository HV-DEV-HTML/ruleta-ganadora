# Implementación de Tabs: Prepago y Postpago

## 📋 Resumen
Agregar sistema de tabs para mostrar diferentes conjuntos de 3 cards según el tipo de plan seleccionado (Prepago o Postpago).

---

## 🎯 Propuesta de Implementación

### Opción 1: Componente Reutilizable (RECOMENDADA)

**Ventajas:**
- ✅ Código más limpio y mantenible
- ✅ Fácil de escalar si se agregan más tipos de planes
- ✅ Lógica GSAP encapsulada y reutilizable
- ✅ Mejor separación de responsabilidades

**Estructura:**
```
src/
├── components/
│   ├── Participa.astro (componente principal con tabs)
│   └── CardSlider.astro (nuevo componente reutilizable)
```

**Implementación:**

1. **Crear `CardSlider.astro`**
   - Recibe props: `cards` (array de objetos con imagen, alt, título, descripción)
   - Contiene toda la lógica GSAP actual
   - Maneja mobile/desktop responsiveness
   - Incluye botones de navegación

2. **Modificar `Participa.astro`**
   - Agregar UI de tabs (Prepago/Postpago)
   - Definir datos de cards para cada tipo
   - Mostrar/ocultar `CardSlider` según tab activo
   - Manejar estado del tab seleccionado

**Código de ejemplo:**

```astro
---
// Participa.astro
import CardSlider from './CardSlider.astro';

const prepagoCards = [
  { 
    image: "url1", 
    alt: "Paso 1 Prepago",
    step: 1,
    title: "Título paso 1",
    description: "Descripción paso 1"
  },
  // ... 2 cards más
];

const postpagoCards = [
  { 
    image: "url4", 
    alt: "Paso 1 Postpago",
    step: 1,
    title: "Título paso 1",
    description: "Descripción paso 1"
  },
  // ... 2 cards más
];
---

<section class="relative pt-0 bg-transparent z-10 text-white">
  <div class="container">
    <h2>¡Participar es muy fácil!</h2>
    
    <!-- Tabs UI -->
    <div class="tabs-container flex justify-center gap-4 mb-8">
      <button class="tab-btn active" data-tab="prepago">
        Prepago
      </button>
      <button class="tab-btn" data-tab="postpago">
        Postpago
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content active" data-content="prepago">
      <CardSlider cards={prepagoCards} tabId="prepago" />
    </div>
    
    <div class="tab-content hidden" data-content="postpago">
      <CardSlider cards={postpagoCards} tabId="postpago" />
    </div>
  </div>
</section>

<script>
  // Lógica simple de tabs
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      
      // Update active states
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.add('hidden'));
      
      btn.classList.add('active');
      document.querySelector(`[data-content="${tabName}"]`)?.classList.remove('hidden');
    });
  });
</script>
```

---

### Opción 2: Todo en un Componente

**Ventajas:**
- ✅ Más simple inicialmente
- ✅ Todo en un solo archivo

**Desventajas:**
- ❌ Código más largo y difícil de mantener
- ❌ Duplicación de lógica GSAP
- ❌ Más complejo manejar cleanup entre tabs

**Implementación:**
- Mantener todo en `Participa.astro`
- Duplicar HTML de cards con diferentes clases/IDs
- Inicializar GSAP para cada conjunto de cards
- Manejar show/hide de grupos de cards

---

## 🛠️ Plan de Trabajo Recomendado

### Día 1: Refactorización
1. ✅ Crear `CardSlider.astro`
2. ✅ Mover lógica GSAP actual a `CardSlider.astro`
3. ✅ Definir interface de props
4. ✅ Hacer que `CardSlider` sea completamente reutilizable

### Día 2: Integración de Tabs
1. ✅ Crear UI de tabs en `Participa.astro`
2. ✅ Definir datos de cards para Prepago y Postpago
3. ✅ Implementar lógica de cambio de tabs
4. ✅ Probar transiciones y responsiveness

### Día 3: Refinamiento
1. ✅ Agregar animaciones de transición entre tabs
2. ✅ Optimizar cleanup de GSAP al cambiar tabs
3. ✅ Ajustar estilos y UX
4. ✅ Testing en diferentes dispositivos

---

## 🎨 Consideraciones de UX

### Transición entre Tabs
```javascript
// Opción A: Fade simple
gsap.to(currentTab, {
  opacity: 0,
  duration: 0.3,
  onComplete: () => {
    currentTab.classList.add('hidden');
    newTab.classList.remove('hidden');
    gsap.fromTo(newTab, 
      { opacity: 0 },
      { opacity: 1, duration: 0.3 }
    );
  }
});

// Opción B: Slide
gsap.to(currentTab, {
  x: -100,
  opacity: 0,
  duration: 0.4,
  ease: "power2.inOut"
});
```

### Estilos de Tabs
```css
.tab-btn {
  @apply px-6 py-3 rounded-lg font-amx-bold text-lg transition-all;
  @apply bg-transparent border-2 border-white/30 text-white/70;
}

.tab-btn.active {
  @apply bg-white text-primary border-white;
  @apply shadow-lg;
}

.tab-btn:hover:not(.active) {
  @apply border-white/50 text-white/90;
}
```

---

## 🔧 Detalles Técnicos

### Props de CardSlider
```typescript
interface Props {
  cards: Array<{
    image: string;
    alt: string;
    step: number;
    title?: string;
    description?: string;
  }>;
  tabId: string; // Para identificar instancias únicas
}
```

### Cleanup entre Tabs
- Cada `CardSlider` debe tener su propia instancia de GSAP
- Al cambiar de tab, el componente oculto mantiene su estado
- Considerar `display: none` vs `visibility: hidden` para performance
- Usar `tabId` para generar selectores únicos (`.card-${tabId}`)

### Responsive Breakpoints
- Mobile: `< 1024px` → Stack con Draggable
- Desktop: `≥ 1024px` → Cards separados con hover

---

## 📝 Notas Adicionales

### Estado Inicial
- Por defecto mostrar tab "Prepago"
- Guardar tab seleccionado en localStorage (opcional)
- Restaurar tab al recargar página (opcional)

### Accesibilidad
- Agregar `role="tablist"` y `role="tab"`
- Manejar navegación con teclado (Arrow keys)
- `aria-selected` para tab activo
- `aria-hidden` para contenido oculto

### Performance
- Lazy init: Solo inicializar GSAP del tab visible
- Init on demand: Inicializar el otro tab cuando se seleccione
- Considerar IntersectionObserver si hay muchos tabs

---

## 🚀 Próximos Pasos

1. **Revisar esta propuesta** y decidir qué opción seguir
2. **Preparar contenido**: Imágenes y textos para cada card
3. **Comenzar con Opción 1** (recomendada)
4. **Iterar y refinar** según feedback

---

## 💡 Alternativa: Astro View Transitions

Si usas Astro 3.0+, podrías considerar usar View Transitions API para transiciones más suaves entre tabs, pero requiere más configuración.

---

**Fecha de creación:** 12 de Noviembre, 2025  
**Estado:** Pendiente de implementación  
**Prioridad:** Alta

¡Descansa bien! Mañana podemos empezar con la implementación. 🌙
