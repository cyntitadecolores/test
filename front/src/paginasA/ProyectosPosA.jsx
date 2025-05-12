import { useEffect, useState } from 'react';
import axios from 'axios';
import NavCub from '../componentes/navegacion';
import './tablasA.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function ProyectosPos() {
    const [proyectos, setProyectos] = useState([]);
    const [columnasVisibles, setColumnasVisibles] = useState([]);
    const [celdaSeleccionada, setCeldaSeleccionada] = useState(null); 
    const [valorEditado, setValorEditado] = useState('');
    const [valorOriginal, setValorOriginal] = useState('');
    const [filteredText, setFilteredText] = useState('');
    const columnasFijas = ['nombre', 'nombre_proyecto'];
    const [mostrarFiltros, setMostrarFiltros] = useState(false);


    const columnasDisponibles = {
        id_proyecto: 'ID Proyecto',
        nombre: 'nombre socio',
        status_proyecto: 'Status Proyecto',
        crn: 'CRN',
        campus: 'Campus',
        grupo: 'Grupo',
        clave_materia: 'Clave Materia',
        id_periodo: 'ID Periodo',
        fecha_postulacion_proyecto: 'Fecha Postulación Proyecto',
        nombre_proyecto: 'Nombre Proyecto',
        problema_social: 'Problema Social',
        vulnerabilidad_atendida: 'Vulnerabilidad Atendida',
        edad_poblacion: 'Edad Población',
        zona_poblacion: 'Zona Población',
        numero_beneficiarios_proyecto: 'Número Beneficiarios Proyecto',
        objetivo_proyecto: 'Objetivo Proyecto',
        acciones_estudiantado: 'Acciones Estudiantado',
        producto_servicio_entregar: 'Producto/Servicio a Entregar',
        entregable_esperado: 'Entregable Esperado',
        medida_impacto: 'Medida Impacto',
        nuevo_reconocimiento: 'Nuevo Reconocimiento',
        nombre_ods: 'Nombre ODS 1',
        id_ods_2: 'ID ODS 2',
        dias_actividades: 'Días Actividades',
        carreras_proyecto: 'Carreras Proyecto',
        habilidades_alumno: 'Habilidades Alumno',
        modalidad: 'Modalidad',
        direccion_escrita: 'Dirección Escrita',
        valor_proyecto: 'Valor Proyecto',
        periodo_repetido: 'Periodo Repetido',
        induccion_es: 'Inducción ES',
        propuesta_semana_tec: 'Propuesta Semana TEC',
        propuesta_inmersion_social: 'Propuesta Inmersión Social',
        propuesta_bloque: 'Propuesta Bloque',
        indicaciones_campus: 'Indicaciones Campus',
        enlace_maps: 'Enlace Maps',
        entrevista: 'Entrevista',
        pregunta_descarte: 'Pregunta Descarte',
        conocimiento_horarios: 'Conocimiento Horarios',
        areas: 'Áreas',
        nombre_grupo_whatsapp: 'Nombre Grupo WhatsApp',
        enlace_whatsapp: 'Enlace WhatsApp',
        status_grupo_whatsapp: 'Status Grupo WhatsApp',
        alumnos_postulados: 'Alumnos Postulados',
        alumnos_aceptados: 'Alumnos Aceptados',
        cupos_disponibles: 'Cupos Disponibles',
        region_proyecto: 'Región Proyecto',
        fecha_implementacion: 'Fecha Implementación',
        nomenclatura_registro: 'Nomenclatura Registro',
        diagnostico_previo: 'Diagnóstico Previo',
        vulnerabilidad_atendida_2: 'Vulnerabilidad Atendida 2',
        edad_poblacion_2: 'Edad Población 2',
        horario: 'Horario',
        duracion_experiencia: 'Duración Experiencia',
        horas_acreditar: 'Horas Acreditar',
        indicaciones_campus_2: 'Indicaciones Campus 2'
    };
    

    const exportarAExcel = () => {
    const datosAExportar = proyectosFiltrados.map(p => {
        const fila = {};
        [...columnasFijas, ...columnasVisibles].forEach(col => {
            fila[columnasDisponibles[col]] = p[col];
        });
        return fila;
    });

    const hoja = XLSX.utils.json_to_sheet(datosAExportar);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'proyectosPostulados');

    const excelBuffer = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
    const archivo = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(archivo, 'proyectosPostulados.xlsx');
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
        axios.put(`http://localhost:5001/proyecto/${id}/status`, { status: nuevoStatus })
            .then(() => {
                setProyectos(prev =>
                    prev.map(proy =>
                        proy.id_proyecto === id ? { ...proy, status_proyecto: nuevoStatus } : proy
                    )
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
    <div className="cube" style={{ marginLeft: '260px', padding: '20px' }}>
        <NavCub />
        <h1>Proyectos Postulados Pendientes</h1>

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
                                            onClick={() => actualizarStatus(proyecto.id_proyecto, 'aprobado')}
                                        >
                                            Aprobar
                                        </button>
                                        <button
                                            className="rechazar"
                                            onClick={() => actualizarStatus(proyecto.id_proyecto, 'rechazado')}
                                            style={{ marginLeft: '8px' }}
                                        >
                                            Rechazar
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