import { useEffect, useState } from 'react';
import axios from 'axios';
import NavCub from '../componentes/navegacion';
import './tablasA.css';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

function AlumnosPos() {
    //obtener postulaciones
    const [postulaciones, setPostulaciones] = useState([]);
    //columnas que se mostraran
    const [columnasVisibles, setColumnasVisibles] = useState([]);
    //celda seleccionada para modificar info
    const [celdaSeleccionada, setCeldaSeleccionada] = useState(null);
    //valor nuevo de la celda
    const [valorEditado, setValorEditado] = useState('');
    const [valorOriginal, setValorOriginal] = useState('');
    //texto filtrado
    const [filteredText, setFilteredText] = useState('');
    //columnas que siempre se muestran
    const columnasFijas = ['nombre_proyecto', 'nombre', 'status'];
    //obtener proyectos
    const [proyectos, setProyectos] = useState([]);

    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [socios, setSocios] = useState([]);
//cuenta de resumen de postulaciones 
const totalCupos = proyectos.reduce((total, proyecto) => total + proyecto.cupos_proyecto, 0);
const totalInscritos = postulaciones.filter(p => p.status === 'Inscrito').length;
const cuposDisponibles = totalCupos - totalInscritos;

const [statusFiltro, setStatusFiltro] = useState('');



    const columnasDisponibles = {
        nombre_proyecto: 'nombre del proyecto',
        nombre: 'Nombre Estudiante',
        fecha_postulacion: 'Fecha Postulación',
        expectativa: 'Expectativa',
        razon: 'Razón',
        motivo: 'Motivo',
        pregunta_descarte: 'descarte',
        status: 'Status',
    };

    //GET de proyectos aprobados 
    useEffect(() => {
    axios.get('http://localhost:5003/proyectos/aprobados')
      .then(response => setProyectos(response.data))
      .catch(error => console.error('Error al obtener proyectos:', error));
  }, []);

    const exportarAExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('proyectosPostulados');
    
        // Generar las columnas dinámicamente según columnasFijas y columnasVisibles
        const todasLasColumnas = [...columnasFijas, ...columnasVisibles];
        worksheet.columns = todasLasColumnas.map(col => ({
            header: columnasDisponibles[col],
            key: col,
            width: 25, 
        }));
    
    
        postulacionesFiltrados.forEach(p => {
            const fila = {};
            todasLasColumnas.forEach(col => {
                fila[col] = p[col];
            });
            worksheet.addRow(fila);
        });
    
        // Estilo para encabezado
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
    
        // Generar archivo y descargarlo
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, 'alumnosPostulados.xlsx');
    };

    //GET de postulaciones 
    useEffect(() => {
        axios.get('http://localhost:5003/postulaciones_alumnos')
            .then(response => {
                setPostulaciones(response.data);
            })
            .catch(error => {
                console.error('Error al obtener postulaciones:', error);
            });
    }, []);

    const handleCeldaClick = (filaId, columna, valorActual) => {
        setCeldaSeleccionada({ filaId, columna });
        setValorEditado(valorActual);
        setValorOriginal(valorActual);
    };

    const guardarCambio = async () => {
        const { filaId, columna } = celdaSeleccionada;
        const nuevoValor = valorEditado;

        try {
            //edicion de informacion 
            const response = await fetch(`http://localhost:5003/postulaciones_alumnos/${filaId.id_proyecto}/${filaId.id_estudiante}/editar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ columna, nuevoValor }),
            });

            const data = await response.json();
            if (response.ok) {
                const postulacionesActualizadas = await axios.get('http://localhost:5003/postulaciones_alumnos');
                setPostulaciones(postulacionesActualizadas.data);
                setCeldaSeleccionada(null);
                setValorEditado('');
            } else {
                console.error('Error al actualizar postulacion:', data.message);
            }
        } catch (error) {
            console.error('Error al guardar cambio:', error);
        }
    };

    const cancelarEdicion = () => {
        setCeldaSeleccionada(null);
        setValorEditado('');
        setValorOriginal('');
    };

    //se puede borrar ya no se usa
    const actualizarStatus = (idProyecto, idEstudiante, nuevoStatus) => {
        axios.put(`http://localhost:5003/postulaciones_alumnos/${idProyecto}/${idEstudiante}/editar`, {
            columna: 'status',
            nuevoValor: nuevoStatus
        })
        .then(() => {
            setPostulaciones(prev =>
                prev.map(post =>
                    post.id_proyecto === idProyecto && post.id_estudiante === idEstudiante
                        ? { ...post, status: nuevoStatus }
                        : post
                )
            );
        })
        .catch(error => {
            console.error('Error al actualizar el status:', error);
        });
    };

    const handleChange = (e) => {
        setFilteredText(e.target.value.toLowerCase());
    };

    // Filtro con las nuevas columnas
    const postulacionesFiltrados = postulaciones.filter(post =>
    (statusFiltro === '' || post.status === statusFiltro) &&
    Object.entries(post).some(([key, valor]) => {
        if (columnasVisibles.includes(key) || columnasFijas.includes(key)) {
            return valor && valor.toString().toLowerCase().includes(filteredText);
        }
        return false;
    })
);


    return (
        <div className="main">
            <NavCub />
            <h1 className="titulo">Postulaciones de Alumnos</h1>

            <button
                onClick={() => setMostrarFiltros(prev => !prev)}
                style={{ marginBottom: '20px' }}
            >
                {mostrarFiltros ? 'Ver Tabla' : 'Aplicar Filtros'}
            </button>

            {mostrarFiltros ? (
                <div className="filtros-columnas-wrapper">
                    <h3>Columnas a mostrar:</h3>
                    <div className="filtros-columnas">
                        {Object.entries(columnasDisponibles).map(([key, label]) => (
                            <label key={key}>
                                <input
                                    type="checkbox"
                                    checked={columnasVisibles.includes(key) || columnasFijas.includes(key)}
                                    onChange={() => {
                                        if (columnasFijas.includes(key)) return;
                                        setColumnasVisibles(prev =>
                                            prev.includes(key)
                                                ? prev.filter(col => col !== key)
                                                : [...prev, key]
                                        );
                                    }}
                                    disabled={columnasFijas.includes(key)}
                                />
                                {label}
                            </label>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="tabla-container">
                    <p>Buscar:</p>
                    <input type="text" value={filteredText} onChange={handleChange} />
                    <div style={{ marginTop: '10px', marginBottom: '10px' }}>
  <label>Filtrar por status:&nbsp;</label>
  <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
    <option value="">Todos</option>
    <option value="En revision">En revisión</option>
    <option value="Aceptadx">Aceptadx</option>
    <option value="No aceptadx">No aceptadx</option>
    <option value="Alumno declinó participación">Alumno declinó participación</option>
  </select>
</div>

                    <div className="tabla-scroll-wrapper">
                        <table className="tabla-proyectos">
                            <thead>
                                <tr>
                                    {[...columnasFijas, ...columnasVisibles].map(col => (
                                        <th key={col}>{columnasDisponibles[col]}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {postulacionesFiltrados.map(postulacion => (
                                    <tr key={`${postulacion.id_proyecto}-${postulacion.id_estudiante}`}>
                                        {[...columnasFijas, ...columnasVisibles].map(col => (
                                            <td
                                                key={col}
                                                onClick={() =>
                                                    handleCeldaClick(
                                                        { id_proyecto: postulacion.id_proyecto, id_estudiante: postulacion.id_estudiante },
                                                        col,
                                                        postulacion[col]
                                                    )
                                                }
                                            >
                                                {celdaSeleccionada &&
                                                celdaSeleccionada.filaId.id_proyecto === postulacion.id_proyecto &&
                                                celdaSeleccionada.filaId.id_estudiante === postulacion.id_estudiante &&
                                                celdaSeleccionada.columna === col ? (
                                                    <input
                                                        type="text"
                                                        value={valorEditado}
                                                        onChange={e => setValorEditado(e.target.value)}
                                                        onBlur={guardarCambio}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    postulacion[col]
                                                )}
                                            </td>
                                        ))}
                                        
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={exportarAExcel} style={{ marginBottom: '20px', marginLeft: '10px' }}>
    Descargar Excel
</button>
                    </div>
                </div>
            )}

            {celdaSeleccionada && (
                <div className="editor-container" style={{ marginTop: '20px' }}>
                    <h3>Editando: {columnasDisponibles[celdaSeleccionada.columna]}</h3>
                    <input
                        type="text"
                        value={valorEditado}
                        onChange={(e) => setValorEditado(e.target.value)}
                        style={{ marginRight: '10px' }}
                    />
                    <button onClick={guardarCambio}>Guardar cambios</button>
                    <button onClick={cancelarEdicion} style={{ marginLeft: '8px' }}>Cancelar</button>
                </div>
            )}
            <div className="resumen-container">
  <div className="resumen-card purple">
    <div className="resumen-header">
      <span>Estudiantes postulados</span>
      <img src="src/assets/icon_users.png" alt="Icono" />
    </div>
    <div className="resumen-value">{postulaciones.length}</div>
  </div>

  <div className="resumen-card yellow">
    <div className="resumen-header">
      <span>Estudiantes aceptados</span>
      <img src="src/assets/icon_accept.png" alt="Icono" />
    </div>
    <div className="resumen-value">
      {postulaciones.filter(p => p.status === 'Aceptadx').length}
    </div>
  </div>

  <div className="resumen-card red">
    <div className="resumen-header">
      <span>Estudiantes no aceptados</span>
      <img src="src/assets/icon_reject.png" alt="Icono" />
    </div>
    <div className="resumen-value">
      {postulaciones.filter(p => p.status === 'No aceptadx').length}
    </div>
  </div>

  <div className="resumen-card red">
    <div className="resumen-header">
      <span>Estudiantes inscritos</span>
      <img src="src/assets/icon_reject.png" alt="Icono" />
    </div>
    <div className="resumen-value">
      {postulaciones.filter(p => p.status === 'Inscrito').length}
    </div>
  </div>

  <div className="resumen-card green">
    <div className="resumen-header">
      <span>Cupos disponibles</span>
      <img src="src/assets/icon_chart.png" alt="Icono" />
    </div>
    <div className="resumen-value">{cuposDisponibles}</div> 
  </div>
</div>

        </div>
    );
}

export default AlumnosPos;
