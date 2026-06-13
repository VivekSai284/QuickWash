import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const Popup = ({
  show,
  title,
  message,
  type = "default", // Fallback to default
  onClose,
}) => {
  const icon =
    type === "success"
      ? "✨" // Playful cleaner option matching the wash app theme
      : type === "error"
      ? "💥"
      : type === "info"
      ? "💧"
      : "📢";

  return (
    <AnimatePresence>
      {show && (
        // Added motion to the overlay so it fades out gracefully on exit
        <motion.div 
          className="popup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`popup-card ${type}`} // Dynamic type injection
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
          >
            <div className="popup-icon-circle">
              {icon}
            </div>

            <h2 className="popup-title">{title}</h2>
            <p className="popup-message">{message}</p>

            <button className="popup-action-btn" onClick={onClose}>
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Popup;