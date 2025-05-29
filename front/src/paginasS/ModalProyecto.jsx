import React from 'react';
import styles from './ModalProyecto.module.css';

const ModalProyecto = ({ proyecto, onClose }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>X</button>
        <h2>{proyecto.nombre_proyecto}</h2>
        <p><strong>Modalidad:</strong> {proyecto.modalidad}</p>
        <p><strong>Ubicación:</strong> {proyecto.direccion_escrita}</p>
        <p><strong>Problema social:</strong> {proyecto.problema_social}</p>
        <p><strong>Vulnerabilidad atendida 1:</strong> {proyecto.vulnerabilidad_atendida_1}</p>
        <p><strong>Edad población 1:</strong> {proyecto.edad_poblacion_1}</p>
        <p><strong>Vulnerabilidad atendida 2:</strong> {proyecto.vulnerabilidad_atendida_2}</p>
        <p><strong>Edad población 2:</strong> {proyecto.edad_poblacion_2}</p>
        <p><strong>Objetivo del proyecto:</strong> {proyecto.objetivo_proyecto}</p>
        <p><strong>Acciones del estudiantado:</strong> {proyecto.acciones_estudiantado}</p>
        <p><strong>Valor del proyecto:</strong> {proyecto.valor_proyecto}</p>
        <p><strong>Días de actividades:</strong> {proyecto.dias_actividades}</p>
        <p><strong>Zona población:</strong> {proyecto.zona_poblacion}</p>
        <p><strong>Beneficiarios:</strong> {proyecto.numero_beneficiarios_proyecto}</p>
        <p><strong>Habilidades para los alumnos:</strong> {proyecto.habilidades_alumno}</p>
        {/* Puedes agregar más campos según sea necesario */}
      </div>
    </div>
  );
};

export default ModalProyecto;
