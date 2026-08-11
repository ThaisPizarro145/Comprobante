import { useState } from 'react';
import { TIPO_COMPROBANTE } from '../../utils/clasificarComprobante';
import './ResultadoOCR.css';

const ETIQUETAS_DATOS = [
  ['monto', 'Monto'],
  ['fecha', 'Fecha'],
  ['hora', 'Hora'],
  ['numeroOperacion', 'N° Operación'],
  ['codigoSeguridad', 'Código de seguridad'],
  ['bancoPlataforma', 'Banco / Plataforma'],
];

export default function ResultadoOCR({ cargando, progreso, error, resultado }) {
  const [mostrarTexto, setMostrarTexto] = useState(false);

  if (cargando) {
    return (
      <div className="resultado-ocr resultado-ocr--cargando">
        <div className="spinner" aria-hidden="true" />
        <p>Analizando comprobante… {progreso}%</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="resultado-ocr resultado-ocr--error" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  if (!resultado) {
    return null;
  }

  const { tipo, datos, textoOCR } = resultado;
  const esDesconocido = tipo === TIPO_COMPROBANTE.DESCONOCIDO;

  return (
    <div className="resultado-ocr">
      {esDesconocido && (
        <p className="resultado-ocr__aviso" role="alert">
          No se pudo identificar el comprobante. Verifica la imagen e intenta nuevamente.
        </p>
      )}

      <div className={`resultado-ocr__tipo resultado-ocr__tipo--${esDesconocido ? 'desconocido' : 'ok'}`}>
        <span className="resultado-ocr__tipo-etiqueta">Tipo de comprobante</span>
        <span className="resultado-ocr__tipo-valor">{tipo}</span>
      </div>

      <dl className="resultado-ocr__datos">
        {ETIQUETAS_DATOS.map(([clave, etiqueta]) => (
          <div className="resultado-ocr__dato" key={clave}>
            <dt>{etiqueta}</dt>
            <dd className={datos[clave] === 'NO DETECTADO' ? 'resultado-ocr__no-detectado' : ''}>
              {datos[clave]}
            </dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        className="btn btn--texto"
        onClick={() => setMostrarTexto((valor) => !valor)}
      >
        {mostrarTexto ? 'Ocultar texto OCR detectado' : 'Ver texto OCR detectado'}
      </button>

      {mostrarTexto && <pre className="resultado-ocr__texto-crudo">{textoOCR}</pre>}
    </div>
  );
}
