import NavCub from '../componentes/navegacion';
import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

export default function DashBoardA() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [status, setStatus] = useState('');
  const [actividad, setActividad] = useState('');

  // Obtener proyectos al montar o cambiar filtros
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5003/proyectos_admin', {
          params: {
            search,
            periodo,
            status_proyecto: status,
            status_actividad: actividad === '' ? undefined : Number(actividad)
          }
        });

        // Filtrar valores nulos y asegurar que status_actividad sea booleano
        const datosFiltrados = response.data
          .filter(p => p.id_proyecto != null)
          .map(p => ({
            ...p,
            status_actividad: p.status_actividad === undefined ? false : p.status_actividad
          }));

        setRows(datosFiltrados);
      } catch (error) {
        console.error('Error al obtener proyectos:', error);
      }
    };

    fetchData();
  }, [search, periodo, status, actividad]);

  const columns = [
    { field: 'id_proyecto', headerName: 'ID', width: 70 },
    { field: 'nombre_proyecto', headerName: 'Nombre del proyecto', width: 200, editable: true },
    { field: 'problema_social', headerName: 'Problema social', width: 200, editable: true },
    { field: 'status_proyecto', headerName: 'Status', width: 150 },
    {
      field: 'status_actividad',
      headerName: 'Actividad',
      width: 150,
      valueGetter: (params) => {
        const val = params.row?.status_actividad;
        if (val === undefined || val === null) return 'No definido';
        return val ? 'Activa' : 'Inactiva';
      }
    }
  ];

  // Actualización al editar fila
  const processRowUpdate = async (updatedRow) => {
    try {
      await axios.put(`http://localhost:5003/proyectos_admin/${updatedRow.id_proyecto}`, updatedRow);
      return updatedRow;
    } catch (error) {
      console.error('Error al actualizar proyecto:', error);
      alert('Error al guardar los cambios.');
      return updatedRow;
    }
  };

  return (
    
    
    <div style={{ height: 600, width: '100%', padding: '20px' }}>
      <NavCub />
      
      <h2>Panel de Proyectos</h2>



      {/* Filtros */}
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />

        <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} style={{ marginRight: '10px' }}>
          <option value="">Todos los periodos</option>
          <option value="1">Periodo 1</option>
          <option value="2">Periodo 2</option>
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ marginRight: '10px' }}>
          <option value="">Todos los estados</option>
          <option value="Aprobado">Aprobado</option>
          <option value="En revisión">En revisión</option>
          <option value="No aprobado">No aprobado</option>
        </select>

        <select value={actividad} onChange={(e) => setActividad(e.target.value)}>
          <option value="">Todas las actividades</option>
          <option value="1">Activa</option>
          <option value="0">Inactiva</option>
        </select>
      </div>

      {/* Tabla de proyectos */}
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id_proyecto}
        checkboxSelection
        disableRowSelectionOnClick
        processRowUpdate={processRowUpdate}
        experimentalFeatures={{ newEditingApi: true }}
      />
    </div>
  );
}