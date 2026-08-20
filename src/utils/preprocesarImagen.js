/**
 * Preprocesamiento de imagen para mejorar la precisión del OCR.
 *
 * Las fotos de comprobantes (capturas de pantalla o fotos de recibos de
 * papel) suelen llegar con resolución baja, poco contraste o iluminación
 * despareja, lo que hace que Tesseract falle en reconocer texto. Este
 * módulo aplica, en un <canvas> (siempre en memoria, nunca se sube a
 * ningún servidor):
 *
 *  1. Escalado: si la imagen es pequeña, se agranda (Tesseract reconoce
 *     mucho mejor texto con una altura de línea de al menos ~30px).
 *  2. Escala de grises.
 *  3. Binarización con el método de Otsu: calcula automáticamente el
 *     umbral óptimo según el histograma de la imagen (a diferencia de un
 *     umbral fijo, se adapta a cada foto/captura).
 *
 * @param {File|Blob} archivo
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function preprocesarImagen(archivo) {
  const bitmap = await createImageBitmap(archivo);

  const ANCHO_MINIMO = 1800;
  // Fotos de cámara suelen venir en 3000-4000px+ de ancho: reconocerlas a
  // tamaño completo no mejora la precisión (ya se superó el mínimo para una
  // buena altura de línea) y sí hace mucho más lento tanto el preprocesado
  // como el reconocimiento. Se limita el ancho máximo para acelerar sin
  // perder calidad.
  const ANCHO_MAXIMO = 2200;
  let escala = 1;
  if (bitmap.width < ANCHO_MINIMO) escala = ANCHO_MINIMO / bitmap.width;
  else if (bitmap.width > ANCHO_MAXIMO) escala = ANCHO_MAXIMO / bitmap.width;
  const ancho = Math.round(bitmap.width * escala);
  const alto = Math.round(bitmap.height * escala);

  const canvas = document.createElement('canvas');
  canvas.width = ancho;
  canvas.height = alto;

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, ancho, alto);
  bitmap.close?.();

  const imageData = ctx.getImageData(0, 0, ancho, alto);
  const datos = imageData.data;
  const totalPixeles = ancho * alto;

  const grises = new Uint8ClampedArray(totalPixeles);
  const histograma = new Array(256).fill(0);

  for (let i = 0, p = 0; i < datos.length; i += 4, p++) {
    const gris = Math.round(datos[i] * 0.299 + datos[i + 1] * 0.587 + datos[i + 2] * 0.114);
    grises[p] = gris;
    histograma[gris]++;
  }

  const umbral = calcularUmbralOtsu(histograma, totalPixeles);

  // Tesseract reconoce mucho mejor texto oscuro sobre fondo claro. Muchos
  // comprobantes (p. ej. Yape) son al revés: texto claro sobre fondo de
  // color. Por eso no asumimos que "más claro que el umbral" = fondo:
  // contamos qué lado del umbral tiene más píxeles (el fondo, por ser la
  // mayor parte de la imagen) y ese lado pasa a blanco; el otro (el texto,
  // minoritario) pasa a negro.
  let pixelesClaros = 0;
  for (let nivel = umbral + 1; nivel < 256; nivel++) pixelesClaros += histograma[nivel];
  const fondoEsClaro = pixelesClaros >= totalPixeles / 2;

  for (let p = 0; p < totalPixeles; p++) {
    const esClaro = grises[p] > umbral;
    const esFondo = esClaro === fondoEsClaro;
    const valor = esFondo ? 255 : 0;
    const idx = p * 4;
    datos[idx] = datos[idx + 1] = datos[idx + 2] = valor;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Método de Otsu: encuentra el umbral que minimiza la varianza intra-clase
 * (o, equivalentemente, maximiza la varianza entre las dos clases "claro"
 * y "oscuro") a partir del histograma de niveles de gris.
 *
 * @param {number[]} histograma - 256 posiciones, conteo de píxeles por nivel
 * @param {number} totalPixeles
 * @returns {number} umbral óptimo (0-255)
 */
function calcularUmbralOtsu(histograma, totalPixeles) {
  let sumaTotal = 0;
  for (let nivel = 0; nivel < 256; nivel++) sumaTotal += nivel * histograma[nivel];

  let sumaFondo = 0;
  let pesoFondo = 0;
  let mejorVarianza = 0;
  let mejorUmbral = 127;

  for (let nivel = 0; nivel < 256; nivel++) {
    pesoFondo += histograma[nivel];
    if (pesoFondo === 0) continue;

    const pesoPrimerPlano = totalPixeles - pesoFondo;
    if (pesoPrimerPlano === 0) break;

    sumaFondo += nivel * histograma[nivel];

    const mediaFondo = sumaFondo / pesoFondo;
    const mediaPrimerPlano = (sumaTotal - sumaFondo) / pesoPrimerPlano;

    const varianzaEntreClases =
      pesoFondo * pesoPrimerPlano * (mediaFondo - mediaPrimerPlano) ** 2;

    if (varianzaEntreClases > mejorVarianza) {
      mejorVarianza = varianzaEntreClases;
      mejorUmbral = nivel;
    }
  }

  return mejorUmbral;
}
