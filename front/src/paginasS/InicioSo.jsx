import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import ModalPostulacion from "./ModalPostulacion";
import styles from "./InicioSo.module.css";
import NavCub from "../componentes/navegacionS";

/****************************
 * Helpers de token/ID      *
 ****************************/

function getStoredJwt() {
  return localStorage.getItem("token");
}

function getIdSocio() {
  const jwt = getStoredJwt();
  if (!jwt) return null;
  try {
    const decoded = jwtDecode(jwt);
    const id = decoded.id || decoded.id_socio || decoded.userId || null;
    if (!id) console.warn("JWT decodificado pero no contiene id_socio", decoded);
    return id;
  } catch (e) {
    console.error("Error al decodificar JWT", e);
    return null;
  }
}

/****************************
 * Hook de fetch autenticado
 ****************************/
function useAuthorizedFetch() {
  const jwt = getStoredJwt();
  return useCallback(async (endpoint, options = {}) => {
    const resp = await fetch(`http://localhost:5001${endpoint}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      ...options,
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || "Error de red");
    return data;
  }, [jwt]);
}

/****************************
 * Hook principal de datos  *
 ****************************/
function useSocioData(debug = false) {
  const idSocio = getIdSocio();
  const fetchApi = useAuthorizedFetch();

  const [postulaciones, setPostulaciones] = useState([]);
  const [inscritos, setInscritos] = useState([]);
  const [error, setError] = useState(null);
  const [modalData, setModalData] = useState(null);

  const loadPostulaciones = useCallback(async () => {
    if (!idSocio) return;
    const data = await fetchApi(`/proyecto/${idSocio}/postulados`);
    if (debug) console.log("POSTULADOS:", data);
    setPostulaciones(data);
  }, [idSocio, fetchApi, debug]);

  const loadInscritos = useCallback(async () => {
    if (!idSocio) return;
    const data = await fetchApi(`/proyecto/${idSocio}/inscritos`);
    if (debug) console.log("INSCRITOS:", data);
    setInscritos(data);
  }, [idSocio, fetchApi, debug]);

  useEffect(() => {
    if (!idSocio) {
      setError("No se encontró tu sesión. Inicia de nuevo.");
      return;
    }
    loadPostulaciones();
    loadInscritos();
  }, [idSocio, loadPostulaciones, loadInscritos]);

  const handleUpdateStatus = useCallback(
    async (id_proyecto, id_estudiante, status) => {
      await fetchApi(`/postulacion/${id_proyecto}/${id_estudiante}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });

      setPostulaciones(prev =>
        prev
          .map(p =>
            p.id_proyecto === id_proyecto
              ? { ...p, alumnos_postulados: p.alumnos_postulados.filter(al => al.id_estudiante !== id_estudiante) }
              : p
          )
          .filter(p => p.alumnos_postulados.length)
      );
      if (status === "aceptado") loadInscritos();
    },
    [fetchApi, loadInscritos]
  );

  const handleAccept = useCallback(
    async (idP, idE) => {
      try {
        await handleUpdateStatus(idP, idE, "aceptado");
      } catch (e) {
        alert(e.message); // Muestra la alerta con el mensaje del backend
      }
    },
    [handleUpdateStatus]
  );
  const handleReject = useCallback((idP, idE) => handleUpdateStatus(idP, idE, "no aceptado"), [handleUpdateStatus]);

  const handleRespuestaClick = useCallback(postulacion => {
    const { cupo_max, aceptados, alumnos_postulados, id_proyecto } = postulacion;
    const cupo_lleno = aceptados >= cupo_max;

    setModalData({
      ...alumnos_postulados[0],
      id_proyecto: id_proyecto,
      cupo_lleno: cupo_lleno, // Pasa la bandera de cupo lleno
    });
  }, []);
  const closeModal = useCallback(() => setModalData(null), []);

  return {
    postulaciones,
    inscritos,
    error,
    modalData,
    handleRespuestaClick,
    handleAccept,
    handleReject,
    closeModal,
  };
}

/****************************
 * Tabla reutilizable        *
 ****************************/
const Table = React.memo(({ headers, children }) => (
  <table className={styles.table}>
    <thead>
      <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
    </thead>
    <tbody>{children}</tbody>
  </table>
));

/****************************
 * Componente principal      *
 ****************************/
