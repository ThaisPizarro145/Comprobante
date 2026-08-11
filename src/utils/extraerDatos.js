import { TIPO_COMPROBANTE } from './clasificarComprobante';

export const NO_DETECTADO = 'NO DETECTADO';

/**
 * Cada extractor recibe el texto ORIGINAL del OCR (sin normalizar, para no
 * perder dígitos ni símbolos) y devuelve un string ya formateado o
 * NO_DETECTADO si no encontró coincidencia. No se inventa información.
 */

function extraerMonto(texto) {
  // S/ 25.00 | S/.25.00 | S/ 1,250.50
  const match = texto.match(/S\s*\/\.?\s*([\d]{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/i);
  if (!match) return NO_DETECTADO;
  return `S/ ${match[1].replace(',', '.')}`;
}

function extraerFecha(texto) {
  // dd/mm/yyyy | dd-mm-yyyy | dd/mm/yy
  const match = texto.match(/\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/);
  return match ? match[1] : NO_DETECTADO;
}

function extraerHora(texto) {
  // hh:mm o hh:mm:ss, opcionalmente con am/pm
  const match = texto.match(/\b(\d{1,2}:\d{2}(?::\d{2})?\s?(?:[ap]\.?\s?m\.?)?)\b/i);
  return match ? match[1].trim() : NO_DETECTADO;
}

function extraerCodigoSeguridad(texto) {
  const match = texto.match(/C[OÓ]DIGO\s+DE\s+SEGURIDAD\s*:?\s*([A-Z0-9]{3,10})/i);
  return match ? match[1].toUpperCase() : NO_DETECTADO;
}

function extraerNumeroOperacion(texto) {
  const match = texto.match(
    /(?:N(?:[°ºRO.]|[UÚ]MERO)*\s*DE\s*OPERACI[OÓ]N|OPERACI[OÓ]N\s*N[°ºRO.]*|C[OÓ]DIGO\s*DE\s*OPERACI[OÓ]N|NRO\.?\s*OPERACI[OÓ]N)\s*:?\s*([A-Z0-9-]{4,20})/i,
  );
  return match ? match[1].toUpperCase() : NO_DETECTADO;
}

function extraerBancoPlataforma(texto, tipo) {
  if (tipo === TIPO_COMPROBANTE.YAPE) return 'Yape';

  const bancos = [
    { patron: /BCP|BANCO\s+DE\s+CR[EÉ]DITO/i, nombre: 'BCP' },
    { patron: /INTERBANK/i, nombre: 'Interbank' },
    { patron: /BBVA/i, nombre: 'BBVA' },
    { patron: /SCOTIABANK/i, nombre: 'Scotiabank' },
    { patron: /BANBIF/i, nombre: 'BanBif' },
    { patron: /PICHINCHA/i, nombre: 'Pichincha' },
  ];

  for (const banco of bancos) {
    if (banco.patron.test(texto)) return banco.nombre;
  }

  return NO_DETECTADO;
}

/**
 * Extrae los datos relevantes de un comprobante a partir del texto OCR
 * (original, sin normalizar) y su tipo ya clasificado.
 *
 * @param {string} textoOCR
 * @param {string} tipo - valor de TIPO_COMPROBANTE
 * @returns {{monto:string, fecha:string, hora:string, codigoSeguridad:string, numeroOperacion:string, bancoPlataforma:string}}
 */
export function extraerDatos(textoOCR, tipo) {
  const texto = textoOCR || '';

  return {
    monto: extraerMonto(texto),
    fecha: extraerFecha(texto),
    hora: extraerHora(texto),
    codigoSeguridad: extraerCodigoSeguridad(texto),
    numeroOperacion: extraerNumeroOperacion(texto),
    bancoPlataforma: extraerBancoPlataforma(texto, tipo),
  };
}
