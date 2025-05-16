import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./Login.css";

const formDataInicial = {
  // Globales
  nombre: '', 
  correo: '', 
  contraseña: '', 
  confirmarContraseña: '',

  // Estudiante
  id_carrera: '', 
  id_campus: '', 
  matricula: '', 
  semestre: '1',
  telefono: '',
  doble_titulacion: false, 
  candidato_graduar: false, 

  // Socio
  nombre_socio: '',
  telefono_osf: '',
  nombre_osf: '', 
  vision: '', 
  mision: '', 
  objetivos: '', 
  poblacion_osf: '',
  num_beneficiarios_osf: '', 
  id_ods: '', 
  nombre_representante: '', 
  puesto_representante: '', 
  redes_sociales: '',
  direccion_horario: '', 
  notificaciones: false, 
  ine: '', 
  logo: ''
};

const Signup = () => {
  const [loading, setLoading] = useState(false); // Para el estado loading del botón de enviar

  const [tipo, setTipo] = useState(''); // Estados para guardar el tipo de usuario
  const [perfilSocio, setPerfilSocio] = useState(''); // Estado para guardar el tipo de socio

  const navigate = useNavigate(); // Para navegar al login

  // Estados para guardar listas que se obtienen del backend
  const [campusList, setCampusList] = useState([]); 
  const [carrerasList, setCarrerasList] = useState([]);
  const [odsList, setOdsList] = useState([]);
  const [poblaciones, setPoblaciones] = useState([]);

  // Estado para manejar todos los datos del formulario
  const [formData, setFormData] = useState(formDataInicial);

  // useEffect se ejecuta una vez al cargar el componente
  useEffect(() => {
    // Carga los campus desde el backend

    axios.get('http://localhost:5002/campus')
      .then(res => setCampusList(res.data))
      .catch(err => console.error('Error al cargar campus:', err));

    // Carga las carreras
    axios.get('http://localhost:5002/carreras')
      .then(res => setCarrerasList(res.data))
      .catch(err => console.error('Error al cargar carreras:', err));

    // Carga los ODS
    axios.get('http://localhost:5002/ods')
      .then(res => setOdsList(res.data))
      .catch(err => console.error('Error al cargar ODS:', err));

    // Carga las poblaciones desde el ENUM de la tabla

    axios.get('http://localhost:5002/poblaciones')
      .then(res => setPoblaciones(res.data))
      .catch(err => console.error('Error al cargar poblaciones:', err));
  }, []);

  // Limpia el formulario cuando se cambia el tipo de cuenta o el tipo de socio
  useEffect(() => {
    setFormData(formDataInicial);
  }, [tipo, perfilSocio]);

  // Maneja el cambio de cualquier input del formulario
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Maneja cambios en checkboxes con valores booleanos
  const handleCheckbox = (name, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita recarga de página

    // Validar contraseñas coincidan
    if (formData.contraseña !== formData.confirmarContraseña) {
      alert('Las contraseñas no coinciden');
      return;
    }

    const isPhoneValid = phone => /^[0-9]{10}$/.test(phone);

    // Validar el telefono del estudiante
    if (tipo === 'estudiante' && !isPhoneValid(formData.telefono)) {
      alert('El número de teléfono del estudiante debe tener 10 dígitos numéricos');
      return;
    }

    // Validar el telefono del socio
    if (tipo === 'socio' && !isPhoneValid(formData.telefono_osf)) {
      alert('El número de teléfono del socio debe tener 10 dígitos numéricos');
      return;
    }

    if (tipo === 'estudiante') {
      if (!formData.id_carrera || !formData.id_campus) {
        alert('Por favor selecciona una carrera y un campus');
        return;
      }
    }

    if (tipo === 'socio' && ['civil', 'gubernamental', 'empresa'].includes(perfilSocio)) {
      if (!formData.id_ods || !formData.poblacion_osf) {
        alert('Por favor selecciona un ODS y una población objetivo');
        return;
      }
    }

    setLoading(true); // Comienza la carga

    try {

      const res = await axios.post('http://localhost:5002/signup', {
        tipo,
        perfilSocio,
        ...formData,
        candidato_graduar: !!formData.candidato_graduar,
        notificaciones: !!formData.notificaciones
      });

      alert(res.data.mensaje || 'Registro exitoso');
      setFormData(formDataInicial);
      setTipo('');
      setPerfilSocio('');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al registrar');
    } finally {
      setLoading(false); // Finaliza la carga
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Crear cuenta</h2>

      {/* Selección del tipo de cuenta */}
      <label>¿Qué tipo de cuenta deseas crear?</label>
      <select value={tipo} onChange={(e) => setTipo(e.target.value)} required>
        <option value="">Selecciona una opción</option>
        <option value="estudiante">Estudiante</option>
        <option value="socio">Socio formador</option>
      </select>
      <br />

      {/* Campos para estudiante */}
      {tipo === 'estudiante' && (
        <>
          <input name="nombre" placeholder="Nombre completo" value={formData.nombre} onChange={handleChange} required />
          <input name="correo" type="email" placeholder="Correo" value={formData.correo} onChange={handleChange} required />
          <input name="contraseña" type="password" placeholder="Contraseña" value={formData.contraseña} onChange={handleChange} required />
          <input name="confirmarContraseña" type="password" placeholder="Confirmar contraseña" value={formData.confirmarContraseña} onChange={handleChange} required />
          {formData.confirmarContraseña && formData.contraseña !== formData.confirmarContraseña && (
            <p style={{ color: 'red' }}>Las contraseñas no coinciden</p>
          )}
          <input name="matricula" placeholder="Matrícula" value={formData.matricula} onChange={handleChange} required />

          {/* Selección del semestre */}
          <label>Semestre:</label>
          <select name="semestre" value={formData.semestre} onChange={handleChange}>
            {[...Array(12).keys()].map(i => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>

          {/* Checkboxes */}
          <label>
            <input type="checkbox" checked={formData.doble_titulacion}
              onChange={e => handleCheckbox('doble_titulacion', e.target.checked)} /> ¿Doble titulación?
          </label>

          <label>
            <input type="checkbox" checked={formData.candidato_graduar}
              onChange={e => handleCheckbox('candidato_graduar', e.target.checked)} /> ¿Candidato a graduar?
          </label>

          {/* Teléfono con validación */}
          <input
            name="telefono"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={handleChange}
            required
          />
          {formData.telefono && !/^[0-9]{10}$/.test(formData.telefono) && (
            <p style={{ color: 'red' }}>El número debe tener exactamente 10 dígitos numéricos</p>
          )}

          {/* Selección de carrera y campus */}
          <label>Carrera:</label>
          <select name="id_carrera" value={formData.id_carrera} onChange={handleChange} required>
            <option value="">Selecciona una carrera</option>
            {carrerasList.filter(c => c.id_carrera !== 1 && c.id_carrera !== 44).map(c => (
              <option key={c.id_carrera} value={c.id_carrera}>{c.siglas_carrera || c.nombre}</option>
            ))}
          </select>

          <label>Campus:</label>
          <select name="id_campus" value={formData.id_campus} onChange={handleChange} required>
            <option value="">Selecciona un campus</option>
            {campusList.map(c => (
              <option key={c.id_campus} value={c.id_campus}>{c.campus}</option>
            ))}
          </select>
        </>
      )}

      {/* Campos para socio formador */}
      {tipo === 'socio' && (
        <>
          {/* Perfil de socio */}
          <label>¿Qué perfil describe mejor a tu organización?</label>
          <select value={perfilSocio} onChange={(e) => setPerfilSocio(e.target.value)} required>
            <option value="">Selecciona un perfil</option>
            <option value="lider">Soy Estudiante "Líder Social"</option>
            <option value="civil">Organización civil/Fundación/Asociación</option>
            <option value="gubernamental">Organismo gubernamental</option>
            <option value="empresa">Empresa social</option>
          </select>

          {/* Formulario general Socio */}
          <input name="correo" type="email" placeholder="Correo" value={formData.correo} onChange={handleChange} required />
          <input name="contraseña" type="password" placeholder="Contraseña" value={formData.contraseña} onChange={handleChange} required />
          <input name="confirmarContraseña" type="password" placeholder="Confirmar contraseña" value={formData.confirmarContraseña} onChange={handleChange} required />
          {formData.confirmarContraseña && formData.contraseña !== formData.confirmarContraseña && (
            <p style={{ color: 'red' }}>Las contraseñas no coinciden</p>
          )}

          {/* Teléfono con validación */}
          <input
            name="telefono_osf"
            placeholder="Teléfono del socio"
            value={formData.telefono_osf}
            onChange={handleChange}
            required
          />
          {formData.telefono_osf && !/^[0-9]{10}$/.test(formData.telefono_osf) && (
            <p style={{ color: 'red' }}>El número debe tener exactamente 10 dígitos numéricos</p>
          )}

          {['civil', 'gubernamental', 'empresa'].includes(perfilSocio) && (
            <>
              <input name="nombre_osf" placeholder="Nombre oficial de la OSF" value={formData.nombre_osf} onChange={handleChange} required />
              <input name="vision" placeholder="Visión" value={formData.vision} onChange={handleChange} required />
              <input name="mision" placeholder="Misión" value={formData.mision} onChange={handleChange} required />
              <input name="objetivos" placeholder="Objetivos" value={formData.objetivos} onChange={handleChange} required />

              <label>Población que atiende:</label>
              <select name="poblacion_osf" value={formData.poblacion_osf} onChange={handleChange} required>
                <option value="">Selecciona una opción</option>
                {poblaciones.map((pob, i) => (
                  <option key={i} value={pob}>{pob}</option>
                ))}
              </select>

              <input name="num_beneficiarios_osf" placeholder="Número aproximado de beneficiarios" value={formData.num_beneficiarios_osf} onChange={handleChange} required />

              <label>ODS relacionado:</label>
              <select name="id_ods" value={formData.id_ods} onChange={handleChange} required>
                <option value="">Selecciona un ODS</option>
                {odsList.map(ods => (
                  <option key={ods.id_ods} value={ods.id_ods}>{ods.nombre_ods}</option>
                ))}
              </select>

              <input name="nombre_representante" placeholder="Nombre del representante" value={formData.nombre_representante} onChange={handleChange} required />
              <input name="puesto_representante" placeholder="Puesto del representante" value={formData.puesto_representante} onChange={handleChange} required />
              <input name="direccion_horario" placeholder="Dirección y horario de la entidad" value={formData.direccion_horario} onChange={handleChange} required />

              <label>
                <input type="checkbox" checked={formData.notificaciones}
                  onChange={e => handleCheckbox('notificaciones', e.target.checked)} /> ¿Deseas recibir notificaciones?
              </label>
            </>
          )}

          {perfilSocio === 'lider' && (
            <>
              <input name="nombre_socio" placeholder="Nombre completo" value={formData.nombre_socio} onChange={handleChange} required />

              <label>Carrera:</label>
              <select name="id_carrera" value={formData.id_carrera} onChange={handleChange} required>
                <option value="">Selecciona una carrera</option>
                {carrerasList.filter(c => c.id_carrera !== 1 && c.id_carrera !== 44).map(c => (
                  <option key={c.id_carrera} value={c.id_carrera}>{c.siglas_carrera || c.nombre}</option>
                ))}
              </select>

              <label>
                <input type="checkbox" checked={formData.notificaciones}
                  onChange={e => handleCheckbox('notificaciones', e.target.checked)} /> ¿Deseas recibir notificaciones?
              </label>

              <input name="matricula" placeholder="Matrícula" value={formData.matricula} onChange={handleChange} required />

              {/* Selección del semestre */}
              <label>Semestre:</label>
              <select name="semestre" value={formData.semestre} onChange={handleChange}>
                {[...Array(12).keys()].map(i => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>

              <input name="ine" placeholder="INE (Liga a drive)" value={formData.ine} onChange={handleChange} />
              <input name="logo" placeholder="Logo (Liga a drive)" value={formData.logo} onChange={handleChange} />
            </>
          )}
        </>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Registrando...' : 'Crear cuenta'}
      </button>
    </form>
  );
};

export default Signup;