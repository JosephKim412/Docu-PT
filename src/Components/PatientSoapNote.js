import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import styles from "../CSS_stylesheets/ptmodal.module.css";

export default function PatientSoapNoteModal({ patientInfo, setIsModalOpen }) {
  function handleCloseModal() {
    setIsModalOpen(false);
  }
  return ReactDOM.createPortal(
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button
          className={styles.closeButton}
          onClick={() => handleCloseModal()}
        >
          Close X
        </button>
        <h1>SOAP Note</h1>
        <pre>{patientInfo}</pre>
      </div>
    </div>,
    document.body
  );
}
