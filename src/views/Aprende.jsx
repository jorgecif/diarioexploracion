import React from 'react';
import { RUTAS, NIVELES, INSIGNIAS, ROLES_DIRIGENTE, TERRITORIOS_POR_NIVEL, nivelInfo } from '../data/progresion.js';
import { ParcheRuta } from '../components/comunes.jsx';
import { useNav, useSesion } from '../state/nav.jsx';

export default function Aprende() {
  const { navegar } = useNav();
  const { usuario } = useSesion();
  const esScout = usuario.rol === 'scout';

  return (
    <div>
      <h2 style={{ color: 'var(--verde)' }}>📖 ¿Cómo funciona tu progresión?</h2>
      <div className="tarjeta">
        <img
          className="logo-flotante"
          src={`${import.meta.env.BASE_URL}marca/gran-juego.png`}
          alt="El Gran Juego para la Vida"
          draggable={false}
        />
        <p>
          Tu progresión es un <strong>viaje de exploración</strong>. Hay <strong>6 Rutas de
          crecimiento</strong> y cada una tiene <strong>territorios</strong> (competencias) por
          conquistar. Tú eliges qué territorios trabajar, planeas la conquista con tu dirigente,
          registras tus avances en este diario y, cuando estés listo, envías tu conquista a
          revisión.
        </p>
        <ol className="detalle-lista">
          <li><strong>Explora</strong> las rutas y elige un territorio.</li>
          <li><strong>Planea</strong> cómo lo vas a conquistar y acuérdalo con tu dirigente.</li>
          <li><strong>Regístralo</strong>: escribe (o dicta 🎙️) tus avances en el diario.</li>
          <li><strong>Envía a revisión</strong> cuando lo hayas logrado.</li>
          <li><strong>Recibe realimentación</strong>: tu dirigente aprueba o te sugiere ajustes.</li>
          <li>Con {TERRITORIOS_POR_NIVEL} territorios conquistados del mismo nivel, ¡la ruta sube de nivel!</li>
        </ol>
      </div>

      <div className="seccion-titulo">
        <h2>🗺️ Las 6 Rutas de crecimiento</h2>
      </div>
      <div className="grid-2">
        {RUTAS.map((r) => (
          <div
            key={r.id}
            className="tarjeta tarjeta-clic sin-margen"
            onClick={() => (esScout ? navegar({ v: 'explorar', rutaId: r.id }) : null)}
          >
            <div className="tarjeta-cabecera">
              <span className="icono-grande" style={{ background: r.colorSuave }}>
                {r.icono}
              </span>
              <div>
                <h3 className="sin-margen">{r.nombre}</h3>
                <p className="suave pequeno sin-margen">{r.lema}</p>
              </div>
            </div>
            <p className="pequeno mt sin-margen">{r.descripcion}</p>
            <div className="fila-separada mt">
              <span className="fila" style={{ gap: 5 }}>
                {NIVELES.map((n) => (
                  <ParcheRuta key={n.id} rutaId={r.id} nivel={n.id} tam={38} titulo={`Insignia ${r.nombre} · ${n.nombre}`} />
                ))}
              </span>
              <span className="suave pequeno">
                {r.territorios.length} territorios · {r.area}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="seccion-titulo">
        <h2>🎚️ Los 3 niveles de cada Ruta</h2>
      </div>
      <div className="grid-3">
        {NIVELES.map((n) => (
          <div key={n.id} className="tarjeta sin-margen" style={{ borderTop: `5px solid ${n.color}` }}>
            <div className="fila">
              <ParcheRuta rutaId="lazos" nivel={n.id} tam={46} titulo={`Nivel ${n.nombre} (${n.tono})`} />
              <div>
                <h3 className="sin-margen">{n.nombre}</h3>
                <p className="pequeno suave sin-margen">
                  {n.tono} · {n.lema}
                </p>
              </div>
            </div>
            <p className="pequeno mt sin-margen">{n.descripcion}</p>
          </div>
        ))}
      </div>
      <div className="nota mt">
        💡 Una Ruta alcanza un nivel cuando conquistas al menos{' '}
        <strong>{TERRITORIOS_POR_NIVEL} territorios de esa Ruta en ese nivel</strong>.
      </div>

      <div className="seccion-titulo">
        <h2>🎖️ Las 4 insignias de progresión</h2>
      </div>
      {INSIGNIAS.map((i) => (
        <div key={i.id} className="tarjeta">
          <div className="tarjeta-cabecera">
            {i.imagen ? (
              <img className="fase-imagen" src={i.imagen} alt={i.nombre} draggable={false} />
            ) : (
              <span className="icono-grande" style={{ background: '#f6f2e8', border: `2.5px solid ${i.color}`, borderRadius: '50%' }}>
                {i.icono}
              </span>
            )}
            <div>
              <h3 className="sin-margen">
                {i.nombre} {i.esMaxima && <span className="chip" style={{ borderColor: i.color, color: i.color }}>Insignia máxima</span>}
              </h3>
              <p className="pequeno suave sin-margen">{i.requisitoTexto}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="seccion-titulo">
        <h2>🧑‍🏫 El rol de tu dirigente en cada nivel</h2>
      </div>
      <div className="grid-3">
        {ROLES_DIRIGENTE.map((r) => {
          const n = nivelInfo(r.nivel);
          return (
            <div key={r.nivel} className="tarjeta sin-margen" style={{ borderTop: `5px solid ${n.color}` }}>
              <p className="pequeno suave sin-margen">Nivel {n.nombre}</p>
              <h3 className="sin-margen">
                {r.icono} {r.rol}
              </h3>
              <p className="pequeno mt">{r.estilo}</p>
              <p className="pequeno suave sin-margen">{r.acciones}</p>
            </div>
          );
        })}
      </div>

      <div className="pie-marca">
        <img src={`${import.meta.env.BASE_URL}marca/rama-scout.png`} alt="Rama Scout · Scouts de Colombia" draggable={false} />
        <img src={`${import.meta.env.BASE_URL}marca/scouts-colombia.png`} alt="Scouts de Colombia" draggable={false} />
      </div>
      <p className="centrado pequeno suave">Asociación Scouts de Colombia · El Gran Juego para la Vida</p>
      <div style={{ height: 12 }} />
    </div>
  );
}
