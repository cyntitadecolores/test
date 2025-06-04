import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import logo from './assets/logo_servicio.png';
import { toast } from 'react-toastify';


const Login = () => {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5002/login', { correo, contraseña });
      const { rol, token, status } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('rol', rol);
      if (status) localStorage.setItem('status', status);

      if (rol === 'estudiante') navigate('/inicioE');
      else if (rol === 'administrador') navigate('/');
      else if (rol === 'socio') navigate('/inicioS');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <form onSubmit={handleLogin} className="login-form">
          <div className="login-header">
            <img src={logo} alt="Logo Servicio Social" className="login-icon" />
          </div>
          <h2>Inicia sesión</h2>
          <label>Correo *</label>
          <input
            type="email"
            placeholder="Introduce tu correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
          &nbsp;
          <label>Contraseña *</label>
          <input
            type="password"
            placeholder="Introduce tu contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
          />
          <button type="submit">ENTRAR</button>
          <div className="login-links">
            <Link to="/crearCuenta">¿No tienes una cuenta?</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;