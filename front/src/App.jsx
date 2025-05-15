import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Inicio from './paginasA/InicioA';
import AgregarAdmin from "./paginasA/AgregarAdminA";
import StatusSocios from "./paginasA/StatusSociosA";

import Dashboard from './paginasA//DashBoardA';
import ProyectosPos from './paginasA/ProyectosPosA';
import AlumnosPos from './paginasA/AlumnosPosA'
import SociosAprobados from './paginasA/sociosAprobadosA';
import ProyectosAprobados from './paginasA/ProyectosAprobadosA';

import InicioE from './paginasE/InicioE';
import VisualizarProyectos from './paginasE/VisualizarProyectosE';
import MisPostulaciones from './paginasE/MisPostulacionesE';

import InicioS from './paginasS/InicioSo';
import PostularProyecto from './paginasS/NuestrosProyectosS';
import NuestrosProyectos from './paginasS/PostularProyectoS';

import Login from './Login';
import Signup from './Signup';


function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/agregarAdminA" element={<AgregarAdmin />} />
        <Route path="/statusSociosA" element={<StatusSocios />} />


        <Route path="/dashBoardA" element={<Dashboard />} />
        <Route path="/proyectosPosA" element={<ProyectosPos />} />
        <Route path="/alumnosPosA" element={<AlumnosPos />} />
        <Route path="/sociosAprobadosA" element={<SociosAprobados />} />
        <Route path="/ProyectosAprobadosA" element={<ProyectosAprobados />} />

        <Route path="/inicioE" element={<InicioE />} />
        <Route path="/visualizarProyectos" element={<VisualizarProyectos />} />
        <Route path="/misPostulaciones" element={<MisPostulaciones />} />

        <Route path="/inicioS" element={<InicioS />} />
        <Route path="/nuestrosProyectosS" element={<PostularProyecto/>} />
        <Route path="/postularProyectoS" element={<NuestrosProyectos />} />

        <Route path="/login" element={<Login />} />
        <Route path="/crearCuenta" element={<Signup />} />
      </Routes>
    </>
  );
}

export default App;
