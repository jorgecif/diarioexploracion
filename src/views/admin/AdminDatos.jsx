import React from 'react';
import { useApp } from '../../state/store.jsx';

/** Administración: información de los datos y copias de seguridad (Supabase). */
export default function AdminDatos() {
  const { state } = useApp();

  function exportar() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progresion-scout-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const conteos = {
    tropas: state.tropas.length,
    usuarios: state.usuarios.length,
    trabajos: state.trabajos.length,
  };

  return (
    <div>
      <h2 style={{ color: 'var(--verde)' }}>💾 Datos de la aplicación</h2>

      <div className="tarjeta">
        <h3>Estado actual</h3>
        <p className="sin-margen">
          🏕️ {conteos.tropas} tropas · 👥 {conteos.usuarios} cuentas · 🚩 {conteos.trabajos} conquistas
        </p>
        <p className="pequeno suave mt sin-margen">
          Los datos viven en tu proyecto de <strong>Supabase</strong> y se sincronizan en tiempo
          real entre los dispositivos de scouts y dirigentes.
        </p>
      </div>

      <div className="tarjeta">
        <h3>Copia de seguridad</h3>
        <p className="pequeno suave">
          Descarga una copia en JSON de todo lo visible (tropas, cuentas sin contraseñas y
          conquistas). Para respaldos completos y restauración, Supabase también ofrece copias
          automáticas de la base de datos en su panel.
        </p>
        <div className="fila-botones" style={{ marginTop: 4 }}>
          <button className="btn btn-secundario" onClick={exportar}>
            ⬇️ Descargar copia (JSON)
          </button>
        </div>
      </div>

      <div className="tarjeta">
        <h3>Gestión avanzada</h3>
        <p className="pequeno suave sin-margen">
          Las operaciones masivas (vaciar datos, restaurar respaldos, ver la base de datos) se
          hacen desde el panel de Supabase: <strong>supabase.com → tu proyecto → Table Editor /
          Database → Backups</strong>. Las cuentas están en <strong>Authentication → Users</strong>.
        </p>
      </div>
    </div>
  );
}
