import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5002/login', { correo, contraseña });
      const { rol, token } = res.data;
  
      console.log("TOKEN recibido:", token);  // <--- Aquí imprime el token
  
      // Decodifica el token para obtener el id y mostrarlo
      try {
        const decoded = jwtDecode(token);
        console.log("ID usuario desde token:", decoded.id || decoded.id_socio || decoded.userId);
      } catch (err) {
        console.warn("No se pudo decodificar el token:", err);
      }
  
      localStorage.setItem('token', token);
  
      if (rol === 'estudiante') navigate('/inicioE');
      else if (rol === 'administrador') navigate('/');
      else if (rol === 'socio') navigate('/inicioS');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al iniciar sesión');
    }
  };
  

  return (
    <form onSubmit={handleLogin}>
      <h2>Iniciar sesión</h2>
      <input
        type="email"
        placeholder="Correo"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={contraseña}
        onChange={(e) => setContraseña(e.target.value)}
        required
      />
      <button type="submit">Entrar</button>
    </form>
  );
};

export default Login;
