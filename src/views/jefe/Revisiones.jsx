import React from 'react';
import { useApp } from '../../state/store.jsx';
import { useNav, useSesion } from '../../state/nav.jsx';
import { getTerritorio, getRutaDeTerritorio } from '../../data/progresion.js';
import { revisionesPendientes, usuario as buscarUsuario, fechaCorta } from '../../state/logica.js';
import { Avatar, NivelChip, Vacio } from '../../components/comunes.jsx';

export default function Revisiones() {
  const { state } = useApp();
  const { navegar } = useNav();
  const { usuario } = useSesion();

  const pendientes = revisionesPendientes(state, usuario.tropaId)
    .slice()
    .sort((a, b) => (a.enviadoEn || '').localeCompare(b.enviadoEn || ''));

  if (pendientes.length === 0) {
    return (
      <Vacio
        icono="✅"
        titulo="¡Todo revisado!"
        texto="No hay conquistas esperando revisión. Cuando un scout envíe un territorio, aparecerá aquí."
      />
    );
  }

  return (
    <div>
      <h2 style={{ color: 'var(--verde)' }}>
        ⏳ Conquistas por revisar ({pendientes.length})
      </h2>
      <p className="suave pequeno">Las más antiguas primero.</p>
      {pendientes.map((t) => {
        const territorio = getTerritorio(t.territorioId);
        const ruta = getRutaDeTerritorio(t.territorioId);
        const scout = buscarUsuario(state, t.scoutId);
        return (
          <div
            key={t.id}
            className="tarjeta tarjeta-clic"
            onClick={() => navegar({ v: 'trabajo', trabajoId: t.id, desde: 'revisiones' })}
          >
            <div className="fila-separada">
              <div className="fila">
                <Avatar usuario={scout} tam={40} />
                <div>
                  <strong>{scout?.nombre}</strong>
                  <div className="pequeno suave">
                    {territorio.icono} {territorio.nombre} · {ruta.nombre}
                  </div>
                </div>
              </div>
              <div className="centrado">
                <NivelChip nivel={t.nivel} />
                <div className="pequeno suave">enviado el {fechaCorta(t.enviadoEn)}</div>
              </div>
            </div>
            <div className="pequeno suave mt">
              {t.avances.length} avance{t.avances.length === 1 ? '' : 's'} registrados · toca para revisar →
            </div>
          </div>
        );
      })}
    </div>
  );
}