function InicioSo() {
  const navigate = useNavigate();
  const {
    postulaciones,
    inscritos,
    error,
    modalData,
    handleRespuestaClick,
    handleAccept,
    handleReject,
    closeModal,
  } = useSocioData(true); // pasa 'true' para ver logs en consola

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className="main">
      <NavCub onLogout={handleLogout} />

      <h1 className="titulo">Personas Postuladas</h1>
      {postulaciones.length ? (
        <Table headers={["Proyecto", "Nombre", "Correo", "Carrera", "Fecha", "Respuestas"]}>
          {postulaciones.map(p =>
            p.alumnos_postulados.map(est => (
              <tr key={est.id_estudiante}>
                <td>{p.nombre_proyecto}</td>
                <td>{est.estudiante_nombre}</td>
                <td>{est.estudiante_correo}</td>
                <td>{est.estudiante_carrera}</td>
                <td>{new Date(est.fecha_postulacion_estudiante).toLocaleDateString("es-MX")}</td>
                <td>
                  <button className={styles.respuestaButton} onClick={() => handleRespuestaClick(p)}>
                    Ver Respuesta
                  </button>
                </td>
              </tr>
            ))
          )}
        </Table>
      ) : (
        <p>No tienes proyectos con estudiantes postulados.</p>
      )}

      <h2 className="nontitle">Alumnos aceptados / inscritos</h2>
      {inscritos.length ? (
        <Table headers={["Proyecto", "Nombre", "Correo", "Carrera", "Fecha", "Status"]}>
          {inscritos.map(p =>
            (p.alumnos || p.alumnos_inscritos || []).map(al => (
              <tr key={al.id_estudiante}>
                <td>{p.nombre_proyecto}</td>
                <td>{al.estudiante_nombre}</td>
                <td>{al.estudiante_correo}</td>
                <td>{al.estudiante_carrera}</td>
                <td>{new Date(al.fecha_postulacion_estudiante).toLocaleDateString("es-MX")}</td>
                <td>{al.status}</td>
              </tr>
            ))
          )}
        </Table>
      ) : (
        <p>Aún no tienes alumnos aceptados o inscritos.</p>
      )}

      {modalData && (
        <ModalPostulacion
          data={modalData}
          onClose={closeModal}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}
    </div>
  );
}

export default InicioSo;

// import React, { useState, useEffect, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import ModalPostulacion from "./ModalPostulacion";
// import styles from "./InicioSo.module.css";
// import NavCub from "../componentes/navegacionS";

// /****************************
//  * Helpers de token/ID      *
//  ****************************/

// function getStoredJwt() {
//   return localStorage.getItem("token");
// }

// function getIdSocio() {
//   const jwt = getStoredJwt();
//   if (!jwt) return null;
//   try {
//     const decoded = jwtDecode(jwt);
//     const id = decoded.id || decoded.id_socio || decoded.userId || null;
//     if (!id) console.warn("JWT decodificado pero no contiene id_socio", decoded);
//     return id;
//   } catch (e) {
//     console.error("Error al decodificar JWT", e);
//     return null;
//   }
// }

// /****************************
//  * Hook de fetch autenticado
//  ****************************/
// function useAuthorizedFetch() {
//   const jwt = getStoredJwt();
//   return useCallback(async (endpoint, options = {}) => {
//     const resp = await fetch(`http://localhost:5001${endpoint}`, {
//       headers: {
//         Authorization: `Bearer ${jwt}`,
//         "Content-Type": "application/json",
//       },
//       ...options,
//     });
//     const data = await resp.json();
//     if (!resp.ok) throw new Error(data.message || "Error de red");
//     return data;
//   }, [jwt]);
// }

// /****************************
//  * Hook principal de datos  *
//  ****************************/
// function useSocioData(debug = false) {
//   const idSocio = getIdSocio();
//   const fetchApi = useAuthorizedFetch();

//   const [postulaciones, setPostulaciones] = useState([]);
//   const [inscritos, setInscritos] = useState([]);
//   const [error, setError] = useState(null);
//   const [modalData, setModalData] = useState(null);

//   const loadPostulaciones = useCallback(async () => {
//     if (!idSocio) return;
//     const data = await fetchApi(`/proyecto/${idSocio}/postulados`);
//     if (debug) console.log("POSTULADOS:", data);
//     setPostulaciones(data);
//   }, [idSocio, fetchApi, debug]);

//   const loadInscritos = useCallback(async () => {
//     if (!idSocio) return;
//     const data = await fetchApi(`/proyecto/${idSocio}/inscritos`);
//     if (debug) console.log("INSCRITOS:", data);
//     setInscritos(data);
//   }, [idSocio, fetchApi, debug]);

//   useEffect(() => {
//     if (!idSocio) {
//       setError("No se encontró tu sesión. Inicia de nuevo.");
//       return;
//     }
//     loadPostulaciones();
//     loadInscritos();
//   }, [idSocio, loadPostulaciones, loadInscritos]);

