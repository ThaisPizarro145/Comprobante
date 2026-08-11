import { createWorker } from 'tesseract.js';

/**
 * Servicio de OCR 100% del lado del cliente (navegador), usando Tesseract.js.
 *
 * Nota de arquitectura: Tesseract.js ejecuta el reconocimiento de texto
 * dentro del navegador (WASM), por lo que la imagen del comprobante NUNCA
 * se envía a ningún servidor. La única descarga externa es la de los
 * archivos estáticos del motor (wasm + datos de idioma "spa"), que el
 * navegador cachea después del primer uso.
 *
 * Se crea y termina un worker por cada análisis (en vez de mantenerlo vivo)
 * para garantizar que no quede memoria/estado de un comprobante anterior
 * retenida entre análisis, en línea con el requisito de no persistencia.
 *
 * @param {File|Blob|string} imagen
 * @param {(progreso:number) => void} [onProgress] - 0 a 100
 * @returns {Promise<string>} texto crudo detectado por el OCR
 */
export async function reconocerTexto(imagen, onProgress) {
  const worker = await createWorker('spa', 1, {
    logger: (info) => {
      if (onProgress && info.status === 'recognizing text') {
        onProgress(Math.round(info.progress * 100));
      }
    },
  });

  try {
    const {
      data: { text },
    } = await worker.recognize(imagen);
    return text ?? '';
  } finally {
    await worker.terminate();
  }
}
