import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavCub from '../componentes/navegacion';
import './tablasA.css';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';


function SociosAprobados() {
  const [socios, setSocios] = useState([]);
  const [filteredText, setFilteredText] = useState('');
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);

  

  useEffect(() => {
    axios.get('http://localhost:5003/socioaceptados')
      .then(response => setSocios(response.data))
      .catch(error => console.error('Error al obtener socios:', error));
  }, []);

  const exportarAExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('sociosAceptados');

  const columnas = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'correo', header: 'Correo' },
    { key: 'tipo_socio', header: 'Tipo de Socio' },
    { key: 'telefono_osf', header: 'Teléfono' },
    { key: 'nombre_socio', header: 'Nombre del Estudiante' },
    { key: 'matricula', header: 'Matrícula' },
    { key: 'semestre_acreditado', header: 'Semestre Acreditado' },
    { key: 'ine', header: 'INE' },
    { key: 'id_carrera', header: 'ID Carrera' },
    { key: 'redes_sociales', header: 'Redes Sociales' },
    { key: 'vision', header: 'Visión' },
    { key: 'mision', header: 'Misión' },
    { key: 'objetivos', header: 'Objetivos' },
    { key: 'poblacion_osf', header: 'Población' },
    { key: 'num_beneficiarios_osf', header: 'Número de Beneficiarios' },
    { key: 'nombre_representante', header: 'Nombre del Representante' },
    { key: 'puesto_representante', header: 'Puesto del Representante' },
    { key: 'direccion_horario', header: 'Dirección y Horario' },
    { key: 'notificaciones', header: 'Notificaciones' },
    { key: 'nota', header: 'Nota' },
  ];

  worksheet.columns = columnas.map(col => ({
    header: col.header,
    key: col.key,
    width: 30,
  }));

  sociosFiltrados.forEach(socio => {
    const fila = {
      nombre: socio.nombre_osf || socio.detalles?.nombre_socio || '',
      correo: socio.correo || '',
      tipo_socio: socio.tipo_socio || '',
      telefono_osf: socio.telefono_osf || '',
      nombre_socio: socio.detalles?.nombre_socio || '',
      matricula: socio.detalles?.matricula || '',
      semestre_acreditado: socio.detalles?.semestre_acreditado || '',
      ine: socio.detalles?.ine || '',
      id_carrera: socio.detalles?.id_carrera || '',
      redes_sociales: socio.redes_sociales || '',
      vision: socio.vision || '',
      mision: socio.mision || '',
      objetivos: socio.objetivos || '',
      poblacion_osf: socio.poblacion_osf || '',
      num_beneficiarios_osf: socio.num_beneficiarios_osf || '',
      nombre_representante: socio.nombre_representante || '',
      puesto_representante: socio.puesto_representante || '',
      direccion_horario: socio.direccion_horario || '',
      notificaciones: socio.notificaciones ? 'Sí' : 'No',
      nota: socio.nota || '',
    };
    worksheet.addRow(fila);
  });

  const headerRow = worksheet.getRow(1);
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2F75B5' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, 'sociosAceptados.xlsx');
};



  const sociosFiltrados = socios.filter(socio =>
    Object.values(socio).some(valor =>
      valor && valor.toString().toLowerCase().includes(filteredText.toLowerCase())
    )
  );

  const handleVerMas = (id) => {
    axios.get(`http://localhost:5003/socio/${id}`)
      .then(response => {
        setSocioSeleccionado(response.data);
        console.log("Socio seleccionado:", response.data);
      })
      .catch(error => console.error('Error al obtener info del socio:', error));
  };

  const cerrarInfo = () => setSocioSeleccionado(null);

  return (
    <div className="main">
      <NavCub />
      <h1 className="titulo">Socios que han sido aprobados</h1>

       <button onClick={exportarAExcel} className="bttn-excel">
            Descargar Excel
      </button>

      {!socioSeleccionado && (
        <div className="tabla-container">
          <div className="buscador">
            <label>Buscar: </label>
            <input
              type="text"
              value={filteredText}
              onChange={(e) => setFilteredText(e.target.value)}
              className="input-busqueda"
              placeholder="Buscar socio..."
            />
          </div>
          <table className="tabla-proyectos">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Tipo de Socio</th>
                <th>Ver más</th>
              </tr>
            </thead>
            <tbody>
              {sociosFiltrados.map((socio) => (
                <tr key={socio.id_socio}>
                  <td>{socio.nombre_osf || socio.detalles?.nombre_socio}</td>

                  <td>{socio.correo}</td>
                  <td><span className="badge aprobado">{socio.tipo_socio}</span></td>
                  <td>
                    <button className="ver-mas-link" onClick={() => handleVerMas(socio.id_socio)}>
                      Ver más
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {socioSeleccionado && (
        <div className="modal">
          <div className="modal-content">
            <h2>Detalles del Socio</h2>

            

            {socioSeleccionado.tipo_socio === 'Estudiante' && socioSeleccionado.detalles && (
              <div className="detalle-estudiante">
                <h3>Información del Estudiante</h3>
                <p><strong>Correo:</strong> {socioSeleccionado.correo}</p>
            <p><strong>Teléfono:</strong> {socioSeleccionado.telefono_osf}</p>
            <p><strong>Tipo de Socio:</strong> <span className="badge aprobado">{socioSeleccionado.tipo_socio}</span></p>
                <p><strong>Nombre:</strong> {socioSeleccionado.detalles.nombre_socio}</p>
                <p><strong>Matrícula:</strong> {socioSeleccionado.detalles.matricula}</p>
                <p><strong>Semestre Acreditado:</strong> {socioSeleccionado.detalles.semestre_acreditado}</p>
                <p><strong>INE:</strong> {socioSeleccionado.detalles.ine}</p>
                <p><strong>ID Carrera:</strong> {socioSeleccionado.detalles.id_carrera}</p>
              </div>
            )}

            {socioSeleccionado.tipo_socio === 'Entidad' && socioSeleccionado.detalles && (
              <div className="detalle-estudiante">
                <h3>Información de la Entidad</h3>
                <p><strong>Nombre:</strong> {socioSeleccionado.nombre_osf}</p>
            <p><strong>Correo:</strong> {socioSeleccionado.correo}</p>
            <p><strong>Teléfono:</strong> {socioSeleccionado.telefono_osf}</p>
            <p><strong>Redes Sociales:</strong> {socioSeleccionado.redes_sociales}</p>
            <p><strong>Tipo de Socio:</strong> <span className="badge aprobado">{socioSeleccionado.tipo_socio}</span></p>
            <p><strong>Visión:</strong> {socioSeleccionado.vision}</p>
            <p><strong>Misión:</strong> {socioSeleccionado.mision}</p>
            <p><strong>Objetivos:</strong> {socioSeleccionado.objetivos}</p>
            <p><strong>Población:</strong> {socioSeleccionado.poblacion_osf}</p>
            <p><strong>Número de Beneficiarios:</strong> {socioSeleccionado.num_beneficiarios_osf}</p>
            <p><strong>Nombre del Representante:</strong> {socioSeleccionado.nombre_representante}</p>
            <p><strong>Puesto del Representante:</strong> {socioSeleccionado.puesto_representante}</p>
            <p><strong>Dirección y Horario:</strong> {socioSeleccionado.direccion_horario}</p>
            <p><strong>Notificaciones:</strong> {socioSeleccionado.notificaciones ? 'Sí' : 'No'}</p>
            <p><strong>Nota:</strong> {socioSeleccionado.nota || 'N/A'}</p>
              </div>
            )}

            <button className="cerrar-btn" onClick={cerrarInfo}>Cerrar socio</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SociosAprobados;
