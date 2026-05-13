import { X, MapPin, Clock, Phone, Mail } from 'lucide-react';

interface LocationModalProps {
  onClose: () => void;
}

const LocationModal = ({ onClose }: LocationModalProps) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content location-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-body">
          <h2 className="modal-title">Location & Hours</h2>

          <div className="location-info">
            <div className="info-item">
              <MapPin size={20} className="info-icon" />
              <div>
                <h3 className="info-title">Address</h3>
                <p className="info-text">123 Restaurant Street</p>
                <p className="info-text">City, State 12345</p>
              </div>
            </div>

            <div className="info-item">
              <Clock size={20} className="info-icon" />
              <div>
                <h3 className="info-title">Hours</h3>
                <p className="info-text">Monday - Friday: 11:00 AM - 10:00 PM</p>
                <p className="info-text">Saturday - Sunday: 10:00 AM - 11:00 PM</p>
              </div>
            </div>

            <div className="info-item">
              <Phone size={20} className="info-icon" />
              <div>
                <h3 className="info-title">Phone</h3>
                <p className="info-text">(555) 123-4567</p>
              </div>
            </div>

            <div className="info-item">
              <Mail size={20} className="info-icon" />
              <div>
                <h3 className="info-title">Email</h3>
                <p className="info-text">info@restaurant.com</p>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="close-location-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
