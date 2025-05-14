import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

export default function CrearCuenta() {
  const [tipoUsuario, setTipoUsuario] = useState("estudiante");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");

  // Errores generales
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorNombre, setErrorNombre] = useState("");

  // Estudiante
  const [matricula, setMatricula] = useState("");
  const [carrera, setCarrera] = useState("");
  const [campus, setCampus] = useState("");
  const [dobleTitulacion, setDobleTitulacion] = useState(false);
  const [candidatoGrado, setCandidatoGrado] = useState(false);
  const [telefono, setTelefono] = useState("");
  const [semestre, setSemestre] = useState("");

  const [errorMatricula, setErrorMatricula] = useState("");
  const [errorCarrera, setErrorCarrera] = useState("");

  // Socio general
  const [tipoSocio, setTipoSocio] = useState(""); // estudiante o entidad
  const [telefonoSocio, setTelefonoSocio] = useState("");
  const [status, setStatus] = useState("");
  const [redesSociales, setRedesSociales] = useState("");
  const [notificacionesSocio, setNotificacionesSocio] = useState(false);
  const [errorTipoSocio, setErrorTipoSocio] = useState("");

  // Socio Estudiante específico
  const [matriculaSocio, setMatriculaSocio] = useState("");
  const [semestreSocio, setSemestreSocio] = useState("");
  const [carreraS, setCarreraS] = useState("");
  const [correoInstitucional, setCorreoInstitucional] = useState("");
  const [correoAlternativo, setCorreoAlternativo] = useState("");
  const [ine, setIne] = useState("");

  // Socio Entidad específico
  const [nombreEntidad, setNombreEntidad] = useState("");
  const [mision, setMision] = useState("");
  const [vision, setVision] = useState("");
  const [objetivos, setObjetivos] = useState("");
  const [objetivoODS, setObjetivoODS] = useState("");
  const [poblacion, setPoblacion] = useState("");
  const [beneficiarios, setBeneficiarios] = useState("");
  const [nombreResponsable, setNombreResponsable] = useState("");
  const [puestoResponsable, setPuestoResponsable] = useState("");
  const [correoResponsable, setCorreoResponsable] = useState("");
  const [direccionEntidad, setDireccionEntidad] = useState("");
  const [horarioEntidad, setHorarioEntidad] = useState("");
  const [correoEntidad, setCorreoEntidad] = useState("");
  const [correoResponsableGeneral, setCorreoResponsableGeneral] = useState("");
  const [telefonoEntidad, setTelefonoEntidad] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const validarFormulario = () => {
    let esValido = true;

    setErrorEmail("");
    setErrorPassword("");
    setErrorNombre("");
    setErrorMatricula("");
    setErrorCarrera("");
    setErrorTipoSocio("");

    if (!email.includes("@")) {
      setErrorEmail("El correo no es válido.");
      esValido = false;
    }

    if (password.length < 6) {
      setErrorPassword("La contraseña debe tener al menos 6 caracteres.");
      esValido = false;
    }

    if (nombre.trim() === "") {
      setErrorNombre("El nombre no puede estar vacío.");
      esValido = false;
    }

    if (tipoUsuario === "estudiante") {
      if (matricula.trim() === "") {
        setErrorMatricula("La matrícula es obligatoria.");
        esValido = false;
      }
      if (carrera.trim() === "") {
        setErrorCarrera("La carrera es obligatoria.");
        esValido = false;
      }
    }

    if (tipoUsuario === "socio") {
      if (tipoSocio.trim() === "") {
        setErrorTipoSocio("El tipo de socio es obligatorio.");
        esValido = false;
      }
    }

    return esValido;
  };

  const handleRegistro = async () => {
    if (!validarFormulario()) return;
  
    let url = "";
    let body = {};
  
    if (tipoUsuario === "estudiante") {
      url = "http://localhost:5002/registro/alumno";
      body = {
        correo: email,
        contraseña: password,
        nombre,
        matricula,
        id_carrera: carrera,
        semestre,
        id_campus: campus,
        doble_titulacion: dobleTitulacion,
        candidato_graduar: candidatoGrado,
        telefono,
      };
    } else if (tipoUsuario === "socio") {
      if (tipoSocio === "estudiante") {
        url = "http://localhost:5002/registro/socio";
        body = {
          correo: email,
          contraseña: password,
          nombre,
          tipo_socio: "Estudiante",
          telefono_socio: telefonoSocio,
          redes_sociales: redesSociales,
          notificaciones_socio: notificacionesSocio,
          id_carrera: carreraS,
          matricula: matriculaSocio,
          semestre_acreditado: semestreSocio,
          correo_institucional: correoInstitucional,
          correo_alternativo: correoAlternativo,
          ine,
        };
      } else if (tipoSocio === "entidad") {
        url = "http://localhost:5002/registro/socio";
        body = {
          correo: email,
          contraseña: password,
          nombre,
          tipo_socio: "Entidad",
          telefono_socio: telefonoSocio,
          redes_sociales: redesSociales,
          notificaciones_socio: notificacionesSocio,
          nombre_entidad: nombreEntidad,
          mision,
          vision,
          objetivos,
          objetivo_ods_socio: objetivoODS,
          poblacion,
          numero_beneficiarios_socio: beneficiarios,
          nombre_responsable: nombreResponsable,
          puesto_responsable: puestoResponsable,
          correo_responsable: correoResponsable,
          direccion_entidad: direccionEntidad,
          horario_entidad: horarioEntidad,
          correo_entidad: correoEntidad,
          correo_responsable_general: correoResponsableGeneral,
          telefono_entidad: telefonoEntidad,
        };
      }
    }
  
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("✅ Cuenta creada exitosamente", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.error("❌ Error: " + data.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      toast.error("❌ Ocurrió un error al crear la cuenta", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error("Error:", error);
    }
  };

  return (

    <div className="login-container">
  <div className="login-form-box">
    <h1 className="title">Crear cuenta</h1>

    <label>Tipo de usuario</label>
    <select
      value={tipoUsuario}
      onChange={(e) => setTipoUsuario(e.target.value)}
    >
      <option value="estudiante">Estudiante</option>
      <option value="socio">Socio formador</option>
    </select>

    <div className="input-group">
      <label>Correo</label>
      <input
        type="email"
        placeholder="correo@gmail.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {errorEmail && <span className="error">{errorEmail}</span>}
    </div>

    <div className="input-group">
          <label>Contraseña</label>
          <div className="input-box">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>👁</button>
          </div>
          {errorPassword && <span className="error">{errorPassword}</span>}
        </div>
        

        <div className="input-group">
          <label>Nombre completo</label>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          {errorNombre && <span className="error">{errorNombre}</span>}
        </div>

        {tipoUsuario === "socio" && (
          <>
            <div className="input-group">
              <label>Tipo de socio</label>
              <select value={tipoSocio} onChange={(e) => setTipoSocio(e.target.value)}>
                <option value="">Selecciona tipo</option>
                <option value="estudiante">Socio estudiante</option>
                <option value="entidad">Socio entidad</option>
              </select>
              {errorTipoSocio && <span className="error">{errorTipoSocio}</span>}
            </div>

            <div className="input-group">
              <label>Teléfono</label>
              <input value={telefonoSocio} onChange={(e) => setTelefonoSocio(e.target.value)} />
            </div>

            <div className="input-group">
              <label>Redes Sociales</label>
              <input value={redesSociales} onChange={(e) => setRedesSociales(e.target.value)} />
            </div>

            <div className="input-group">
              <label>
                <input
                  type="checkbox"
                  checked={notificacionesSocio}
                  onChange={(e) => setNotificacionesSocio(e.target.checked)}
                />
                ¿Desea recibir notificaciones?
              </label>
            </div>

            {tipoSocio === "estudiante" && (
              <>
                <div className="input-group">
                  <label>Matrícula</label>
                  <input value={matriculaSocio} onChange={(e) => setMatriculaSocio(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Carrera</label>
                  <input value={carreraS} onChange={(e) => setCarreraS(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Correo institucional</label>
                  <input value={correoInstitucional} onChange={(e) => setCorreoInstitucional(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Correo alternativo</label>
                  <input value={correoAlternativo} onChange={(e) => setCorreoAlternativo(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Semestre acreditado</label>
                  <input value={semestreSocio} onChange={(e) => setSemestreSocio(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>INE</label>
                  <input value={ine} onChange={(e) => setIne(e.target.value)} />
                </div>
              </>
            )}

            {tipoSocio === "entidad" && (
              <>
                <div className="input-group"><label>Nombre entidad</label><input value={nombreEntidad} onChange={(e) => setNombreEntidad(e.target.value)} /></div>
                <div className="input-group"><label>Misión</label><input value={mision} onChange={(e) => setMision(e.target.value)} /></div>
                <div className="input-group"><label>Visión</label><input value={vision} onChange={(e) => setVision(e.target.value)} /></div>
                <div className="input-group"><label>Objetivos</label><input value={objetivos} onChange={(e) => setObjetivos(e.target.value)} /></div>
                <div className="input-group"><label>ODS</label><input value={objetivoODS} onChange={(e) => setObjetivoODS(e.target.value)} /></div>
                <div className="input-group"><label>Población</label><input value={poblacion} onChange={(e) => setPoblacion(e.target.value)} /></div>
                <div className="input-group"><label>No. Beneficiarios</label><input value={beneficiarios} onChange={(e) => setBeneficiarios(e.target.value)} /></div>
                <div className="input-group"><label>Responsable</label><input value={nombreResponsable} onChange={(e) => setNombreResponsable(e.target.value)} /></div>
                <div className="input-group"><label>Puesto</label><input value={puestoResponsable} onChange={(e) => setPuestoResponsable(e.target.value)} /></div>
                <div className="input-group"><label>Correo Responsable</label><input value={correoResponsable} onChange={(e) => setCorreoResponsable(e.target.value)} /></div>
                <div className="input-group"><label>Dirección</label><input value={direccionEntidad} onChange={(e) => setDireccionEntidad(e.target.value)} /></div>
                <div className="input-group"><label>Horario</label><input value={horarioEntidad} onChange={(e) => setHorarioEntidad(e.target.value)} /></div>
                <div className="input-group"><label>Correo entidad</label><input value={correoEntidad} onChange={(e) => setCorreoEntidad(e.target.value)} /></div>
                <div className="input-group"><label>Correo responsable general</label><input value={correoResponsableGeneral} onChange={(e) => setCorreoResponsableGeneral(e.target.value)} /></div>
                <div className="input-group"><label>Teléfono entidad</label><input value={telefonoEntidad} onChange={(e) => setTelefonoEntidad(e.target.value)} /></div>
              </>
            )}
          </>
        )}

        {tipoUsuario === "estudiante" && (
          <>
            <div className="input-group"><label>Matrícula</label><input value={matricula} onChange={(e) => setMatricula(e.target.value)} /></div>
            <div className="input-group"><label>Carrera</label><input value={carrera} onChange={(e) => setCarrera(e.target.value)} /></div>
            <div className="input-group"><label>Semestre</label><input type="number" value={semestre} onChange={(e) => setSemestre(e.target.value)} /></div>
            <div className="input-group"><label>Campus</label><input value={campus} onChange={(e) => setCampus(e.target.value)} /></div>
            <div className="input-group"><label>Teléfono</label><input value={telefono} onChange={(e) => setTelefono(e.target.value)} /></div>
            <div className="input-group"><label>Doble titulación</label><select value={dobleTitulacion} onChange={(e) => setDobleTitulacion(e.target.value === "true")}><option value="false">No</option><option value="true">Sí</option></select></div>
            <div className="input-group"><label>Candidato a graduar</label><select value={candidatoGrado} onChange={(e) => setCandidatoGrado(e.target.value === "true")}><option value="false">No</option><option value="true">Sí</option></select></div>
          </>
        )}

        <button className="signup-btn" onClick={handleRegistro}>Crear cuenta</button>

        <p className="login-text">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </div>
    </div>
  );
}
