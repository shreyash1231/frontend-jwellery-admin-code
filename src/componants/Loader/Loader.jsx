import React from 'react';
import './Loader.css';  // Import the CSS file for the loader
import "../Load/Load.css"
const Loader = () => {

  return (
    <div className="app">
      <div className="loader-container" aria-label="Loading" role="alert">
      <div className="loader">
      <div className="heart-loader">
          <div className="heart heart-left"></div>
          <div className="heart heart-right"></div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Loader;