import React, { useEffect, useState } from 'react';
import { 
  CheckCircleOutline, 
  ErrorOutline, 
  InfoOutlined, 
  Close 
} from '@mui/icons-material';

const CustomAlert = ({ type = 'success', title, message, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, 300); // Animation duration
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleOutline style={{ color: 'var(--success-color)' }} className="custom-alert-icon" />;
      case 'error':
        return <ErrorOutline style={{ color: 'var(--danger-color)' }} className="custom-alert-icon" />;
      case 'info':
        return <InfoOutlined style={{ color: 'var(--primary-color)' }} className="custom-alert-icon" />;
      default:
        return <InfoOutlined style={{ color: 'var(--primary-color)' }} className="custom-alert-icon" />;
    }
  };

  return (
    <div 
      className={`custom-alert ${type}`} 
      style={{ 
        animation: isClosing ? 'slideOut 0.3s ease-out forwards' : 'slideIn 0.3s ease-out forwards',
        fontFamily: '"Exo", sans-serif',
      }}
    >
      {getIcon()}
      <div className="custom-alert-content">
        {title && <div className="custom-alert-title">{title}</div>}
        {message && <div className="custom-alert-message">{message}</div>}
      </div>
      <button className="custom-alert-close" onClick={handleClose} aria-label="Close alert">
        <Close fontSize="small" />
      </button>
    </div>
  );
};

export default CustomAlert;
