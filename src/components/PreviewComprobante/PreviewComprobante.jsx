import './PreviewComprobante.css';

/**
 * Vista previa de la imagen cargada. La imagen vive únicamente en memoria
 * (Object URL sobre el File original) mientras dura la sesión de trabajo.
 */
export default function PreviewComprobante({ imagenUrl, onQuitar, deshabilitado }) {
  if (!imagenUrl) {
    return (
      <div className="preview-comprobante preview-comprobante--vacio">
        <span>Sin imagen cargada</span>
      </div>
    );
  }

  return (
    <div className="preview-comprobante">
      <img
        src={imagenUrl}
        alt="Vista previa del comprobante"
        className="preview-comprobante__imagen"
      />
      <button
        type="button"
        className="btn btn--texto preview-comprobante__quitar"
        onClick={onQuitar}
        disabled={deshabilitado}
      >
        Quitar imagen
      </button>
    </div>
  );
}
