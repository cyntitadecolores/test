import React from 'react';
import styles from './ModalPostulacion.module.css';

const ModalPostulacion = ({ data, onClose, onAccept, onReject }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>X</button>
        <h2>Detalles de la Postulación</h2>
        <p><strong>Estudiante:</strong> {data.estudiante_nombre}</p>
        <p><strong>Correo:</strong> {data.estudiante_correo}</p>
        <p><strong>Carrera:</strong> {data.estudiante_carrera}</p>
        <p><strong>Fecha de Postulación:</strong> {new Date(data.fecha_postulacion_estudiante).toLocaleDateString()}</p>
        <p><strong>Expectativa:</strong> {data.expectativa}</p>
        <p><strong>Razón:</strong> {data.razon}</p>
        <p><strong>Motivo:</strong> {data.motivo}</p>
        
        <div className={styles.buttonContainer}>
          <button onClick={() => onAccept(data.id_proyecto, data.id_estudiante)} className={styles.aceptarButton}>Aceptar</button>
          <button onClick={() => onReject(data.id_proyecto, data.id_estudiante)} className={styles.rechazarButton}>Rechazar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalPostulacion;
