import { useEffect, useRef, useState } from 'react';
import UploadComprobante from '../../components/UploadComprobante/UploadComprobante';
import PreviewComprobante from '../../components/PreviewComprobante/PreviewComprobante';
import ResultadoOCR from '../../components/ResultadoOCR/ResultadoOCR';
import Ticket from '../../components/Ticket/Ticket';
import { reconocerTexto } from '../../services/ocrService';
import { clasificarComprobante } from '../../utils/clasificarComprobante';
import { extraerDatos } from '../../utils/extraerDatos';
import './Inicio.css';

const LARGO_MINIMO_TEXTO_VALIDO = 15;

const MENSAJE_CALIDAD_BAJA =
  'No se pudo leer correctamente el comprobante. Intenta cargar una imagen más clara.';

const MENSAJE_ERROR_MOTOR =
  'No se pudo iniciar el motor de OCR. Verifica tu conexión e intenta nuevamente.';

export default function Inicio() {
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenUrl, setImagenUrl] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);

  const imagenUrlRef = useRef(null);
  imagenUrlRef.current = imagenUrl;

  // Libera el Object URL de la imagen al desmontar el componente, para no
  // retener la imagen en memoria más de lo necesario.
  useEffect(() => () => {
    if (imagenUrlRef.current) URL.revokeObjectURL(imagenUrlRef.current);
  }, []);

  const limpiarEstadoComprobante = () => {
    setCargando(false);
    setProgreso(0);
    setError(null);
    setResultado(null);
  };

  const manejarSeleccion = (archivo) => {
    if (imagenUrl) URL.revokeObjectURL(imagenUrl);
    setImagenFile(archivo);
    setImagenUrl(URL.createObjectURL(archivo));
    limpiarEstadoComprobante();
  };

  const manejarQuitarImagen = () => {
    if (imagenUrl) URL.revokeObjectURL(imagenUrl);
    setImagenFile(null);
    setImagenUrl(null);
    limpiarEstadoComprobante();
  };

  const manejarAnalizar = async () => {
    if (!imagenFile) return;

    setCargando(true);
    setError(null);
    setResultado(null);
    setProgreso(0);

    try {
      const textoOCR = await reconocerTexto(imagenFile, setProgreso);

      if (textoOCR.trim().length < LARGO_MINIMO_TEXTO_VALIDO) {
        setError(MENSAJE_CALIDAD_BAJA);
        return;
      }

      const tipo = clasificarComprobante(textoOCR);
      const datos = extraerDatos(textoOCR, tipo);

      setResultado({ tipo, datos, textoOCR });
    } catch (err) {
      // Se distingue un fallo real del motor OCR (red, carga de worker/wasm)
      // de "no se detectó texto", para no mostrarle al usuario un mensaje
      // de "imagen borrosa" cuando el problema es, por ejemplo, que no se
      // pudieron cargar los archivos del motor.
      console.error('Error al analizar el comprobante:', err);
      setError(MENSAJE_ERROR_MOTOR);
    } finally {
      setCargando(false);
    }
  };

  const manejarImprimir = () => {
    window.print();
  };

  const puedeAnalizar = Boolean(imagenFile) && !cargando;
  const puedeImprimir = Boolean(resultado) && !cargando;

  return (
    <div className="pagina-inicio">
      <div className="tarjeta no-imprimir">
        <header className="pagina-inicio__encabezado">
          <h1>LECTOR DE COMPROBANTES</h1>
        </header>

        <section className="pagina-inicio__carga">
          <UploadComprobante onImagenSeleccionada={manejarSeleccion} disabled={cargando} />
          <PreviewComprobante
            imagenUrl={imagenUrl}
            onQuitar={manejarQuitarImagen}
            deshabilitado={cargando}
          />
        </section>

        <section className="pagina-inicio__acciones">
          <button
            type="button"
            className="btn btn--secundario"
            onClick={manejarAnalizar}
            disabled={!puedeAnalizar}
          >
            ANALIZAR
          </button>
          <button
            type="button"
            className="btn btn--primario"
            onClick={manejarImprimir}
            disabled={!puedeImprimir}
          >
            IMPRIMIR
          </button>
        </section>

        <section className="pagina-inicio__resultado">
          <ResultadoOCR
            cargando={cargando}
            progreso={progreso}
            error={error}
            resultado={resultado}
          />
        </section>
      </div>

      <Ticket resultado={resultado} />
    </div>
  );
}
