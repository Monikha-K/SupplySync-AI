import "../styles/Notification.css";

function Notification({ message, onClose }) {
  return (
    <div className="notification">
      <div className="notification-card">
        <span className="notification-icon">⚠️</span>
        <div className="notification-body">
          <div className="notification-title">Shipment not found.</div>
          <div className="notification-msg">{message || "Please enter a valid Shipment ID."}</div>
        </div>
        <button className="notification-close" onClick={onClose} aria-label="Close">✕</button>
      </div>
    </div>
  );
}

export default Notification;
