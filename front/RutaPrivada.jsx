// front/src/components/RutaPrivada.jsx
import { Navigate } from 'react-router-dom';

const RutaPrivada = ({ children, rolPermitido }) => {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');

  if (!token) return <Navigate to="/login" />;

  if (rolPermitido && rol !== rolPermitido) {
    // Opcional: redirigir si el rol no coincide
    return <Navigate to="/login" />;
  }

  return children;
};

export default RutaPrivada;

