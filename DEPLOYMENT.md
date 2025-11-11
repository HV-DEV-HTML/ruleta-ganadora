# Guía de Despliegue en GitHub Pages

## Configuración Inicial

### 1. Actualizar astro.config.mjs
Asegúrate de actualizar las siguientes líneas en `astro.config.mjs` con tu información:

```javascript
site: 'https://TU-USUARIO.github.io', // Reemplaza TU-USUARIO con tu usuario de GitHub
base: '/ruleta-ganadora', // Nombre de tu repositorio
```

### 2. Configurar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Navega a **Settings** > **Pages**
3. En **Source**, selecciona **GitHub Actions**

### 3. Hacer Push de los Cambios

```bash
git add .
git commit -m "Add GitHub Actions deployment"
git push origin main
```

## Despliegue Automático

El sitio se desplegará automáticamente cuando:
- Hagas push a la rama `main`
- Ejecutes manualmente el workflow desde la pestaña **Actions**

## Ver el Sitio

Una vez desplegado, tu sitio estará disponible en:
```
https://TU-USUARIO.github.io/ruleta-ganadora/
```

## Monitorear el Despliegue

1. Ve a la pestaña **Actions** en tu repositorio
2. Verás el workflow "Deploy to GitHub Pages" ejecutándose
3. Haz clic en el workflow para ver los detalles y logs
4. El despliegue toma aproximadamente 2-3 minutos

## Solución de Problemas

### El sitio no carga correctamente
- Verifica que `site` y `base` en `astro.config.mjs` sean correctos
- Asegúrate de que GitHub Pages esté configurado para usar GitHub Actions

### Error en el workflow
- Revisa los logs en la pestaña Actions
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que el proyecto compile localmente con `npm run build`

## Desarrollo Local

Para probar el sitio con la configuración de producción:

```bash
npm run build
npm run preview
```
