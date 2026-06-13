import React from "react";

const Loader = ({ text = "Washing your garments...", fullScreen = true }) => {
  return (
    <div className={`loading-container ${fullScreen ? "fullscreen-loader" : "inline-loader"}`}>
      <div className="laundry-spinner-wrapper">
        {/* Outer swirling vortex frame */}
        <div className="vortex-ring"></div>
        {/* Core floating brand laundry bubble */}
        <div className="bubble-core">🧺</div>
        
        {/* Floating ambient suds trailing around the container */}
        <div className="mini-sud sud-1"></div>
        <div className="mini-sud sud-2"></div>
      </div>
      <p className="loading-text">{text}</p>
    </div>
  );
};

export default Loader;