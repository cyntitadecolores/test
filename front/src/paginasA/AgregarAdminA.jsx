import { useState } from "react";
import NavCub from '../componentes/navegacion';
import { Link } from "react-router-dom";


export default function CrearCuentaAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegistro = async () => {
    const url = "http://localhost:5001/registro/administrador";
    const body = {
      correo: email,
      contraseña: password,
      nombre,
    };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Cuenta de administrador creada exitosamente");
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (error) {
      alert("❌ Ocurrió un error al crear la cuenta");
      console.error("Error:", error);
    }
  };

  return (
    <div className="cube">
    <NavCub />
      <div className="form-box">
        <h1 className="title">Agrega un administrador</h1>

        <div className="input-group">
          <label>Correo</label>
          <input
            type="email"
            placeholder="correo@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Contraseña</label>
          <div className="input-box">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Introduce tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              className="toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              <img
                src={
                  showPassword
                    ? "/src/assets/ojo.png"
                    : "/src/assets/ojo (1).png"
                }
                alt="Mostrar"
                className="icon"
              />
            </button>
          </div>
        </div>

        <div className="input-group">
          <label>Nombre completo</label>
          <input
            type="text"
            placeholder="Tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <button className="signup-btn" onClick={handleRegistro}>
          Agregar admin
        </button>

      </div>
    </div>
  );
}
