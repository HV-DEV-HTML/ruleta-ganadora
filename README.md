# Ruleta Ganadora (Astro)

Landing interactiva para campaña **Ruleta Ganadora** (Claro). Incluye flujo de registro/validación, carga dinámica de premios, animaciones de entrada y giro de ruleta.

## Stack

- **Framework:** Astro
- **Estilos:** TailwindCSS
- **Animaciones:** GSAP (ruleta/intro), AOS (transiciones por scroll)
- **Estado:** Zustand (vanilla store)
- **Form validation:** JustValidate
- **UI modal:** SweetAlert2

## Requisitos

- Node.js (recomendado 18+)
- npm

## Instalación

```sh
npm install
```

## 🧞 Comandos

Todos los comandos se ejecutan desde la raíz del proyecto:

| Comando | Acción |
| :-- | :-- |
| `npm run dev` | Inicia el servidor de desarrollo en `http://localhost:4321` |
| `npm run build` | Construye el sitio para producción en `./dist/` |
| `npm run preview` | Previsualiza el build localmente |
| `npm run astro ...` | Ejecuta comandos de la CLI de Astro |

## Estructura del proyecto

```text
/
├── public/
├── src/
│   ├── assets/                # Imágenes, íconos, svgs
│   ├── components/            # Componentes Astro (flujo + ruleta)
│   ├── layouts/               # Layout base
│   ├── pages/                 # Entrypoints (index)
│   ├── store/                 # Zustand store (user)
│   ├── styles/                # CSS global / utilidades
│   └── utils/                 # Endpoints, helpers de animación/modal
└── package.json
```

## Componentes y flujo (alto nivel)

- **`src/pages/index.astro`**
  - Importa CSS de AOS y ejecuta `AOS.init()`.
  - Renderiza el layout y componentes principales.
- **`src/components/Ruleta.astro`**
  - Vista/experiencia principal de ruleta.
  - Animación de intro y giro con **GSAP**.
  - Persistencia de usuario (localStorage) y reinicio del flujo.
  - Reset de AOS dentro de la sección para re-disparar animaciones cuando se vuelve al inicio.
- **`src/components/Paso01.astro`, `Paso02.astro`, `Paso03.astro`**
  - Pasos del flujo (registro, validación, etc.) con `data-step`.
- **`src/components/Banner.astro`**
  - Transición entre pasos y utilidades de reseteo/preservación de AOS.

## API / Endpoints

Los llamados a backend están en:

- `src/utils/endpoints.js`

Base URL actual:

- `https://api_ruleta.claromarketingcloud.pe/api`

Funciones principales:

- `getDepartament()` / `getProvince(departmentId)`
- `preCheck(phone)`
- `registerUser(name, email, phone, serviceId, docType, docNumber, provinceId)`
- `verifyCode(email, code, docNumber)`
- `validUserEnabled(serviceId)`
- `getListProducts(provinceId)`
- `spinSaveResult(serviceId, prizeTypeId)`

## Estado (Zustand)

- `src/store/userStore.js`
  - `user`
  - `setUser(user)`

## Notas de animación

### AOS (data-aos)

- AOS se inicializa en `src/pages/index.astro`.
- Para re-disparar animaciones al volver a mostrar una sección, se remueven clases `aos-init`/`aos-animate` de nodos con `[data-aos]` y se ejecuta `AOS.refreshHard()`.

### GSAP (ruleta)

- La ruleta usa animación de intro y giro con GSAP.
- Para evitar que la intro deje un ángulo “acumulado”, se normaliza el estado al finalizar (rotación base) limpiando estilos inline.

## Build / Deploy

La carpeta _assets se despliega en MOSAIC, en el path declarado en `astro.config.mjs`:

- **Assets:** `build.assetsPrefix` apunta a un CDN/MOSAIC de Claro para servir assets en el CMS de producción.

## Troubleshooting

- Si en dev notas que animaciones AOS no vuelven a dispararse al cambiar de step/mostrar secciones, revisa que se ejecute `AOS.refreshHard()` luego de manipular `hidden`.
- Si la ruleta queda en ángulos inesperados tras varias entradas, asegúrate de no depender de rotaciones `"+="` sin normalizar el estado al final de la animación.

## Referencias

- Astro docs: https://docs.astro.build
