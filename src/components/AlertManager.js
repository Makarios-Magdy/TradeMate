import React, { useState, useCallback, useEffect } from 'react';
import CustomAlert from './CustomAlert';
import alertCallbacks from '../utils/alertService';

const AlertManager = () => {
  const [alerts, setAlerts] = useState([]);

  // Remove an alert by its id
  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  // Subscribe to alert service
  useEffect(() => {
    const unsubscribe = alertCallbacks.subscribe((alertData) => {
      setAlerts(prev => [...prev, alertData]);
    });
    
    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  return (
    <div className="alert-container">
      {alerts.map(alert => (
        <CustomAlert
          key={alert.id}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          duration={alert.duration}
          onClose={() => removeAlert(alert.id)}
        />
      ))}
    </div>
  );
};

export default AlertManager;
