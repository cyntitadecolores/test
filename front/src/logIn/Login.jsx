import { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import "./Login.css";
import { toast } from 'react-toastify';


export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
  try {
    const res = await fetch('http://localhost:5002/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: email, contraseña: password })
    });

    const data = await res.json();

    if (res.ok) {
      console.log('✅ Usuario autenticado:', data);

      // Almacenar el token en localStorage
      localStorage.setItem('jwt', data.token); // Almacena el JWT
      toast.success("¡Inicio de sesión exitoso!");

      if (data.tipo === 'estudiante') navigate('/inicioE');
      else if (data.tipo === 'administrador') navigate('/');
      else if (data.tipo === 'socio') navigate('/inicioS');
    } else {
      toast.error(data.message || "Error al iniciar sesión");
    }
  } catch (error) {
    console.error("Error en login:", error);
    toast.error("Error de red");
  }
};


  return (
    <div className="login-container">
      <div className="login-form-box">
        <h1 className="title">Iniciar Sesion</h1>

        <div className="input-group">
          <label>Correo</label>
          <div className="input-box">
            <img src="/src/assets/correo-electronico.png" alt="Email" className="icon" />
            <input
              type="email"
              placeholder="correo@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="input-group">
          <label>Contraseña</label>
          <div className="input-box">
            <img src="/src/assets/candado.png" alt="Password" className="icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Introduce tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="toggle-btn" onClick={() => setShowPassword(!showPassword)}>
              <img src={showPassword ? "/src/assets/ojo.png" : "/src/assets/ojo (1).png"} alt="Mostrar" className="icon" />
            </button>
          </div>
        </div>

        <button className="signup-btn" onClick={handleLogin}>Iniciar sesión</button>

        <p className="login-text">- o -</p>
        <p className="login-text">
          ¿No tienes una cuenta? <Link to="/crearCuenta">Crear </Link>
        </p>
      </div>
    </div>
  );
}
