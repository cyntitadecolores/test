import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import NavCub from "../componentes/navegacionS";
import styles from "./PostularProyectoS.module.css";

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
    <label htmlFor={name}>{label}</label>
    <input
      id={name}
      type="text"
      name={name}
      value={value || ""}
      onChange={onChange}
      {...props}
      className={styles.input}
    />
  </div>
);

// Nuevo componente para textareas (textos largos)
const TextAreaInput = ({ label, name, value, onChange, ...props }) => (
  <div className={styles.field}>
    <label htmlFor={name}>{label}</label>
    <textarea
      id={name}
      name={name}
      value={value || ""}
      onChange={onChange}
      {...props}
      className={styles.textarea}
    />
  </div>
);

const SelectInput = ({ label, name, value, options, onChange, ...props }) => (
  <div className={styles.field}>
    <label htmlFor={name}>{label}</label>
    <select
      id={name}
      name={name}
      value={value || ""}
      onChange={onChange}
      {...props}
      className={styles.select}
    >
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
    <label htmlFor={name}>
      <input
        id={name}
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
  const [imagen, setImagen] = useState(null); // archivo seleccionado
  const [ods, setOds] = useState([]);
  const [carreras, setCarreras] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [okMsg, setOkMsg] = useState(null);

  // Todos los campos del formulario
  const [form, setForm] = useState({
    // encabezado
    fecha_implementacion: "",

    // proyecto
    nombre_proyecto: "",
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

    entrevista: false,
    pregunta_descarte: "",
    enlace_maps: "",
  });

  /* ------------------------------------------------------
     Cargar catálogos al montar
  ------------------------------------------------------*/
  useEffect(() => {
    (async () => {
      try {
        const base = import.meta.env.VITE_API_URL || "http://localhost:5001";
        const [oRes, caRes] = await Promise.all([
          fetch(`${base}/ods`),
          fetch(`${base}/carreras`),
        ]);

        if (!oRes.ok || !caRes.ok) {
          throw new Error("Error al cargar los catálogos");
        }

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
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          console.log("ID socio extraído del token:", decoded.id || decoded.id_socio || decoded.userId);
          return decoded.id || decoded.id_socio || decoded.userId;
        } catch (error) {
          console.error("Error al decodificar el token:", error);
          return null;
        }
      }
      return null;
    };

    try {
      /* 1 ── token e id_socio */
      const id_socio = getIdSocio();

      if (!id_socio) {
        setError("No se pudo obtener el ID del socio.");
        return;
      }

      /* 2 ── prepara datos (multipart) */
      const formData = new FormData();
      if (imagen) formData.append("imagen", imagen);
      Object.entries({ ...form, id_socio, status_proyecto: "En revisión" }).forEach(
        ([k, v]) => {
          // booleanos como 0/1; no envíes strings vacíos
          if (typeof v === "boolean") formData.append(k, v ? 1 : 0);
          else if (v !== "") formData.append(k, v);
        }
      );

      // --- Validar Fecha Implementación ---
      if (!form.fecha_implementacion) {
        window.alert("La Fecha de implementación es obligatoria.");
        setLoading(false);
        return;
      }
      // Validar formato YYYY-MM-DD con regex simple
      if (!/^\d{4}-\d{2}-\d{2}$/.test(form.fecha_implementacion)) {
        window.alert("La Fecha de implementación debe tener el formato YYYY-MM-DD.");
        setLoading(false);
        return;
      }
      // Validar que sea una fecha válida
      const fecha = new Date(form.fecha_implementacion);
      if (isNaN(fecha.getTime())) {
        window.alert("La Fecha de implementación no es una fecha válida.");
        setLoading(false);
        return;
      }

      // --- Validar Producto o Servicio a entregar ---
      if (!form.producto_servicio_entregar) {
        window.alert("El campo 'Producto o Servicio a entregar' es obligatorio.");
        setLoading(false);
        return;
      }
      if (form.producto_servicio_entregar.length > 30) {
        window.alert("El campo 'Producto o Servicio a entregar' debe tener máximo 30 caracteres.");
        setLoading(false);
        return;
      }

      // --- Validar Entregable esperado ---
      if (!form.entregable_esperado) {
        window.alert("El campo 'Entregable esperado' es obligatorio.");
        setLoading(false);
        return;
      }
      if (form.entregable_esperado.length > 200) {
        window.alert("El campo 'Entregable esperado' debe tener máximo 200 caracteres.");
        setLoading(false);
        return;
      }

      // --- Validar Dirección Escrita si modalidad es PRESENCIAL o MIXTA ---
      if (
        form.modalidad &&
        (form.modalidad.toLowerCase().includes("presencial") ||
        form.modalidad.toLowerCase().includes("mixto"))
      ) {
        if (!form.direccion_escrita || form.direccion_escrita.trim() === "") {
          setError("La Dirección escrita es obligatoria para modalidades PRESENCIALES o MIXTAS.");
          setLoading(false);
          return;
        }
      }

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
          <fieldset className={styles.fieldset}>
            <legend>Información general</legend>

            <div className={styles.field}>
              <label htmlFor="imagen">Imagen del proyecto</label>
              <input
                id="imagen"
                type="file"
                name="imagen"
                accept="image/*"
                onChange={e => setImagen(e.target.files[0])}
              />
            </div>

            <TextInput
              label="Fecha implementación"
              name="fecha_implementacion"
              value={form.fecha_implementacion}
              onChange={handleChange}
              placeholder="YYYY-MM-DD"
            />
          </fieldset>

          {/* Descripción del proyecto */}
          <fieldset className={styles.fieldset}>
            <legend>Descripción del proyecto</legend>

            <TextInput
              label="Nombre del Proyecto Solidario"
              name="nombre_proyecto"
              value={form.nombre_proyecto}
              onChange={handleChange}
              required
            />

            <TextAreaInput
              label="Describa el problema social específico que atenderá el estudiantado"
              name="problema_social"
              value={form.problema_social}
              onChange={handleChange}
            />

            <SelectInput
              label="Tipo de vulnerabilidad de la población atendida en este proyecto"
              name="vulnerabilidad_atendida_1"
              value={form.vulnerabilidad_atendida_1}
              onChange={handleChange}
              options={asOptions(VULNERABILIDADES)}
            />
            <SelectInput
              label="Rango de edad de la población atendida en este proyecto"
              name="edad_poblacion_1"
              value={form.edad_poblacion_1}
              onChange={handleChange}
              options={asOptions(EDADES_POBLACION)}
            />
            <SelectInput
              label="4.3 Otro tipo de vulnerabilidad de la población atendida:"
              name="vulnerabilidad_atendida_2"
              value={form.vulnerabilidad_atendida_2}
              onChange={handleChange}
              options={asOptions(VULNERABILIDADES)}
            />
            <SelectInput
              label="4.4 Otro rango de edad de la población atendida:"
              name="edad_poblacion_2"
              value={form.edad_poblacion_2}
              onChange={handleChange}
              options={asOptions(EDADES_POBLACION)}
            />
            <SelectInput
              label="Zona a la que pertenece la población atendida"
              name="zona_poblacion"
              value={form.zona_poblacion}
              onChange={handleChange}
              options={asOptions(ZONAS)}
            />
            <TextInput
              label="Número aproximado de beneficiarios que estarán en contacto con el estudiantado o que se verán beneficiados durante la realización de ESTE Proyecto Solidario"
              name="numero_beneficiarios_proyecto"
              value={form.numero_beneficiarios_proyecto}
              onChange={handleChange}
            />
            <TextInput
              label="Objetivo General del Proyecto Solidario"
              name="objetivo_proyecto"
              value={form.objetivo_proyecto}
              onChange={handleChange}
              required
            />

            <h4>Seleccione 2 Objetivos de Desarrollo Sostenible que se impactarán CON ESTE Proyecto Solidario.</h4>
            <SelectInput
              label="ODS 1"
              name="ods_proyecto_1"
              value={form.ods_proyecto_1}
              onChange={handleChange}
              options={ods.map((o) => ({
                value: o.id_ods,
                label: `${o.id_ods} – ${o.nombre_ods}`,
              }))}
            />
            <SelectInput
              label="ODS 2"
              name="ods_proyecto_2"
              value={form.ods_proyecto_2}
              onChange={handleChange}
              options={ods.map((o) => ({
                value: o.id_ods,
                label: `${o.id_ods} – ${o.nombre_ods}`,
              }))}
            />

            <TextAreaInput
              label={`ENLISTE y describe de forma breve LAS PRINCIPALES ACTIVIDADES/ACCIONES a realizar 
por parte del estudiantado durante el Proyecto Solidario (máximo 200 caracteres), ejemplo: *

1.- Actividad principal 1
2.- Actividad principal 2
3.- Actividad principal 3

Recuerde que estas, deben propiciar la convivencia entre la organización, los beneficiarios y el estudiante y deben ser en pro de la atención a una necesidad social.`}
              name="acciones_estudiantado"
              value={form.acciones_estudiantado}
              onChange={handleChange}
            />

            <TextInput
              label="Producto o Servicio a entregar. (Máximo 30 caracteres)"
              name="producto_servicio_entregar"
              value={form.producto_servicio_entregar}
              onChange={handleChange}
            />
            <TextInput
              label="Mencione y describa el entregable que se espera que realice el estudiantado para la OSF Producto, Servicio o Resultado del Servicio. (Máximo 200 caracteres)"
              name="entregable_esperado"
              value={form.entregable_esperado}
              onChange={handleChange}
            />
            <TextInput
              label="Descripción de manera general cómo medirán el impacto social (Por ejemplo: número de personas beneficiadas, cambio esperado en la comunidad, antes y después, etc.)"
              name="medida_impacto"
              value={form.medida_impacto}
              onChange={handleChange}
            />

            <SelectInput
              label={`Coloque aquí el día o días de la semana en que deberá llevar a cabo las actividades. EJEMPLO de horario de un Proyecto Solidario MIXTO

Asistencia presencial: 2 veces por semana
Asistencia remota: 1 vez por semana
Días presenciales: Lunes y martes (puede cambiar en acuerdo con la OSF)
Días remotos: Viernes (inamovible)
Horas por día: 3 horas (Ya sea presencial o remoto)
Rango de horarios ya sea presencia o remoto:
Matutino: entre 9:00 am y 2:00 pm
Vespertino: entre 2:00 pm y 5:00 pm`}
              name="dias_actividades"
              value={form.dias_actividades}
              onChange={handleChange}
              options={asOptions(DIAS_ACTIVIDADES)}
            />
            <TextInput
              label="Si aplica, Indique el horario: de _________ a _______. (Ejemplo: lunes a viernes de 8 am a 12 pm)"
              name="horario_proyecto"
              value={form.horario_proyecto}
              onChange={handleChange}
            />

            <h4>Carreras (se despliega el nombre de la carrera y las siglas)</h4>
            <SelectInput
              label="Carreras 1"
              name="carreras_proyecto_1"
              value={form.carreras_proyecto_1}
              onChange={handleChange}
              options={carreras.map((c) => ({
                value: c.id_carrera,
                label: c.nombre ?? c.siglas_carrera ?? `Carrera ${c.id_carrera}`,
              }))}
            />
            <SelectInput
              label="Carreras 2"
              name="carreras_proyecto_2"
              value={form.carreras_proyecto_2}
              onChange={handleChange}
              options={carreras.map((c) => ({
                value: c.id_carrera,
                label: c.nombre ?? c.siglas_carrera ?? `Carrera ${c.id_carrera}`,
              }))}
            />

            <TextInput
              label="Habilidades o competencias que el alumno requiere para participar en el proyecto"
              name="habilidades_alumno"
              value={form.habilidades_alumno}
              onChange={handleChange}
            />
            <TextInput
              label="Cupo de estudiantes: Colocar el número de estudiantes que pueden participar en la experiencia"
              name="cupos_proyecto"
              type="number"
              value={form.cupos_proyecto}
              onChange={handleChange}
            />
            <SelectInput
              label="Modalidad en que se llevará a cabo el proyecto solidario"
              name="modalidad"
              value={form.modalidad}
              onChange={handleChange}
              options={asOptions(MODALIDADES)}
            />
            <TextInput
              label="DIRECCIÓN ESCRITA en donde trabajará el estudiantado (sólo para actividades PRESENCIALES o MIXTAS)"
              name="direccion_escrita"
              value={form.direccion_escrita}
              onChange={handleChange}
            />
            <SelectInput
              label={`Duración del proyecto:
5 semanas 
10 semanas
15 semanas`}
              name="duracion_experiencia"
              value={form.duracion_experiencia}
              onChange={handleChange}
              options={asOptions(DURACIONES)}
            />
            <SelectInput
              label="Valor o actitud que promueve en el estudiantado con las acciones a llevar a cabo"
              name="valor_proyecto"
              value={form.valor_proyecto}
              onChange={handleChange}
              options={asOptions(VALORES_PROYECTO)}
            />
          </fieldset>

          {/* Flags */}
          <fieldset className={styles.fieldset}>
            <legend>Propuestas y procesos</legend>

            <CheckboxInput
              label="¿Es Proyecto Solidario repetido de periodos anteriores? (Sí/No)?"
              name="periodo_repetido"
              checked={form.periodo_repetido}
              onChange={handleChange}
            />
            <CheckboxInput
              label="¿El Proyecto Solidario surgió de una propuesta de Inducción de Servicio Social? (Sí/No)"
              name="induccion_ss"
              checked={form.induccion_ss}
              onChange={handleChange}
            />
            <CheckboxInput
              label="¿El Proyecto Solidario surgió de una propuesta de Semana Tec con Sentido Humano? (Sí/No)"
              name="propuesta_semana_tec"
              checked={form.propuesta_semana_tec}
              onChange={handleChange}
            />
            <CheckboxInput
              label="¿El Proyecto Solidario surgió de una propuesta de Inmersión Social? (Sí/No)"
              name="propuesta_inmersion_social"
              checked={form.propuesta_inmersion_social}
              onChange={handleChange}
            />
            <CheckboxInput
              label="¿El Proyecto Solidario surgió de una propuesta de Bloque/Concentración con Sentido Humano? (Sí/No)"
              name="propuesta_bloque"
              checked={form.propuesta_bloque}
              onChange={handleChange}
            />
            <CheckboxInput
              label="¿Les gustaría realizar un PROCESO DE SELECCIÓN/ENTREVISTA para definir la participación de lxs alumnxs en este proyecto?"
              name="entrevista"
              checked={form.entrevista}
              onChange={handleChange}
            />
            <TextAreaInput
              label="Si la respuesta anterior fue “SI”, escriba por favor la “pregunta de descarte”. Esta pregunta tiene la intención de facilitar la elección del alumno, para una posible entrevista. Sugerimos preguntas que requieran una respuesta abierta para identificar el interés de participar en el proyecto."
              name="pregunta_descarte"
              value={form.pregunta_descarte}
              onChange={handleChange}
            />
            <TextInput
              label="ENLACE DE MAPS en donde trabajará el estudiantado (sólo para actividades PRESENCIALES o MIXTAS)"
              name="enlace_maps"
              value={form.enlace_maps}
              onChange={handleChange}
            />
          </fieldset>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? "Enviando…" : "Postular proyecto"}
          </button>
        </form>
      </div>
    </>
  );
}
