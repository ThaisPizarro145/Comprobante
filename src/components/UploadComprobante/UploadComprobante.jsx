import { useRef } from 'react';
import './UploadComprobante.css';

/**
 * Zona de carga de imagen del comprobante. Acepta selección desde archivo
 * (funciona igual en PC, laptop, tablet y celular; en celular el navegador
 * muestra su selector nativo, que incluye tanto la galería como la cámara).
 */
export default function UploadComprobante({ onImagenSeleccionada, disabled }) {
  const inputRef = useRef(null);

  const manejarCambio = (evento) => {
    const archivo = evento.target.files?.[0];
    if (archivo) {
      onImagenSeleccionada(archivo);
    }
    // Permite volver a seleccionar el mismo archivo si el usuario lo desea.
    evento.target.value = '';
  };

  return (
    <div className="upload-comprobante">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={manejarCambio}
        disabled={disabled}
        className="upload-comprobante__input"
        id="input-comprobante"
      />
      <button
        type="button"
        className="btn btn--primario upload-comprobante__boton"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
      >
        Seleccionar comprobante
      </button>
    </div>
  );
}
