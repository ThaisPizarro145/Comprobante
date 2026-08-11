# Lector de Comprobantes

Sistema independiente para leer comprobantes de pago (Yape, depósitos BCP,
transferencias, etc.) mediante OCR en el navegador, clasificarlos
automáticamente e imprimir un ticket térmico.

## Características

- **Sin base de datos.** No se almacena ninguna imagen, texto ni resultado.
  Todo vive en memoria del navegador mientras el usuario trabaja; al cerrar
  o recargar la página, todo desaparece.
- **OCR 100% en el navegador**, usando [Tesseract.js](https://github.com/naptha/tesseract.js)
  (WebAssembly). La imagen del comprobante **nunca se envía a un servidor**.
- **Clasificación extensible** por reglas (`src/utils/clasificarComprobante.js`):
  YAPE → DEPÓSITO BCP → TRANSFERENCIA → DESCONOCIDO, en ese orden de prioridad.
  Agregar un nuevo tipo (PLIN, Interbank, BBVA, etc.) es agregar una entrada
  al arreglo `REGLAS_CLASIFICACION`, sin tocar el resto de la app.
- **Impresión térmica** (58mm/80mm) vía `window.print()` con CSS dedicado
  (`src/components/Ticket`), que oculta todo excepto el ticket al imprimir.

## Nota técnica sobre el OCR (léase antes de desplegar)

Tesseract.js ejecuta el reconocimiento de texto **dentro del navegador**, por
lo que no depende de un backend propio. Sin embargo, por configuración por
defecto, la **primera vez que un usuario analiza un comprobante**, el
navegador descarga desde el CDN público `cdn.jsdelivr.net`:

- el script del worker (~pocos KB),
- el núcleo WASM del motor Tesseract (~2-4 MB),
- los datos entrenados del idioma español `spa.traineddata` (~10-15 MB).

Estos archivos **no contienen ni transmiten datos del usuario**: son
artefactos estáticos del motor OCR. El navegador los cachea después de la
primera descarga, así que los siguientes análisis son rápidos incluso sin
conexión. Esto requiere que el dispositivo tenga acceso a internet la
primera vez que se usa. Si en el futuro se prefiere evitar la dependencia
del CDN externo (por ejemplo, para uso totalmente offline desde el primer
uso), se pueden auto-hospedar esos mismos archivos en `public/` y apuntar
`corePath` / `langPath` / `workerPath` en `src/services/ocrService.js` hacia
rutas locales — la app quedaría ~15 MB más pesada pero sin dependencia
externa.

## Estructura del proyecto

```text
src/
├── components/
│   ├── UploadComprobante/   # selección de imagen
│   ├── PreviewComprobante/  # vista previa + quitar imagen
│   ├── ResultadoOCR/        # tipo, datos extraídos, texto OCR crudo
│   └── Ticket/               # ticket imprimible (solo visible al imprimir)
├── services/
│   └── ocrService.js         # wrapper de Tesseract.js (crea/termina worker)
├── utils/
│   ├── normalizarTexto.js    # normalización tolerante para clasificar
│   ├── clasificarComprobante.js # reglas de clasificación, extensibles
│   └── extraerDatos.js       # extracción de monto/fecha/hora/códigos
├── pages/
│   └── Inicio/                # orquesta el flujo completo
└── App.jsx
```

## Desarrollo local

```bash
npm install
npm run dev
```

## Despliegue en Vercel

No requiere configuración especial: es un proyecto Vite + React estático.

1. Sube el repositorio a GitHub (ya hecho).
2. En Vercel: **New Project → Import** el repositorio.
3. Framework Preset: **Vite** (detectado automáticamente).
   - Build Command: `npm run build` (por defecto)
   - Output Directory: `dist` (por defecto)
4. No se necesitan variables de entorno ni base de datos.

## Impresión directa (futuro)

Actualmente la impresión usa `window.print()` con CSS de impresión dedicado
para papel térmico. El código está organizado (`src/components/Ticket`) para
que, si más adelante se necesita impresión directa a impresora térmica sin
diálogo del navegador, se pueda agregar un servicio local (ej. un pequeño
puente ESC/POS) sin reestructurar la app.
