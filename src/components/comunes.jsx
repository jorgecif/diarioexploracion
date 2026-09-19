import React, { useEffect, useRef, useState } from 'react';
import { nivelInfo, NIVELES, insigniaRutaSrc } from '../data/progresion.js';
import { estadoInfo } from '../state/logica.js';

/**
 * Parche oficial (hexágono) de una ruta en un nivel.
 * estado: 'logrado' (a color), 'parcial' (a color, atenuado), 'pendiente' (gris).
 */
export function ParcheRuta({ rutaId, nivel, estado = 'logrado', tam = 42, titulo }) {
  return (
    <img
      className={`parche parche-${estado}`}
      src={insigniaRutaSrc(rutaId, nivel)}
      alt={titulo || `${rutaId} · ${nivel}`}
      title={titulo}
      style={{ height: tam }}
      draggable={false}
    />
  );
}

// ---------- Chips y distintivos ----------

export function NivelChip({ nivel, grande }) {
  const info = nivelInfo(nivel);
  if (!info) return null;
  return (
    <span
      className={`chip ${grande ? 'chip-grande' : ''}`}
      style={{ background: info.colorSuave, color: info.colorTexto, borderColor: info.color }}
    >
      {info.icono} {info.nombre}
    </span>
  );
}

export function EstadoChip({ estado }) {
  const info = estadoInfo(estado);
  return (
    <span className="chip chip-estado" style={{ borderColor: info.color, color: info.color }}>
      {info.icono} {info.nombre}
    </span>
  );
}

export function Avatar({ usuario, tam = 40 }) {
  return (
    <span
      className="avatar"
      style={{ width: tam, height: tam, fontSize: tam * 0.55 }}
      aria-hidden="true"
    >
      {usuario?.avatar || (usuario?.rol === 'jefe' ? '🧭' : '🙂')}
    </span>
  );
}

// ---------- Progreso por ruta (los 3 escalones) ----------

export function EscalonesRuta({ progreso, rutaId, compacto }) {
  // progreso: { nivelAlcanzado, conquistadosPorNivel }
  const tam = compacto ? 20 : 40;
  return (
    <div className={`escalones ${compacto ? 'escalones-compacto' : ''}`}>
      {NIVELES.map((n) => {
        const cuenta = progreso.conquistadosPorNivel[n.id];
        const estado = cuenta >= 2 ? 'logrado' : cuenta === 1 ? 'parcial' : 'pendiente';
        return (
          <span key={n.id} className="escalon-envoltura">
            <ParcheRuta
              rutaId={rutaId}
              nivel={n.id}
              estado={estado}
              tam={tam}
              titulo={`${n.nombre}: ${cuenta}/2 territorios conquistados`}
            />
            {!compacto && estado === 'parcial' && <span className="escalon-conteo">1/2</span>}
          </span>
        );
      })}
    </div>
  );
}

// ---------- Modal ----------

export function Modal({ abierto, onCerrar, titulo, children, ancho }) {
  useEffect(() => {
    if (!abierto) return;
    const esc = (e) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [abierto, onCerrar]);

  if (!abierto) return null;
  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div
        className="modal"
        style={ancho ? { maxWidth: ancho } : {}}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-cabecera">
          <h3>{titulo}</h3>
          <button className="btn-icono" onClick={onCerrar} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className="modal-cuerpo">{children}</div>
      </div>
    </div>
  );
}

// ---------- Área de texto con dictado por voz ----------

const Reconocimiento =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export const DICTADO_DISPONIBLE = Boolean(Reconocimiento);

export function AreaTextoVoz({ valor, onCambio, placeholder, filas = 4, id }) {
  const [escuchando, setEscuchando] = useState(false);
  const [interino, setInterino] = useState('');
  const recRef = useRef(null);
  const valorRef = useRef(valor);
  valorRef.current = valor;

  useEffect(() => () => detener(), []); // limpiar al desmontar

  function detener() {
    if (recRef.current) {
      recRef.current.onresult = null;
      recRef.current.onend = null;
      recRef.current.onerror = null;
      try {
        recRef.current.stop();
      } catch {
        /* ya detenido */
      }
      recRef.current = null;
    }
    setEscuchando(false);
    setInterino('');
  }

  function alternarDictado() {
    if (escuchando) {
      detener();
      return;
    }
    if (!Reconocimiento) return;
    const rec = new Reconocimiento();
    rec.lang = 'es-CO';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (evento) => {
      let finalNuevo = '';
      let interinoNuevo = '';
      for (let i = evento.resultIndex; i < evento.results.length; i++) {
        const res = evento.results[i];
        if (res.isFinal) finalNuevo += res[0].transcript;
        else interinoNuevo += res[0].transcript;
      }
      if (finalNuevo) {
        const base = valorRef.current ? valorRef.current.replace(/\s+$/, '') + ' ' : '';
        onCambio(base + finalNuevo.trim());
      }
      setInterino(interinoNuevo);
    };
    rec.onerror = (e) => {
      console.warn('Error de dictado:', e.error);
      detener();
    };
    rec.onend = () => {
      // El navegador a veces corta solo; reflejar el estado real.
      setEscuchando(false);
      setInterino('');
      recRef.current = null;
    };
    recRef.current = rec;
    rec.start();
    setEscuchando(true);
  }

  return (
    <div className="area-voz">
      <textarea
        id={id}
        rows={filas}
        value={valor}
        placeholder={placeholder}
        onChange={(e) => onCambio(e.target.value)}
      />
      {interino && <div className="voz-interino">🎙️ {interino}…</div>}
      <div className="area-voz-pie">
        {DICTADO_DISPONIBLE ? (
          <button
            type="button"
            className={`btn-voz ${escuchando ? 'btn-voz-activo' : ''}`}
            onClick={alternarDictado}
            title={escuchando ? 'Detener dictado' : 'Dictar con el micrófono'}
          >
            {escuchando ? '⏹ Detener dictado' : '🎙️ Dictar'}
          </button>
        ) : (
          <span className="voz-no-disponible">
            El dictado por voz no está disponible en este navegador (prueba con Chrome o Edge).
          </span>
        )}
        {escuchando && <span className="voz-pulso">Escuchando…</span>}
      </div>
    </div>
  );
}

// ---------- Otros ----------

export function BarraProgreso({ valor, total, color }) {
  const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
  return (
    <div className="barra">
      <div className="barra-relleno" style={{ width: `${pct}%`, background: color || 'var(--verde)' }} />
    </div>
  );
}

export function Vacio({ icono = '🌲', titulo, texto, children }) {
  return (
    <div className="vacio">
      <div className="vacio-icono">{icono}</div>
      <h3>{titulo}</h3>
      {texto && <p>{texto}</p>}
      {children}
    </div>
  );
}
