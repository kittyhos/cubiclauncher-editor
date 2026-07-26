# Cubiclauncher-Editor

Creador visual de temas para [CubicLauncher](https://www.cubiclauncher.org). Genera temas en formato **v2** (`Meta.toml` + `Definition.toml`) listos para arrastrar al launcher o para publicar en el repositorio oficial de themes.

Está pensado para funcionar como sitio estático en **GitHub Pages**: no necesita backend ni base de datos.

## Características

- Formularios visuales para todos los campos de `Meta.toml` y `Definition.toml`.
- Pickers de color con sincronización en tiempo real.
- Carga de imagen de fondo con previsualización.
- Editor opcional de `Inject.css` para CSS avanzado.
- Gestión de fuentes personalizadas.
- Vista previa en vivo fiel a la interfaz real de CubicLauncher (sidebar, header de instancia, tarjeta de detalles y fondo con blur/opacidad).
- Exportación/importación de la configuración como JSON.
- Descarga del tema como `.zip` (listo para arrastrar a CubicLauncher).
- Descarga de la estructura de carpetas lista para un Pull Request al repositorio oficial.

## Uso local

```bash
# Cloná o descargá el repositorio
cd cubiclauncher-editor

# Serví los archivos estáticos con Python
python3 -m http.server 8080
```

Abrí [http://localhost:8080](http://localhost:8080) en tu navegador.

## Publicar en GitHub Pages

1. Creá un repositorio nuevo en GitHub.
2. Subí todo el contenido de esta carpeta al repositorio.
3. Andá a **Settings > Pages**.
4. En **Source** seleccioná **Deploy from a branch** y elegí la rama `main` y la carpeta `/ (root)`.
5. Guardá y esperá unos segundos. GitHub te dará la URL pública.

> Consejo: si querés un dominio personalizado, configurálo en la misma sección de Pages.

## Estructura del código fuente

```
.
├── index.html          # Punto de entrada de la app
├── README.md           # Este archivo
├── assets/             # Recursos estáticos (imágenes, fuentes, etc.)
├── css/
│   ├── styles.css      # Importa todos los partials
│   ├── base.css        # Variables, resets y estilos base
│   ├── layout.css      # Header, body y editor drawer
│   ├── components.css  # Botones, formularios, modal
│   ├── preview.css     # Panel de vista previa de CubicLauncher
│   └── responsive.css  # Media queries
└── js/
    ├── app.js          # Inicialización del sitio
    ├── state.js        # Estado de la app y utilidades de copia/fusión
    ├── utils.js        # Funciones de utilidad generales
    ├── color-utils.js  # Manipulación de color y extracción de paleta
    ├── theme-export.js # Generación de TOML, ZIP y estructura PR
    └── ui.js           # Interacciones con el DOM y vista previa
```

El JavaScript usa **módulos ES nativos** (`type="module"`), por lo que se carga un solo punto de entrada en `index.html` y cada archivo exporta sus responsabilidades.

## Crear un tema

1. Completá los metadatos en la sección **Meta**.
2. Ajustá colores, textos, fondos, bordes, sombras, tipografía, etc.
3. (Opcional) Subí una imagen de fondo y configurá blur/opacidad.
4. (Opcional) Agregá fuentes personalizadas y CSS avanzado.
5. Revisá la vista previa del panel derecho.
6. Hacé clic en **Descargar tema (.zip)** para obtener el paquete listo.

## Instalar el tema en CubicLauncher

Arrastrá el archivo `.zip` descargado directamente sobre la ventana de CubicLauncher. Luego seleccionalo en el selector de temas.

Más detalles en la documentación oficial: [Cómo poner un theme](https://dev.cubiclauncher.org/docs/es-ES/Uso/instalar-tema).

## Publicar en el repositorio oficial

Si querés que tu tema aparezca en [cubiclauncher.org/themes](https://www.cubiclauncher.org/themes):

1. Hacé clic en **Descargar estructura PR**.
2. Extraé el ZIP. Verás una estructura como:

   ```
   src/
     Autor/
       Tema/
         theme.md
         V1/
           Autor_Tema.zip
   ```

3. Forkeá el repositorio [CubicLauncherDevs/Themes](https://github.com/CubicLauncherDevs/Themes).
4. Copiá la carpeta `src/Autor/Tema` adentro del `src/` del fork.
5. Creá un Pull Request.

Revisá la guía completa de publicación: [Cómo crear themes](https://dev.cubiclauncher.org/docs/es-ES/guias/hacer-themes).

## Estructura del proyecto generado

### Tema (.zip)

```
Autor_Tema.zip
└── NombreDelTema/
    ├── Meta.toml
    ├── Definition.toml
    ├── Inject.css        (opcional)
    └── bg.ext            (opcional)
```

### Pull Request

```
Autor_Tema_PR.zip
└── src/
    └── Autor/
        └── Tema/
            ├── theme.md
            └── V1/
                └── Autor_Tema.zip
```

## Notas importantes

- Los temas se generan en **formato v2** (TOML), que es el recomendado.
- Las imágenes de fondo deben ser PNG, JPG, GIF o WEBP y pesar menos de 25 MB.
- Si distribuís fuentes personalizadas, incluí siempre su licencia.
- La app usa CDN para JSZip y FileSaver.js. Si querés que funcione sin conexión, descargá esas bibliotecas y actualizá las rutas en `index.html`.

## Licencia

Este proyecto es de código abierto. Usalo, modificálo y compartilo como prefieras.
