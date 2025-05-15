import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import NavCub from "../componentes/navegacionS";
import styles from "./PostularProyectoS.module.css";

const REGIONES = [
  "Centro-Occidente",
  "CDMX",
  "Monterrey",
  "Noroeste",
];

const CLAVES_MATERIA = [
  "WA1065",
  "WA3041",
  "WA1066",
  "WA1067",
  "WA1068",
  "WA1058",
  "WA3020",
];

const POBLACIONES_OSF = [
  "Comunidades urbano marginadas",
  "Comunidades rurales",
  "Comunidades indígenas",
  "Primera infancia (0 a 6 años)",
  "Niños y niñas de nivel primaria",
  "Niños, niñas y adolescentes",
  "Mujeres en situación vulnerable",
  "Adultos mayores",
  "Personas con discapacidad",
  "Personas con enfermedades crónicas/terminales",
  "Personas con problemas de adicciones",
  "Personas migrantes o situación de movilidad",
  "Otros",
];

const VULNERABILIDADES = [
  "Mujeres",
  "Migrantes",
  "Discapacidad auditiva",
  "Discapacidad motriz",
  "Discapacidad mental",
  "Discapacidad visual",
  "Personas en situación de pobreza",
  "Pertenecen a un grupo indígena",
  "Personas en situación de calle",
  "Personas con enfermedades crónicas/terminales",
  "Comunidad LGBTIQ+",
  "Medio ambiente",
  "Niños, Niñas y Adolescentes",
  "Personas con discapacidad",
  "Jóvenes",
];

const EDADES_POBLACION = [
  "Edad entre 0 y 5 años",
  "Edad entre 6 y 12 años",
  "Edad entre 13 y 18 años",
  "Edad entre 19 y 30 años",
  "Edad entre 31 y 59 años",
  "Edad de 60 años o más",
  "No aplica",
];

const ZONAS = ["Rural", "Urbana"];

const DIAS_ACTIVIDADES = ["Por acordar con OSF", "Específico"];

const MODALIDADES = [
  "CLIN Proyecto Solidario Línea",
  "CLIP | Proyecto Solidario Mixto",
  "PSP | Proyecto Solidario Presencial",
];

const DURACIONES = ["5 semanas", "10 semanas", "15 semanas"];

const VALORES_PROYECTO = [
  "Compasión",
  "Compromiso",
  "Tolerancia",
  "Participación ciudadana",
];

/* ----------------------------------------------------------
   Helpers reutilizables
----------------------------------------------------------*/
// Normaliza strings u objetos a { value, label }
const normalizeOption = (o) =>
  typeof o === "object" ? o : { value: o, label: o };

// Convierte rápidamente un arreglo de strings a objetos
const asOptions = (arr) => arr.map((v) => ({ value: v, label: v }));

const TextInput = ({ label, name, value, onChange, ...props }) => (
  <div className={styles.field}>
    <label>{label}</label>
    <input
      type="text"
      name={name}
      value={value || ""}
      onChange={onChange}
      {...props}
    />
  </div>
);

const SelectInput = ({ label, name, value, options, onChange, ...props }) => (
  <div className={styles.field}>
    <label>{label}</label>
    <select name={name} value={value || ""} onChange={onChange} {...props}>
      <option value="">Selecciona…</option>
      {options.map((raw) => {
        const { value: val, label } = normalizeOption(raw);
        return (
          <option key={val} value={val}>
            {label}
          </option>
        );
      })}
    </select>
  </div>
);

const CheckboxInput = ({ label, name, checked, onChange }) => (
  <div className={styles.checkbox}>
    <label>
      <input
        type="checkbox"
        name={name}
        checked={!!checked}
        onChange={(e) =>
          onChange({ target: { name, value: e.target.checked } })
        }
      />
      {label}
    </label>
  </div>
);