//   const handleUpdateStatus = useCallback(
//     async (id_proyecto, id_estudiante, status) => {
//       await fetchApi(`/postulacion/${id_proyecto}/${id_estudiante}`, {
//         method: "PUT",
//         body: JSON.stringify({ status }),
//       });

//       setPostulaciones(prev =>
//         prev
//           .map(p =>
//             p.id_proyecto === id_proyecto
//               ? { ...p, alumnos_postulados: p.alumnos_postulados.filter(al => al.id_estudiante !== id_estudiante) }
//               : p
//           )
//           .filter(p => p.alumnos_postulados.length)
//       );
//       if (status === "aceptado") loadInscritos();
//     },
//     [fetchApi, loadInscritos]
//   );

//   const handleAccept = useCallback((idP, idE) => handleUpdateStatus(idP, idE, "aceptado"), [handleUpdateStatus]);
//   const handleReject = useCallback((idP, idE) => handleUpdateStatus(idP, idE, "no aceptado"), [handleUpdateStatus]);

//   const handleRespuestaClick = useCallback(postulacion => {
//     setModalData({ ...postulacion.alumnos_postulados[0], id_proyecto: postulacion.id_proyecto });
//   }, []);
//   const closeModal = useCallback(() => setModalData(null), []);

//   return {
//     postulaciones,
//     inscritos,
//     error,
//     modalData,
//     handleRespuestaClick,
//     handleAccept,
//     handleReject,
//     closeModal,
//   };
// }

// /****************************
//  * Tabla reutilizable        *
//  ****************************/
// const Table = React.memo(({ headers, children }) => (
//   <table className={styles.table}>
//     <thead>
//       <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
//     </thead>
//     <tbody>{children}</tbody>
//   </table>
// ));

// /****************************
//  * Componente principal      *
//  ****************************/
// function InicioSo() {
//   const navigate = useNavigate();
//   const {
//     postulaciones,
//     inscritos,
//     error,
//     modalData,
//     handleRespuestaClick,
//     handleAccept,
//     handleReject,
//     closeModal,
//   } = useSocioData(true); // pasa 'true' para ver logs en consola

//   const handleLogout = () => {
//     localStorage.removeItem("jwt");
//     localStorage.removeItem("token");
//     navigate("/login");
//   };

//   if (error) return <p className={styles.error}>{error}</p>;

//   return (
//     <div className="main">
//       <NavCub onLogout={handleLogout} />

//       <h1 className="titulo">Personas Postuladas</h1>
//       {postulaciones.length ? (
//         <Table headers={["Proyecto", "Nombre", "Correo", "Carrera", "Fecha", "Respuestas"]}>
//           {postulaciones.map(p =>
//             p.alumnos_postulados.map(est => (
//               <tr key={est.id_estudiante}>
//                 <td>{p.nombre_proyecto}</td>
//                 <td>{est.estudiante_nombre}</td>
//                 <td>{est.estudiante_correo}</td>
//                 <td>{est.estudiante_carrera}</td>
//                 <td>{new Date(est.fecha_postulacion_estudiante).toLocaleDateString("es-MX")}</td>
//                 <td>
//                   <button className={styles.respuestaButton} onClick={() => handleRespuestaClick(p)}>
//                     Ver Respuesta
//                   </button>
//                 </td>
//               </tr>
//             ))
//           )}
//         </Table>
//       ) : (
//         <p>No tienes proyectos con estudiantes postulados.</p>
//       )}

//       <h2 className="nontitle">Alumnos aceptados / inscritos</h2>
//       {inscritos.length ? (
//         <Table headers={["Proyecto", "Nombre", "Correo", "Carrera", "Fecha", "Status"]}>
//           {inscritos.map(p =>
//             (p.alumnos || p.alumnos_inscritos || []).map(al => (
//               <tr key={al.id_estudiante}>
//                 <td>{p.nombre_proyecto}</td>
//                 <td>{al.estudiante_nombre}</td>
//                 <td>{al.estudiante_correo}</td>
//                 <td>{al.estudiante_carrera}</td>
//                 <td>{new Date(al.fecha_postulacion_estudiante).toLocaleDateString("es-MX")}</td>
//                 <td>{al.status}</td>
//               </tr>
//             ))
//           )}
//         </Table>
//       ) : (
//         <p>Aún no tienes alumnos aceptados o inscritos.</p>
//       )}

//       {modalData && (
//         <ModalPostulacion
//           data={modalData}
//           onClose={closeModal}
//           onAccept={handleAccept}
//           onReject={handleReject}
//         />
//       )}
//     </div>
//   );
// }

// export default InicioSo;
