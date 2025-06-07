// Global alert service for managing application alerts
const alertCallbacks = {
  subscribers: [],
  subscribe: function(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  },
  publish: function(alertData) {
    this.subscribers.forEach(callback => callback(alertData));
  }
};

// Function to show an alert
export const showAlert = (type, title, message, duration = 3000) => {
  alertCallbacks.publish({
    id: Date.now(),
    type,
    title,
    message,
    duration
  });
};

// Exposing the alertCallbacks for components to subscribe
export default alertCallbacks;
