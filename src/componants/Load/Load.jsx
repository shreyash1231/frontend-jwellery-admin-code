// Import necessary modules from React
import React from 'react';
import './Load.css'; // Import custom styles for the loader

// Define a functional React component
const NewLoad = () => {
  return (
    <div className="loader-container" aria-label="Loading" role="alert">
      <div className="loader">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default NewLoad;
