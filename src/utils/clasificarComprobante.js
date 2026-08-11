import { normalizarTexto, contienePalabraClave } from './normalizarTexto';

/**
 * Tipos de comprobante soportados. Agregar un nuevo tipo NO requiere tocar
 * el resto de la aplicación: basta con añadir una entrada a REGLAS_CLASIFICACION
 * (y opcionalmente un extractor de datos específico en extraerDatos.js).
 */
export const TIPO_COMPROBANTE = {
  YAPE: 'YAPE',
  DEPOSITO_BCP: 'DEPÓSITO BCP',
  TRANSFERENCIA: 'TRANSFERENCIA',
  DESCONOCIDO: 'DESCONOCIDO',
};

/**
 * Reglas de clasificación, en orden de prioridad (la primera que haga match
 * gana). Cada regla recibe el texto ya normalizado (minúsculas, sin tildes,
 * sin puntuación, espacios colapsados) y devuelve true/false.
 *
 * Para agregar un nuevo tipo (PLIN, INTERBANK, BBVA, etc.) simplemente se
 * agrega un nuevo objeto { tipo, test } en la posición de prioridad deseada.
 */
export const REGLAS_CLASIFICACION = [
  {
    tipo: TIPO_COMPROBANTE.YAPE,
    test: (textoNormalizado) =>
      contienePalabraClave(textoNormalizado, '¡Yapeaste!') ||
      contienePalabraClave(textoNormalizado, 'Yapeaste') ||
      contienePalabraClave(textoNormalizado, 'CÓDIGO DE SEGURIDAD'),
  },
  {
    tipo: TIPO_COMPROBANTE.DEPOSITO_BCP,
    test: (textoNormalizado) =>
      contienePalabraClave(textoNormalizado, 'DEPÓSITO') &&
      contienePalabraClave(textoNormalizado, 'CTA. AHORROS'),
  },
  {
    tipo: TIPO_COMPROBANTE.TRANSFERENCIA,
    test: (textoNormalizado) => contienePalabraClave(textoNormalizado, 'TRANSFERENCIA'),
  },
];

/**
 * Clasifica un comprobante a partir del texto crudo obtenido por OCR.
 *
 * @param {string} textoOCR - texto original extraído por OCR (sin modificar)
 * @returns {string} uno de los valores de TIPO_COMPROBANTE
 */
export function clasificarComprobante(textoOCR) {
  const textoNormalizado = normalizarTexto(textoOCR);

  for (const regla of REGLAS_CLASIFICACION) {
    if (regla.test(textoNormalizado)) {
      return regla.tipo;
    }
  }

  return TIPO_COMPROBANTE.DESCONOCIDO;
}
