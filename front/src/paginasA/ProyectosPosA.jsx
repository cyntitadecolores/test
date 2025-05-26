import { useEffect, useState } from 'react';
import axios from 'axios';
import NavCub from '../componentes/navegacion';
import './tablasA.css';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

function ProyectosPos() {
    const [proyectos, setProyectos] = useState([]);
    const [columnasVisibles, setColumnasVisibles] = useState([]);
    const [celdaSeleccionada, setCeldaSeleccionada] = useState(null); 
    const [valorEditado, setValorEditado] = useState('');
    const [valorOriginal, setValorOriginal] = useState('');
    const [filteredText, setFilteredText] = useState('');
    const columnasFijas = ['Nombre OSF', 'nombre_proyecto'];
    const [mostrarFiltros, setMostrarFiltros] = useState(false);


    const columnasDisponibles = {
    id_proyecto: 'ID Proyecto',
    correo_registro_info: 'Correo Registro',
    region_proyecto: 'Región Proyecto',
    id_campus: 'ID Campus',
    crn: 'CRN',
    grupo: 'Grupo',
    clave_materia: 'Clave Materia',
    id_periodo: 'ID Periodo',
    fecha_implementacion: 'Fecha Implementación',
    nombre_osf: 'Nombre OSF',
    razon_osf: 'Razón OSF',
    poblacion_osf: 'Población OSF',
    num_beneficiarios_osf: 'Número Beneficiarios OSF',
    ods_osf: 'ODS OSF',
    telefono_osf: 'Teléfono OSF',
    datos_osf: 'Datos OSF',
    contacto_coordinador: 'Contacto Coordinador',
    redes_sociales: 'Redes Sociales OSF',
    nombre_proyecto: 'Nombre Proyecto',
    nomenclatura_registro: 'Nomenclatura Registro',
    diagnostico_previo: 'Diagnóstico Previo',
    problema_social: 'Problema Social',
    vulnerabilidad_atendida_1: 'Vulnerabilidad Atendida 1',
    edad_poblacion_1: 'Edad Población 1',
    vulnerabilidad_atendida_2: 'Vulnerabilidad Atendida 2',
    edad_poblacion_2: 'Edad Población 2',
    zona_poblacion: 'Zona Población',
    numero_beneficiarios_proyecto: 'Número Beneficiarios Proyecto',
    objetivo_proyecto: 'Objetivo del Proyecto',
    ods_proyecto_1: 'ODS Proyecto 1',
    ods_proyecto_2: 'ODS Proyecto 2',
    acciones_estudiantado: 'Acciones del Estudiantado',
    producto_servicio_entregar: 'Producto/Servicio a Entregar',
    entregable_esperado: 'Entregable Esperado',
    medida_impacto: 'Medida de Impacto',
    dias_actividades: 'Días de Actividades',
    horario_proyecto: 'Horario del Proyecto',
    carreras_proyecto_1: 'Carrera Proyecto 1',
    carreras_proyecto_2: 'Carrera Proyecto 2',
    habilidades_alumno: 'Habilidades Requeridas',
    cupos_proyecto: 'Cupos del Proyecto',
    modalidad: 'Modalidad',
    direccion_escrita: 'Dirección Escrita',
    duracion_experiencia: 'Duración de la Experiencia',
    valor_proyecto: 'Valor del Proyecto',
    periodo_repetido: '¿Periodo Repetido?',
    induccion_ss: 'Inducción SS',
    propuesta_semana_tec: 'Propuesta Semana TEC',
    propuesta_inmersion_social: 'Propuesta Inmersión Social',
    propuesta_bloque: 'Propuesta Bloque',
    indicaciones_especiales: 'Indicaciones Campus',
    status_proyecto: 'Status del Proyecto',
    entrevista: '¿Entrevista?',
    pregunta_descarte: 'Pregunta de Descarte',
    enlace_maps: 'Enlace a Google Maps',
    enlace_whatsApp: 'Enlace WhatsApp',
    nombre_whatsApp: 'Nombre Grupo WhatsApp',
    status_whatsapp: 'Status Grupo WhatsApp',
    alumnos_postulados: 'Alumnos Postulados',
    alumnos_aceptados: 'Alumnos Aceptados',
    alumnos_rechazados: 'Alumnos Rechazados',
    cupos_disponibles: 'Cupos Disponibles',
    datatime_postulacion: 'Fecha Postulación Proyecto',
    inicio_actividades: 'Inicio de Actividades',
    carta_exclusion: 'Carta de Exclusión',
    anuncio_canvas: 'Anuncio en Canvas',
    porcentaje_canvas: 'Porcentaje en Canvas',
    status_actividad: 'Status de Actividad',
    Nota: 'Nota',
    id_socio: 'ID Socio',
};
    
const exportarAExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('proyectosPostulados');

    // Generar las columnas dinámicamente según columnasFijas y columnasVisibles
    const todasLasColumnas = [...columnasFijas, ...columnasVisibles];
    worksheet.columns = todasLasColumnas.map(col => ({
        header: columnasDisponibles[col],
        key: col,
        width: 25, // Puedes ajustar el ancho si lo necesitas
    }));

    // Agregar los datos
    proyectosFiltrados.forEach(p => {
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
            fgColor: { argb: 'FF2F75B5' }, // azul oscuro
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
    saveAs(blob, 'proyectosPostulados.xlsx');
};


    useEffect(() => {
        axios.get('http://localhost:5003/proyectos')
            .then(response => {
                setProyectos(response.data);
            })
            .catch(error => {
                console.error('Error al obtener proyectos:', error);
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
            const response = await fetch(`http://localhost:5003/proyecto/${filaId}/editar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ columna, nuevoValor }),  
            });

            const data = await response.json();
            if (response.ok) {
                const proyectosActualizados = await axios.get('http://localhost:5003/proyectos');
                setProyectos(proyectosActualizados.data);
                setCeldaSeleccionada(null);  
                setValorEditado('');  
            } else {
                console.error('Error al actualizar proyecto:', data.message);
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

    function actualizarStatus(id, nuevoStatus) {
    axios.put(`http://localhost:5003/proyecto/${id}/status`, { status: nuevoStatus })
        .then(() => {
            setProyectos(prev =>
                prev.filter(proy => proy.id_proyecto !== id) 
            );
        })
        .catch(error => {
            console.error('Error al actualizar el status:', error);
        });
}

    const handleChange = (e) => {
        setFilteredText(e.target.value.toLowerCase());
    };

    const proyectosFiltrados = proyectos.filter(proy =>
        Object.values(proy).some(valor =>
            valor && valor.toString().toLowerCase().includes(filteredText)
        )
    );

    return (
    <div className="main">
        <NavCub />
        <h1 className="titulo">Proyectos Postulados Pendientes</h1>

        <button
            onClick={() => setMostrarFiltros(prev => !prev)}
            style={{ marginBottom: '20px' }}
        >
            {mostrarFiltros ? 'Ver Tabla' : 'Aplicar Filtros'}
        </button>

        {mostrarFiltros ? (
            <div className="filtros-columnas-wrapper">
                <h3>Selecciona las columnas que deseas mostrar:</h3>
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
                <input
                    type="text"
                    value={filteredText}
                    onChange={handleChange}
                />
                <div className="tabla-scroll-wrapper">
                    <table className="tabla-proyectos">
                        <thead>
                            <tr>
                                {[...columnasFijas, ...columnasVisibles].map(col => (
                                    <th key={col}>{columnasDisponibles[col]}</th>
                                ))}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proyectosFiltrados.map(proyecto => (
                                <tr key={proyecto.id_proyecto}>
                                    {[...columnasFijas, ...columnasVisibles].map(col => (
                                        <td
                                            key={col}
                                            onClick={() =>
                                                handleCeldaClick(proyecto.id_proyecto, col, proyecto[col])
                                            }
                                        >
                                            {celdaSeleccionada &&
                                            celdaSeleccionada.filaId === proyecto.id_proyecto &&
                                            celdaSeleccionada.columna === col ? (
                                                <input
                                                    type="text"
                                                    value={valorEditado}
                                                    onChange={e => setValorEditado(e.target.value)}
                                                    onBlur={guardarCambio}
                                                    autoFocus
                                                />
                                            ) : (
                                                proyecto[col]
                                            )}
                                        </td>
                                    ))}
                                    <td>
                                        <button
                                            className="aprobar"
                                            onClick={() => actualizarStatus(proyecto.id_proyecto, 'Aprobado')}
                                        >
                                            Aprobado
                                        </button>
                                        <button
                                            className="rechazar"
                                            onClick={() => actualizarStatus(proyecto.id_proyecto, 'No aprobado')}
                                            style={{ marginLeft: '8px' }}
                                        >
                                            No aprobado
                                        </button>
                                    </td>
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
    </div>
);

}

export default ProyectosPos;