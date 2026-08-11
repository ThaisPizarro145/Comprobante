import './Ticket.css';

const NO_DETECTADO = 'NO DETECTADO';

/**
 * Ticket imprimible. Solo se hace visible mediante CSS de impresión
 * (ver Ticket.css e index.css); en pantalla permanece oculto.
 * No se muestran campos que no fueron detectados por el OCR.
 */
export default function Ticket({ resultado }) {
  if (!resultado) return null;

  const { tipo, datos } = resultado;

  const filas = [
    ['MONTO', datos.monto],
    ['FECHA', datos.fecha],
    ['HORA', datos.hora],
    ['N° OPERACIÓN', datos.numeroOperacion],
    ['CÓDIGO', datos.codigoSeguridad],
    ['BANCO / PLATAFORMA', datos.bancoPlataforma],
  ].filter(([, valor]) => valor && valor !== NO_DETECTADO);

  return (
    <div id="ticket-impresion" className="ticket">
      <p className="ticket__separador">================================</p>
      <p className="ticket__titulo">COMPROBANTE DE PAGO</p>
      <p className="ticket__separador">================================</p>

      <p className="ticket__tipo">TIPO: {tipo}</p>

      {filas.map(([etiqueta, valor]) => (
        <p key={etiqueta} className="ticket__linea">
          {etiqueta}: {valor}
        </p>
      ))}

      <p className="ticket__separador">================================</p>
      <p className="ticket__titulo">PAGO VERIFICADO</p>
      <p className="ticket__separador">================================</p>
    </div>
  );
}