/* ----------------------------------------------------------
   Componente principal
----------------------------------------------------------*/
export default function PostularProyectoS() {
  // Catálogos desde el backend
  const [imagen, setImagen] = useState(null); // archivo seleccionado\n
  const [campus, setCampus] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [ods, setOds] = useState([]);
  const [carreras, setCarreras] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [okMsg, setOkMsg] = useState(null);

  // Todos los campos del formulario
  const [form, setForm] = useState({
    // encabezado
    correo_registro_info: "",
    region_proyecto: "",
    id_campus: "",
    crn: "",
    grupo: "",
    clave_materia: "",
    id_periodo: "",
    fecha_implementacion: "",

    // OSF
    nombre_osf: "",
    razon_osf: "",
    poblacion_osf: "",
    num_beneficiarios_osf: "",
    ods_osf: "",
    telefono_osf: "",
    datos_osf: "",
    contacto_coordinador: "",
    redes_sociales: "",

    // proyecto
    nombre_proyecto: "",
    nomenclatura_registro: "",
    diagnostico_previo: false,
    problema_social: "",
    vulnerabilidad_atendida_1: "",
    edad_poblacion_1: "",
    vulnerabilidad_atendida_2: "",
    edad_poblacion_2: "",
    zona_poblacion: "",
    numero_beneficiarios_proyecto: "",
    objetivo_proyecto: "",
    ods_proyecto_1: "",
    ods_proyecto_2: "",
    acciones_estudiantado: "",
    producto_servicio_entregar: "",
    entregable_esperado: "",
    medida_impacto: "",
    dias_actividades: "",
    horario_proyecto: "",
    carreras_proyecto_1: "",
    carreras_proyecto_2: "",
    habilidades_alumno: "",
    cupos_proyecto: "",
    modalidad: "",
    direccion_escrita: "",
    duracion_experiencia: "",
    valor_proyecto: "",

    // flags
    periodo_repetido: false,
    induccion_ss: false,
    propuesta_semana_tec: false,
    propuesta_inmersion_social: false,
    propuesta_bloque: false,

    indicaciones_especiales: "",
    entrevista: false,
    pregunta_descarte: "",
    enlace_maps: "",
    enlace_whatsApp: "",
    nombre_whatsApp: "",
    status_whatsapp: "Pendiente",

    carta_exclusion: "",
    anuncio_canvas: "",
    porcentaje_canvas: "",
  });

  /* ------------------------------------------------------
     Cargar catálogos al montar
  ------------------------------------------------------*/
  useEffect(() => {
    (async () => {
      try {
        const base = import.meta.env.VITE_API_URL || "http://localhost:5001";
        const [cRes, pRes, oRes, caRes] = await Promise.all([
          fetch(`${base}/campus`),
          fetch(`${base}/periodos`),
          fetch(`${base}/ods`),
          fetch(`${base}/carreras`),
        ]);

        if (!cRes.ok || !pRes.ok || !oRes.ok || !caRes.ok) {
          throw new Error("Error al cargar los catálogos");
        }

        setCampus(await cRes.json());
        setPeriodos(await pRes.json());
        setOds(await oRes.json());
        setCarreras(await caRes.json());
      } catch (e) {
        console.error(e);
        setError("No se pudieron cargar los catálogos");
      }
    })();
  }, []);

  /* ------------------------------------------------------
     Manejadores
  ------------------------------------------------------*/
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* --------------------------------------------------------
   ENVÍO DEL FORMULARIO
---------------------------------------------------------*/
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setOkMsg(null);

     // Obtener el ID del socio del localStorage
  const getIdSocio = () => {
    const token = localStorage.getItem("jwt");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return decoded.id;
      } catch (error) {
        console.error("Error al decodificar el token:", error);
        return null;
      }
    }
    return null;
  };

  try {
    /* 1 ── token e id_socio */
    const rawToken =
      localStorage.getItem("jwt") || // ← así cubres ambos nombres
      localStorage.getItem("token");

      const id_socio = getIdSocio(); // Obtener el id_socio

    if (!id_socio) {
      setError("No se pudo obtener el ID del socio.");
      return;
    }

    /* 2 ── prepara datos (multipart) */
    const formData = new FormData();
    formData.append("imagen", imagen);
    Object.entries({ ...form, id_socio, status: "pendiente" }).forEach(
      ([k, v]) => {
        // booleanos como 0/1; no envíes strings vacíos
        if (typeof v === "boolean") formData.append(k, v ? 1 : 0);
        else if (v !== "") formData.append(k, v);
      }
    );

    /* 3 ── ENVÍA al endpoint correcto */
    const res = await fetch("http://localhost:5001/proyecto", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      // intenta leer JSON; si falla, usa texto plano
      const errMsg =
        (await res.json().catch(() => ({}))).message ||
        (await res.text());
      throw new Error(errMsg || "Error al crear el proyecto");
    }

    /* 4 ── éxito */
    window.alert("¡Proyecto postulado correctamente!");
    setForm((f) => ({
      ...f,
      nombre_proyecto: "",
      objetivo_proyecto: "",
    }));
  } catch (err) {
    console.error(err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  /* ------------------------------------------------------
     Render
  ------------------------------------------------------*/
  return (
    <>
      <NavCub />
      <div className={styles.container}>
        <h1>Postular nuevo proyecto</h1>

        {error && <div className={styles.err}>{error}</div>}
        {okMsg && <div className={styles.ok}>{okMsg}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Información general */}
          <h2>Información general</h2>
          <input
            type="file"
            name="imagen"
            accept="image/*"
            onChange={e => setImagen(e.target.files[0])}
          />

          <TextInput
            label="Correo de registro"
            name="correo_registro_info"
            value={form.correo_registro_info}
            onChange={handleChange}
            required
          />
          <SelectInput
            label="Región"
            name="region_proyecto"
            value={form.region_proyecto}
            onChange={handleChange}
            options={asOptions(REGIONES)}
            required
          />
          <SelectInput
            label="Campus"
            name="id_campus"
            value={form.id_campus}
            onChange={handleChange}
            options={campus.map((c) => ({ value: c.id_campus, label: c.campus }))}
            required
          />
          <TextInput label="CRN" name="crn" value={form.crn} onChange={handleChange} />
          <TextInput label="Grupo" name="grupo" value={form.grupo} onChange={handleChange} />
          <SelectInput
            label="Clave materia"
            name="clave_materia"
            value={form.clave_materia}
            onChange={handleChange}
            options={asOptions(CLAVES_MATERIA)}
          />
          <SelectInput
            label="Periodo"
            name="id_periodo"
            value={form.id_periodo}
            onChange={handleChange}
            options={periodos.map((p) => ({ value: p.id_periodo, label: p.periodo }))}
            required
          />
          <TextInput
            label="Fecha implementación"
            name="fecha_implementacion"
            value={form.fecha_implementacion}
            onChange={handleChange}
            placeholder="YYYY-MM-DD"
          />

          {/* OSF */}
          <h2>Datos de la Organización Social (OSF)</h2>
          <TextInput
            label="Nombre OSF"
            name="nombre_osf"
            value={form.nombre_osf}
            onChange={handleChange}
            required
          />
          <TextInput
            label="Razón social OSF"
            name="razon_osf"
            value={form.razon_osf}
            onChange={handleChange}
          />
          <SelectInput
            label="Población OSF"
            name="poblacion_osf"
            value={form.poblacion_osf}
            onChange={handleChange}
            options={asOptions(POBLACIONES_OSF)}
          />
          <TextInput
            label="Número beneficiarios OSF"
            name="num_beneficiarios_osf"
            value={form.num_beneficiarios_osf}
            onChange={handleChange}
          />
          <SelectInput
            label="ODS OSF"
            name="ods_osf"
            value={form.ods_osf}
            onChange={handleChange}
            options={ods.map((o) => ({ value: o.id_ods, label: `${o.id_ods} – ${o.nombre_ods}` }))}
          />
          <TextInput
            label="Teléfono OSF"
            name="telefono_osf"
            value={form.telefono_osf}
            onChange={handleChange}
          />
          <TextInput
            label="Correo / datos OSF"
            name="datos_osf"
            value={form.datos_osf}
            onChange={handleChange}
          />
          <TextInput
            label="Contacto coordinador"
            name="contacto_coordinador"
            value={form.contacto_coordinador}
            onChange={handleChange}
          />
          <TextInput
            label="Redes sociales"
            name="redes_sociales"
            value={form.redes_sociales}
            onChange={handleChange}
          />

          {/* Descripción del proyecto */}
          <h2>Descripción del proyecto</h2>
          <TextInput
            label="Nombre del proyecto"
            name="nombre_proyecto"
            value={form.nombre_proyecto}
            onChange={handleChange}
            required
          />
          <TextInput
            label="Nomenclatura"
            name="nomenclatura_registro"
            value={form.nomenclatura_registro}
            onChange={handleChange}
          />
          <CheckboxInput
            label="¿Tiene diagnóstico previo?"
            name="diagnostico_previo"
            checked={form.diagnostico_previo}
            onChange={handleChange}
          />
          <TextInput
            label="Problema social"
            name="problema_social"
            value={form.problema_social}
            onChange={handleChange}
          />

          <SelectInput
            label="Vulnerabilidad atendida 1"
            name="vulnerabilidad_atendida_1"
            value={form.vulnerabilidad_atendida_1}
            onChange={handleChange}
            options={asOptions(VULNERABILIDADES)}
          />
          <SelectInput
            label="Edad población 1"
            name="edad_poblacion_1"
            value={form.edad_poblacion_1}
            onChange={handleChange}
            options={asOptions(EDADES_POBLACION)}
          />
          <SelectInput
            label="Vulnerabilidad atendida 2"
            name="vulnerabilidad_atendida_2"
            value={form.vulnerabilidad_atendida_2}
            onChange={handleChange}
            options={asOptions(VULNERABILIDADES)}
          />
          <SelectInput
            label="Edad población 2"
            name="edad_poblacion_2"
            value={form.edad_poblacion_2}
            onChange={handleChange}
            options={asOptions(EDADES_POBLACION)}
          />
          <SelectInput
            label="Zona"
            name="zona_poblacion"
            value={form.zona_poblacion}
            onChange={handleChange}
            options={asOptions(ZONAS)}
          />
          <TextInput
            label="Número beneficiarios proyecto"
            name="numero_beneficiarios_proyecto"
            value={form.numero_beneficiarios_proyecto}
            onChange={handleChange}
          />
          <TextInput
            label="Objetivo del proyecto"
            name="objetivo_proyecto"
            value={form.objetivo_proyecto}
            onChange={handleChange}
            required
          />

          <SelectInput
            label="ODS proyecto 1"
            name="ods_proyecto_1"
            value={form.ods_proyecto_1}
            onChange={handleChange}
            options={ods.map((o) => ({ value: o.id_ods, label: `${o.id_ods} – ${o.nombre_ods}` }))}
          />
          <SelectInput
            label="ODS proyecto 2"
            name="ods_proyecto_2"
            value={form.ods_proyecto_2}
            onChange={handleChange}
            options={ods.map((o) => ({ value: o.id_ods, label: `${o.id_ods} – ${o.nombre_ods}` }))}
          />

          <TextInput
            label="Acciones del estudiantado"
            name="acciones_estudiantado"
            value={form.acciones_estudiantado}
            onChange={handleChange}
          />
          <TextInput
            label="Producto / servicio a entregar"
            name="producto_servicio_entregar"
            value={form.producto_servicio_entregar}
            onChange={handleChange}
          />
          <TextInput
            label="Entregable esperado"
            name="entregable_esperado"
            value={form.entregable_esperado}
            onChange={handleChange}
          />
          <TextInput
            label="Medida de impacto"
            name="medida_impacto"
            value={form.medida_impacto}
            onChange={handleChange}
          />

          <SelectInput
            label="Días de actividades"
            name="dias_actividades"
            value={form.dias_actividades}
            onChange={handleChange}
            options={asOptions(DIAS_ACTIVIDADES)}
          />
          <TextInput
            label="Horario del proyecto"
            name="horario_proyecto"
            value={form.horario_proyecto}
            onChange={handleChange}
          />

          <SelectInput
            label="Carreras proyecto 1"
            name="carreras_proyecto_1"
            value={form.carreras_proyecto_1}
            onChange={handleChange}
            options={carreras.map((c) => ({ value: c.id_carrera, label: c.nombre ?? c.siglas_carrera ?? `Carrera ${c.id_carrera}` }))}
          />
          <SelectInput
            label="Carreras proyecto 2"
            name="carreras_proyecto_2"
            value={form.carreras_proyecto_2}
            onChange={handleChange}
            options={carreras.map((c) => ({ value: c.id_carrera, label: c.nombre ?? c.siglas_carrera ?? `Carrera ${c.id_carrera}` }))}
          />

          <TextInput
            label="Habilidades del alumno"
            name="habilidades_alumno"
            value={form.habilidades_alumno}
            onChange={handleChange}
          />
          <TextInput
            label="Cupos proyecto"
            name="cupos_proyecto"
            type="number"
            value={form.cupos_proyecto}
            onChange={handleChange}
          />
          <SelectInput
            label="Modalidad"
            name="modalidad"
            value={form.modalidad}
            onChange={handleChange}
            options={asOptions(MODALIDADES)}
          />
          <TextInput
            label="Dirección escrita"
            name="direccion_escrita"
            value={form.direccion_escrita}
            onChange={handleChange}
          />
          <SelectInput
            label="Duración experiencia"
            name="duracion_experiencia"
            value={form.duracion_experiencia}
            onChange={handleChange}
            options={asOptions(DURACIONES)}
          />
          <SelectInput
            label="Valor proyecto"
            name="valor_proyecto"
            value={form.valor_proyecto}
            onChange={handleChange}
            options={asOptions(VALORES_PROYECTO)}
          />

          {/* Flags */}
          <CheckboxInput
            label="¿Periodo repetido?"
            name="periodo_repetido"
            checked={form.periodo_repetido}
            onChange={handleChange}
          />
          <CheckboxInput
            label="¿Inducción SS?"
            name="induccion_ss"
            checked={form.induccion_ss}
            onChange={handleChange}
          />
          <CheckboxInput
            label="¿Propuesta semana Tec?"
            name="propuesta_semana_tec"
            checked={form.propuesta_semana_tec}
            onChange={handleChange}
          />
          <CheckboxInput
            label="¿Propuesta inmersión social?"
            name="propuesta_inmersion_social"
            checked={form.propuesta_inmersion_social}
            onChange={handleChange}
          />
          <CheckboxInput
            label="¿Propuesta bloque?"
            name="propuesta_bloque"
            checked={form.propuesta_bloque}
            onChange={handleChange}
          />

          <TextInput
            label="Indicaciones especiales"
            name="indicaciones_especiales"
            value={form.indicaciones_especiales}
            onChange={handleChange}
          />
          <CheckboxInput
            label="¿Requiere entrevista?"
            name="entrevista"
            checked={form.entrevista}
            onChange={handleChange}
          />
          <TextInput
            label="Pregunta de descarte"
            name="pregunta_descarte"
            value={form.pregunta_descarte}
            onChange={handleChange}
          />

          <TextInput
            label="Enlace Google Maps"
            name="enlace_maps"
            value={form.enlace_maps}
            onChange={handleChange}
          />
          <TextInput
            label="Enlace WhatsApp"
            name="enlace_whatsApp"
            value={form.enlace_whatsApp}
            onChange={handleChange}
          />
          <TextInput
            label="Nombre WhatsApp"
            name="nombre_whatsApp"
            value={form.nombre_whatsApp}
            onChange={handleChange}
          />

          <TextInput
            label="Carta de exclusión (URL)"
            name="carta_exclusion"
            value={form.carta_exclusion}
            onChange={handleChange}
          />
          <TextInput
            label="Anuncio Canvas"
            name="anuncio_canvas"
            value={form.anuncio_canvas}
            onChange={handleChange}
          />
          <TextInput
            label="% Canvas"
            name="porcentaje_canvas"
            value={form.porcentaje_canvas}
            onChange={handleChange}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Enviando…" : "Postular proyecto"}
          </button>
        </form>
      </div>
    </>
  );
}
