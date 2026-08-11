/**
 * Utilidades de normalización de texto OCR.
 *
 * IMPORTANTE: estas funciones nunca deben usarse para modificar el texto
 * que se muestra al usuario. Su único propósito es producir una versión
 * "amigable para búsqueda" que tolere diferencias de mayúsculas, tildes,
 * espacios y saltos de línea propias del OCR.
 */

/**
 * Normaliza texto para comparación tolerante (clasificación / búsqueda de
 * palabras clave). Minúsculas, sin tildes/diacríticos, sin puntuación,
 * espacios/saltos de línea colapsados a un solo espacio.
 *
 * @param {string} texto
 * @returns {string}
 */
export function normalizarTexto(texto) {
  if (!texto) return '';

  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita tildes/diacríticos
    .toLowerCase()
    .replace(/[^a-z0-9\s./°]/g, ' ') // quita puntuación innecesaria, conserva . / ° (útiles en montos y "N°")
    .replace(/\s+/g, ' ') // colapsa espacios múltiples y saltos de línea
    .trim();
}

/**
 * Verifica si el texto normalizado contiene una frase clave (también
 * normalizada), tolerando diferencias de mayúsculas/tildes/espacios.
 *
 * @param {string} textoNormalizado - resultado de normalizarTexto()
 * @param {string} frase - frase clave en su forma original (se normaliza internamente)
 * @returns {boolean}
 */
export function contienePalabraClave(textoNormalizado, frase) {
  return textoNormalizado.includes(normalizarTexto(frase));
}
