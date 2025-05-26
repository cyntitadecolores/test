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
    
const tiposDeColumna = {
  id_proyecto: { tipo: 'int' },
  id_socio: { tipo: 'int' },
  correo_registro_info: { tipo: 'varchar' },
  region_proyecto: {
    tipo: 'enum',
    valores: ['Centro-Occidente', 'CDMX', 'Monterrey', 'Noroeste'],
  },
  id_campus: { tipo: 'int' },
  crn: { tipo: 'varchar' },
  grupo: { tipo: 'varchar' },
  clave_materia: {
    tipo: 'enum',
    valores: ['WA1065', 'WA3041', 'WA1066', 'WA1067', 'WA1068', 'WA1058', 'WA3020'],
  },
  id_periodo: { tipo: 'int' },
  nombre_osf: { tipo: 'varchar' },
  razon_osf: { tipo: 'varchar' },
  poblacion_osf: {
    tipo: 'enum',
    valores: [
      'Comunidades urbano marginadas',
      'Comunidades rurales',
      'Comunidades indígenas',
      'Primera infancia (0 a 6 años)',
      'Niños y niñas de nivel primaria',
      'Niños, niñas y adolescentes',
      'Mujeres en situación vulnerable',
      'Adultos mayores',
      'Personas con discapacidad',
      'Personas con enfermedades crónicas/terminales',
      'Personas con problemas de adicciones',
      'Personas migrantes o situación de movilidad',
      'Otros',
    ],
  },
  num_beneficiarios_osf: { tipo: 'varchar' },
  ods_osf: { tipo: 'int' },
  telefono_osf: { tipo: 'varchar' },
  datos_osf: { tipo: 'varchar' },
  contacto_coordinador: { tipo: 'varchar' },
  redes_sociales: { tipo: 'varchar' },
  nombre_proyecto: { tipo: 'varchar' },
  nomenclatura_registro: { tipo: 'varchar' },
  diagnostico_previo: { tipo: 'boolean' },
  problema_social: { tipo: 'varchar' },
  vulnerabilidad_atendida_1: {
    tipo: 'enum',
    valores: [
      'Mujeres',
      'Migrantes',
      'Discapacidad auditiva',
      'Discapacidad motriz',
      'Discapacidad mental',
      'Discapacidad visual',
      'Personas en situación de pobreza',
      'Pertenecen a un grupo indígena',
      'Personas en situación de calle',
      'Personas con enfermedades crónicas/terminales',
      'Comunidad LGBTIQ+',
      'Medio ambiente',
      'Niños, Niñas y Adolescentes',
      'Personas con discapacidad',
      'Jóvenes',
    ],
  },
  edad_poblacion_1: {
    tipo: 'enum',
    valores: [
      'Edad entre 0 y 5 años',
      'Edad entre 6 y 12 años',
      'Edad entre 13 y 18 años',
      'Edad entre 19 y 30 años',
      'Edad entre 31 y 59 años',
      'Edad de 60 años o más',
      'No aplica',
    ],
  },
  vulnerabilidad_atendida_2: {
    tipo: 'enum',
    valores: [
      'Mujeres',
      'Migrantes',
      'Discapacidad auditiva',
      'Discapacidad motriz',
      'Discapacidad mental',
      'Discapacidad visual',
      'Personas en situación de pobreza',
      'Pertenecen a un grupo indígena',
      'Personas en situación de calle',
      'Personas con enfermedades crónicas/terminales',
      'Comunidad LGBTIQ+',
      'Medio ambiente',
      'Niños, Niñas y Adolescentes',
      'Personas con discapacidad',
      'Jóvenes',
    ],
  },
  edad_poblacion_2: {
    tipo: 'enum',
    valores: [
      'Edad entre 0 y 5 años',
      'Edad entre 6 y 12 años',
      'Edad entre 13 y 18 años',
      'Edad entre 19 y 30 años',
      'Edad entre 31 y 59 años',
      'Edad de 60 años o más',
      'No aplica',
    ],
  },
  zona_poblacion: {
    tipo: 'enum',
    valores: ['Rural', 'Urbana'],
  },
  numero_beneficiarios_proyecto: { tipo: 'varchar' },
  objetivo_proyecto: { tipo: 'varchar' },
  ods_proyecto_1: { tipo: 'int' },
  ods_proyecto_2: { tipo: 'int' },
  acciones_estudiantado: { tipo: 'varchar' },
  producto_servicio_entregar: { tipo: 'varchar' },
  entregable_esperado: { tipo: 'varchar' },
  medida_impacto: { tipo: 'varchar' },
  dias_actividades: {
    tipo: 'enum',
    valores: ['Por acordar con OSF', 'Específico'],
  },
  horario_proyecto: { tipo: 'varchar' },
  carreras_proyecto_1: { tipo: 'int' },
  carreras_proyecto_2: { tipo: 'int' },
  habilidades_alumno: { tipo: 'varchar' },
  cupos_proyecto: { tipo: 'int' },
  modalidad: {
    tipo: 'enum',
    valores: [
      'CLIN Proyecto Solidario Línea',
      'CLIP | Proyecto Solidario Mixto',
      'PSP | Proyecto Solidario Presencial',
    ],
  },
  direccion_escrita: { tipo: 'varchar' },
  duracion_experiencia: {
    tipo: 'enum',
    valores: ['5 semanas', '10 semanas', '15 semanas'],
  },
  valor_proyecto: {
    tipo: 'enum',
    valores: ['Compasión', 'Compromiso', 'Tolerancia', 'Participación ciudadana'],
  },
  periodo_repetido: { tipo: 'boolean' },
  induccion_ss: { tipo: 'boolean' },
  propuesta_semana_tec: { tipo: 'boolean' },
  propuesta_inmersion_social: { tipo: 'boolean' },
  propuesta_bloque: { tipo: 'boolean' },
  indicaciones_especiales: { tipo: 'text' },
  status_proyecto: {
    tipo: 'enum',
    valores: ['Aprobado', 'No aprobado', 'En revisión'],
  },
  entrevista: { tipo: 'boolean' },
  pregunta_descarte: { tipo: 'text' },
  enlace_maps: { tipo: 'varchar' },
  enlace_whatsApp: { tipo: 'varchar' },
  nombre_whatsApp: { tipo: 'varchar' },
  status_whatsapp: { tipo: 'varchar' },
  alumnos_postulados: { tipo: 'int' },
  alumnos_aceptados: { tipo: 'int' },
  alumnos_rechazados: { tipo: 'int' },
  cupos_disponibles: { tipo: 'int' },
  datatime_postulacion: { tipo: 'datetime' },
  inicio_actividades: { tipo: 'varchar' },
  carta_exclusion: { tipo: 'varchar' },
  anuncio_canvas: { tipo: 'text' },
  porcentaje_canvas: { tipo: 'varchar' },
  status_actividad: { tipo: 'boolean' },
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

    function validarValor(columna, valor) {
    const config = tiposDeColumna[columna];

    if (!config) return { valido: true };

    if (config.tipo === 'enum') {
        const esValido = config.valores.includes(valor);
        return {
            valido: esValido,
            mensaje: esValido ? '' : `Valor inválido. Opciones válidas: ${config.valores.join(', ')}`
        };
    }

    if (config.tipo === 'int') {
        const esValido = /^\d{1,3}$/.test(valor);
        return {
            valido: esValido,
            mensaje: esValido ? '' : 'Debe ser un número de hasta 3 dígitos.'
        };
    }

    if (config.tipo === 'varchar') {
        const esValido = valor.trim() !== '';
        return {
            valido: esValido,
            mensaje: esValido ? '' : 'Este campo no puede estar vacío.'
        };
    }

    if (config.tipo === 'boolean') {
    const esValido = typeof valor === 'boolean';
    return {
        valido: esValido,
        mensaje: esValido ? '' : 'Debe ser verdadero o falso.'
    };
}

if (config.tipo === 'datetime') {
    const esValido = !isNaN(Date.parse(valor));
    return {
        valido: esValido,
        mensaje: esValido ? '' : 'Debe ser una fecha y hora válidas.'
    };
}

    return { valido: true };
}


    const guardarCambio = async () => {
        const { filaId, columna } = celdaSeleccionada;  
        const nuevoValor = valorEditado;  
    
        const resultadoValidacion = validarValor(columna, nuevoValor);
    if (!resultadoValidacion.valido) {
        alert(`Error en "${columnasDisponibles[columna]}": ${resultadoValidacion.mensaje}`);
        return;
    }

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
    
    function validarURL(url) {
    try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (_) {
        return false;
    }
}


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
    <div className="cube" style={{ marginLeft: '260px', padding: '20px' }}>
        <NavCub />
        <h1>Proyectos Postulados Pendientes</h1>

        <button
            onClick={() => setMostrarFiltros(prev => !prev)}
            className="bttn-filtro"
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
                                                (col === 'enlace_maps' || col === 'enlace_whatsApp') ? (
    <a
        href={proyecto[col]}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: validarURL(proyecto[col]) ? 'green' : 'red' }}
    >
        {proyecto[col]}
    </a>
) : (
    proyecto[col]
)

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