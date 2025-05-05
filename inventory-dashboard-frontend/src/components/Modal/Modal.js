import React from 'react';
import styles from './Modal.module.css';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>{title}</h3>
          <button onClick={onClose} className={styles.closeButton}>
            &times;
          </button>
        </div>
        <div className={styles.modalBody}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;