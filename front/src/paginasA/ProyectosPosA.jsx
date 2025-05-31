import { useEffect, useState } from 'react';
import axios from 'axios';
import NavCub from '../componentes/navegacion';
import './tablasA.css';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

function ProyectosPos() {
    //Proyectos que se ven
    const [proyectos, setProyectos] = useState([]);
    //COlumnas visibles en el momento
    const [columnasVisibles, setColumnasVisibles] = useState([]);
    //Celda seleccionada para editar valor
    const [celdaSeleccionada, setCeldaSeleccionada] = useState(null); 
    //Nuevo valor
    const [valorEditado, setValorEditado] = useState('');
    const [valorOriginal, setValorOriginal] = useState('');
    //Valor de filtro, barra superior
    const [filteredText, setFilteredText] = useState('');
    //columnas siempre visibles
    const columnasFijas = ['Nombre OSF', 'nombre_proyecto', 'status_proyecto'];
    //lista de filtros
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    const [postulaciones, setPostulaciones] = useState([]);
    const [mostrarTablaPostulaciones, setMostrarTablaPostulaciones] = useState(false);
    const cerrarTablaPostulaciones = () => setMostrarTablaPostulaciones(false);


    
    //Lista de filtros
    const columnasDisponibles = {
    //amarillos
    id_proyecto: 'ID Proyecto',
    correo_registro_info: 'Dirección de correo electrónico de quien registra la información',
    region_proyecto: 'Región',
    campus: 'Campus',
    crn: 'CRN',
    grupo: 'Grupo',
    clave_materia: 'Clave de la Materia',
    periodo: 'Periodo PMT#)',
    fecha_implementacion: 'Fecha',
    //verde
    nombre_osf: 'OSF',
    razon_osf: '¿Cuál es la razón de ser, visión y objetivos de la OSF?',
    poblacion_osf: 'Población que atiende la OSF (características: edad, sexo, discapacidad, necesidad etc)',
    num_beneficiarios_osf: 'Número de beneficiarios que atiende la OSF anualmente:',
    ods_osf: 'ODS en el que se enfoca la OSF',
    telefono_osf: 'Teléfono',
    datos_osf: 'Contacto General',
    contacto_coordinador: 'Contacto General del Coordinador del proyecto',
    redes_sociales: 'Redes Sociales OSF',
    //azul
    nombre_proyecto: 'Proyecto',
    nomenclatura_registro: 'Alto',
    diagnostico_previo: 'Para definir el Proyecto Solidario, ¿se realizó algún diagnóstico previo?', // si es 1 es si, 0 es no
    problema_social: ' Describa el problema social específico que atenderá el estudiantado',
    vulnerabilidad_atendida_1: 'Tipo de vulnerabilidad de la población atendida',
    edad_poblacion_1: 'Rango de edad de la población atendida',
    vulnerabilidad_atendida_2: 'Otro tipo de vulnerabilidad de la población atendida',
    edad_poblacion_2: 'Otro rango de edad de la población atendida',
    zona_poblacion: 'Zona a la que pertenece la población atendida',
    numero_beneficiarios_proyecto: 'Número Aproximado de Beneficiarios',
    objetivo_proyecto: 'Objetivo del Proyecto Solidario',
    ods_proyecto_1: 'Objetivo de Desarrollo Sostenible 1',
    ods_proyecto_2: 'Objetivo de Desarrollo Sostenible 1',
    acciones_estudiantado: 'principales actividades/acciones a realizar por parte del estudiantado',
    producto_servicio_entregar: 'Producto/Servicio a Entregar',
    entregable_esperado: 'Entregable Esperado por Parte del Estudiante',
    medida_impacto: 'Medida de Impacto del Servicio Social',
    //Rosa
    dias_actividades: 'Días de Actividades',
    horario_proyecto: 'Horario del Proyecto',
    carreras_proyecto_1: 'Carrera Proyecto 1',
    carreras_proyecto_2: 'Carrera Proyecto 2',
    habilidades_alumno: 'Habilidades/Competencias Requeridas',
    cupos_proyecto: 'Cupos del Proyecto',
    modalidad: 'Modalidad',
    direccion_escrita: 'Dirección Escrita',
    enlace_maps: 'Enlace a Google Maps',
    duracion_experiencia: 'Duración de la Experiencia',
    valor_proyecto: 'Valor o actitud que promueve en el estudiantado con las acciones a llevar a cabo',
    //verde azulado
    periodo_repetido: '¿Periodo Repetido?', // 1 es si, 0 es no
    induccion_ss: 'Surgió de una propuesta de Inducción', // 1 es si, 0 es no
    propuesta_semana_tec: 'Surgió de una Propuesta Semana TEC', // 1 es si, 0 es no
    propuesta_inmersion_social: 'Surgió de una Propuesta Inmersión Social', // 1 es si, 0 es no
    propuesta_bloque: 'Surgió de una Propuesta Bloque',
    //azul claro
    indicaciones_especiales: 'Indicaciones Campus',
    //verde fosforecente
    status_proyecto: 'Status del Proyecto',
    entrevista: '¿Entrevista?',
    pregunta_descarte: 'Pregunta de Descarte',
    //azul fuerte
    enlace_whatsApp: 'Enlace WhatsApp',
    nombre_whatsApp: 'Nombre Grupo WhatsApp',
    status_whatsapp: 'Status Grupo WhatsApp',
    //verde aceituna
    alumnos_postulados: 'Alumnos Postulados',
    alumnos_aceptados: 'Alumnos Aceptados',
    alumnos_rechazados: 'Alumnos Rechazados',
    cupos_disponibles: 'Cupos Disponibles',
    //blanco
    inicio_actividades: 'Inicio de Actividades',
    carta_exclusion: 'Carta de Exclusión',
    anuncio_canvas: 'Anuncio en Canvas',
    porcentaje_canvas: 'Porcentaje en Canvas',

    datatime_postulacion: 'Fecha Postulación Proyecto',
    status_actividad: 'Status de Actividad',
    Nota: 'Nota',
    id_socio: 'ID Socio',
};

const gruposColumnas = {
  amarillos: [
    'id_proyecto',
    'correo_registro_info',
    'region_proyecto',
    'campus',
    'crn',
    'grupo',
    'clave_materia',
    'periodo',
    'fecha_implementacion'
  ],
  verdes: [
    'nombre_osf',
    'razon_osf',
    'poblacion_osf',
    'num_beneficiarios_osf',
    'ods_osf',
    'telefono_osf',
    'datos_osf',
    'contacto_coordinador',
    'redes_sociales'
  ],
  azules: [
    'nombre_proyecto',
    'nomenclatura_registro',
    'diagnostico_previo',
    'problema_social',
    'vulnerabilidad_atendida_1',
    'edad_poblacion_1',
    'vulnerabilidad_atendida_2',
    'edad_poblacion_2',
    'zona_poblacion',
    'numero_beneficiarios_proyecto',
    'objetivo_proyecto',
    'ods_proyecto_1',
    'ods_proyecto_2',
    'acciones_estudiantado',
    'producto_servicio_entregar',
    'entregable_esperado',
    'medida_impacto'
  ],
  rosa: [
    'dias_actividades',
    'horario_proyecto',
    'carreras_proyecto_1',
    'carreras_proyecto_2',
    'habilidades_alumno',
    'cupos_proyecto',
    'modalidad',
    'direccion_escrita',
    'enlace_maps',
    'duracion_experiencia',
    'valor_proyecto'
  ],
  verdeAzulado: [
    'periodo_repetido',
    'induccion_ss',
    'propuesta_semana_tec',
    'propuesta_inmersion_social',
    'propuesta_bloque'
  ],
  azulClaro: [
    'indicaciones_especiales'
  ],
  verdeFosforescente: [
    'status_proyecto',
    'entrevista',
    'pregunta_descarte'
  ],
  azulFuerte: [
    'enlace_whatsApp',
    'nombre_whatsApp',
    'status_whatsapp'
  ],
  verdeAceituna: [
    'alumnos_postulados',
    'alumnos_aceptados',
    'alumnos_rechazados',
    'cupos_disponibles'
  ],
  blanco: [
    'inicio_actividades','carta_exclusion','anuncio_canvas','porcentaje_canvas','datatime_postulacion','status_actividad','Nota','id_socio'
  ]
};

const coloresColumnas = {
  amarillos: 'FFFFFF99', // amarillo claro
  verdes: 'FFCCFFCC',    // verde claro
  azules: 'FFCCE5FF',    // azul claro
  rosa: 'FFFFCCE5',       // rosa claro
  verdeAzulado: 'FFCCFFFF',
  azulClaro: 'FFD9E1F2',
  verdeFosforescente: 'FFDAF7A6',
  azulFuerte: 'FF5B9BD5',
  verdeAceituna: 'FFE2EFDA',
  blanco: 'FFFFFFFF'
};


//Tipo de valor de la columna
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

const booleanToSiNo = (valor) => valor ? 'Sí' : 'No';
const colorPorColumna = {};

Object.entries(gruposColumnas).forEach(([grupo, columnas]) => {
  columnas.forEach(col => {
    colorPorColumna[col] = coloresColumnas[grupo];
  });
});


const exportarAExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('proyectosPostulados');

    // Generar las columnas dinámicamente según columnasFijas y columnasVisibles
    const todasLasColumnas = [...new Set([...columnasFijas, ...columnasVisibles])];
    worksheet.columns = todasLasColumnas.map(col => ({
        header: columnasDisponibles[col],
        key: col,
        width: 25,
    }));

    // Agregar los datos
    proyectosFiltrados.forEach(p => {
        const fila = {};
        todasLasColumnas.forEach(col => {
            fila[col] = p[col];
        });
        worksheet.addRow(fila);
        const lastRow = worksheet.lastRow;
todasLasColumnas.forEach((col, idx) => {
  const celda = lastRow.getCell(idx + 1);
  const color = colorPorColumna[col] || 'FFFFFFFF'; // blanco por defecto
  celda.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: color }
  };
});

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

//Obtener proyectos 
    useEffect(() => {
        axios.get('http://localhost:5003/proyectos')
            .then(response => {
                setProyectos(response.data);
            })
            .catch(error => {
                console.error('Error al obtener proyectos:', error);
            });
    }, []);

    //edicion de valor en tabla
    const handleCeldaClick = (filaId, columna, valorActual) => {
        setCeldaSeleccionada({ filaId, columna });
        setValorEditado(valorActual);
        setValorOriginal(valorActual);
    };

    function validarValor(columna, valor) {
    const config = tiposDeColumna[columna];

    if (!config) return { valido: true };

    //MANEJO DE ERRORES DEPENDIENDO EL TIPO DE VALOR
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


    const guardarCambio = async (nuevoValorParam) => {
    const { filaId, columna } = celdaSeleccionada;
    const nuevoValor = nuevoValorParam ?? valorEditado;

    console.log('Enviando PUT con:', { columna, nuevoValor });

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

const handleVerPostulaciones = (id_proyecto) => {
  console.log('Cargando postulaciones para el proyecto ID:', id_proyecto); // Verificar el ID
  axios.get(`http://localhost:5003/proyectos/${id_proyecto}/postulaciones`)
    .then(response => {
      console.log('Postulaciones:', response.data); // Verificar los datos obtenidos
      setPostulaciones(response.data);
      setMostrarTablaPostulaciones(true);
    })
    .catch(error => {
      console.error('Error al obtener postulaciones:', error);
    });
};

    const cancelarEdicion = () => {
        setCeldaSeleccionada(null);
        setValorEditado('');
        setValorOriginal('');
    };

    //PUT que actualiza el status del proyecto
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

    const activarGrupo = (grupo) => {
  const columnas = gruposColumnas[grupo];
  setColumnasVisibles(prev => [
    ...new Set([...prev, ...columnas]) // evitar duplicados
  ]);
};

const desactivarGrupo = (grupo) => {
  const columnas = gruposColumnas[grupo];
  setColumnasVisibles(prev => prev.filter(col => !columnas.includes(col)));
};

const activarTodos = () => {
  const todas = Object.values(gruposColumnas).flat();
  setColumnasVisibles([...new Set([...columnasVisibles, ...todas])]);
};

const desactivarTodos = () => {
  setColumnasVisibles([]);
};


    return (
    <div className="main">
        <NavCub />
        <h1 className="titulo">Proyectos Postulados Pendientes</h1>

{/* Boton de cambio de vista */}
        <div className="botones-acciones">
          <button
            onClick={() => setMostrarFiltros(prev => !prev)}
            className="bttn-filtro"
          >
            {mostrarFiltros ? 'Ver Tabla' : 'Aplicar Filtros'}
          </button>
          <button onClick={exportarAExcel} className="bttn-excel">
            Descargar Excel
          </button>
        </div>

{/* Lista de filtros para ver tabla*/}
        {mostrarFiltros && (
  <div className="filtros-columnas-wrapper">
    <h3>Selecciona las columnas que deseas mostrar:</h3>

  <div className="grid-filtros">
    {[
      { nombre: 'Amarillos', clase: 'amarillos' },
      { nombre: 'Verdes', clase: 'verdes' },
      { nombre: 'Azules', clase: 'azules' },
      { nombre: 'Rosa', clase: 'rosa' },
      { nombre: 'Verde Azulado', clase: 'verdeAzulado' },
      { nombre: 'Azul Claro', clase: 'azulClaro' },
      { nombre: 'Verde Fosforescente', clase: 'verdeFosforescente' },
      { nombre: 'Azul Fuerte', clase: 'azulFuerte' },
      { nombre: 'Verde Aceituna', clase: 'verdeAceituna' },
      { nombre: 'Blanco', clase: 'blanco' },
    ].map(grupo => (
      <div key={grupo.clase} className="filtro-card">
        <h3>{grupo.nombre}</h3>
        <div className="acciones">
          <button className={`btn activar ${grupo.clase}`} onClick={() => activarGrupo(grupo.clase)}>
            Activar
          </button>
          <button className={`btn ocultar ${grupo.clase}`} onClick={() => desactivarGrupo(grupo.clase)}>
            Ocultar
          </button>
        </div>
      </div>
    ))}
  </div>

  <div className="todos-container">
    <button className="btn-grande activar-todos" onClick={activarTodos}>Activar Todos</button>
    <button className="btn-grande ocultar-todos" onClick={desactivarTodos}>🚫 Ocultar Todos</button>
  </div>




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
)}

            <div className="tabla-container">
                <div className="buscador">
                  <label htmlFor="busqueda">Buscar:</label>
                  <input
                    id="busqueda"
                    type="text"
                    value={filteredText}
                    onChange={handleChange}
                    className="input-busqueda"
                    placeholder="Buscar proyecto..."
                  />
                </div>
                <div className="tabla-scroll-wrapper">
                    <table className="tabla-proyectos">
                        <thead>
                            {/* Columas que siempre se muestran */}
                            <tr>
                                {[...columnasFijas, ...columnasVisibles].map(col => (
                                    <th key={col}>{columnasDisponibles[col]}</th>
                                ))}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* MAP para mostrar filtros en la tabla*/}
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
    tiposDeColumna[col]?.tipo === 'enum' ? (
        <select
  value={valorEditado}
  onChange={e => {
    const nuevoValor = e.target.value;
    setValorEditado(nuevoValor);
    guardarCambio(nuevoValor); 
  }}
  autoFocus
>
  {tiposDeColumna[col].valores.map(opcion => (
    <option key={opcion} value={opcion}>
      {opcion}
    </option>
  ))}
</select>

    ) : (
        <input
            type="text"
            value={valorEditado}
            onChange={e => setValorEditado(e.target.value)}
            onBlur={guardarCambio}
            autoFocus
        />
    )
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
                                    {/* Formato parra cambiar el status del proyecto*/}
                                    <td>
  {proyecto.status_proyecto === 'En revisión' ? (
    <>
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
    </>
    ) : proyecto.status_proyecto === 'Aprobado' ? (
    <>
      <button
        className="ver-postulaciones"
        onClick={() => handleVerPostulaciones(proyecto.id_proyecto)}
      >
        Ver postulaciones
      </button>
    </>
  ) : (
    proyecto.status_proyecto
  )}

</td>

                                </tr>
                            ))}
                        </tbody>
                    </table>       
                </div>
            </div>
        

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

        {mostrarTablaPostulaciones && (
  <div className="tabla-emergente">
    <div className="tabla-emergente-header">
      <h3>Postulaciones del Proyecto</h3>
      <button onClick={cerrarTablaPostulaciones} style={{ float: 'right' }}>Cerrar</button>
    </div>
    <table className="tabla-postulaciones">
      <thead>
        <tr>
          <th>Nombre Estudiante</th>
          <th>Status</th>
          <th>Fecha</th>
          <th>Expectativa</th>
          <th>Razón</th>
          <th>Motivo</th>
          <th>Descartado</th>
          <th>Nota</th>
        </tr>
      </thead>
      <tbody>
        {postulaciones.map(p => (
          <tr key={p.id_postulacion}>
            <td>{p.nombre_estudiante}</td>
            <td>{p.status}</td>
            <td>{new Date(p.fecha_postulacion).toLocaleDateString()}</td>
            <td>{p.expectativa}</td>
            <td>{p.razon}</td>
            <td>{p.motivo}</td>
            <td>{p.pregunta_descarte}</td>
            <td>{p.Nota}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

    </div>
);

}

export default ProyectosPos;