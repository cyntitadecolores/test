import React from "react";
import "./PaginasE.css";
import NavCub from "../componentes/navegacionE";

function InicioE() {
  return (
    <div className="main">
      <NavCub />

{/* Recordatorio final */}
        <div className="reminder-box">
          <h3>Si eres de primer semestre</h3>
          <p>Recuerda que necesitas cursar tu <strong>Semana Tec de Introducción al Servicio Social</strong> antes de poder iniciar tus horas.</p>
        </div>
        <div className="dashboard-content">
          {/* Sección de Periodos */}
          <div className="widgets-periodos">
            <h2 className="nontitle">Opciones de Servicio Social</h2>
            <div className="combo">
              <h3>Combo 1</h3>
              <div className="periodo-widget">Periodo 1<br />11 Feb - 13 Mar<br />60 HORAS</div>
              <div className="periodo-widget">Periodo 2<br />24 Mar - 30 Abr<br />60 HORAS</div>
              <div className="periodo-widget">Periodo 3<br />12 May - 12 Jun<br />60 HORAS</div>
            </div>
            <div className="combo">
              <h3>Combo 2</h3>
              <div className="periodo-widget large">Periodo 4<br />11 Feb - 30 Abr<br />120 HORAS</div>
              <div className="periodo-widget">Periodo 3<br />12 May - 12 Jun<br />60 HORAS</div>
            </div>
            <div className="combo">
              <h3>Combo 3</h3>
              <div className="periodo-widget">Periodo 1<br />11 Feb - 13 Mar<br />60 HORAS</div>
              <div className="periodo-widget large">Periodo 5<br />24 Mar - 12 Jun<br />120 HORAS</div>
            </div>
            <div className="combo">
              <h3>Combo 4</h3>
              <div className="periodo-widget full">Periodo 6<br />11 Feb - 12 Jun<br />180 HORAS</div>
            </div>
          </div>

          {/* Sección derecha de información */}
          <div className="widgets-info">
            <div className="info-box">
              <h3>🎓 Requisito de Graduación</h3>
              <p>Debes completar <strong>480 horas</strong> de servicio social para poder graduarte.</p>
            </div>

            <div className="info-box">
              <h3>Consulta tu historial</h3>
              <ol>
                <li>Ingresa a <strong>Mi Tec</strong>.</li>
                <li>Busca la sección <strong>Servicio Social</strong>.</li>
                <li>Haz clic en <strong>Mi historial de Servicio Social</strong>.</li>
              </ol>
            </div>
          </div>
        </div>

        
      </div>
  );
}

export default InicioE;