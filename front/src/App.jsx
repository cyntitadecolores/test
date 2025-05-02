import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Inicio from './paginasA/InicioA';
import AgregarAdmin from "./paginasA/AgregarAdminA";
import StatusSocios from "./paginasA/StatusSociosA";

import Dashboard from './paginasA//DashBoardA';
import ProyectosPos from './paginasA/ProyectosPosA';
import AlumnosPos from './paginasA/AlumnosPosA'
import SociosAprobados from './paginasA/sociosAprobadosA';
import InfoSocio from './paginasA/InfoSocioA';

import InicioE from './paginasE/InicioE';
import VisualizarProyectos from './paginasE/VisualizarProyectosE';
import MisPostulaciones from './paginasE/MisPostulacionesE';

import InicioS from './paginasS/InicioSo';
import PostularProyecto from './paginasS/NuestrosProyectosS';
import NuestrosProyectos from './paginasS/PostularProyectoS';

import Login from './logIn/Login';
import CrearCuenta from './logIn/crearCuenta';


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/agregarAdminA" element={<AgregarAdmin />} />
        <Route path="/statusSociosA" element={<StatusSocios />} />


        <Route path="/dashBoardA" element={<Dashboard />} />
        <Route path="/proyectosPosA" element={<ProyectosPos />} />
        <Route path="/alumnosPosA" element={<AlumnosPos />} />
        <Route path="/sociosAprobadosA" element={<SociosAprobados />} />
        <Route path="/socio/info/:id" element={<InfoSocio />} />

        <Route path="/inicioE" element={<InicioE />} />
        <Route path="/visualizarProyectos" element={<VisualizarProyectos />} />
        <Route path="/misPostulaciones" element={<MisPostulaciones />} />

        <Route path="/inicioS" element={<InicioS />} />
        <Route path="/nuestrosProyectosS" element={<PostularProyecto/>} />
        <Route path="/postularProyectoS" element={<NuestrosProyectos />} />

        <Route path="/login" element={<Login />} />
        <Route path="/crearCuenta" element={<CrearCuenta />} />
      </Routes>
    </>
  );
}

export default App;
