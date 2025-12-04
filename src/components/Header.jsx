/* Header.jsx*/

// Imports
import React, { useState } from 'react';
import Legend from './Legend';
import './Header.css';
import logo from '../logo.jpg';

// Define consts
const Header = ({
  /* Parcel search */
  showParcelSearch,
  setShowParcelSearch,
  /* Help menu */
  showHelpMenu,
  setShowHelpMenu,

}) => {
  const [showLegend, setShowLegend] = useState(false);

  // Return and export
  return (
  <header className="app-header">
  <div className="header-content">

    {/* Left side: logo and menu */}
    <div className="header-left">
      <img src={logo} alt="County Logo" className="app-logo" />
      <div className="menu-container">
        <div className="menu-content">
          <a href="https://summit-county-gis-hub-summitcounty.hub.arcgis.com/" target="_blank" rel="noopener noreferrer">
            Summit County GIS Hub
          </a>
          <span className="separator">|</span>
          <a href="https://www.summitcountyutah.gov/" target="_blank" rel="noopener noreferrer">
            Summit County Main Site
          </a>
          <span className="separator">|</span>
          <a href="mailto:jward@summitcountyutah.gov?subject=Error%20Encountered%20in%20Land%20Prioritization%20App">
            Experiencing a Problem? Click Here
          </a>
        </div>
      </div>
    </div>

    {/* Center: app title */}
    <div className="header-center">
      <h1 className="app-title">Land Prioritization App</h1>
    </div>

    {/* Right side: buttons */}
    <div className="header-right">

      {/* Legend button */}
      <div className="legend-container">
        <button className="legend-button" onClick={() => setShowLegend(!showLegend)}>🗺️ Legend</button>
        <div className={`legend-menu ${showLegend ? 'show' : ''}`}><Legend /></div>
      </div>

      {/* Parcel search toggle button */}
      <div className="search-toggle-container">
        <button
          className="search-toggle-button"
          onClick={() => setShowParcelSearch(!showParcelSearch)}
          >
            🔍 {showParcelSearch ? "Parcel Search ▼" : "Parcel Search ▶"}
          </button>
      </div>

      {/* Help menu toggle button */}
      <div className="help-toggle-container">
        <button 
          className="help-button" 
          onClick={() => setShowHelpMenu(!showHelpMenu)}
          >
            ❓{showHelpMenu ? "Help" : "Help"}
          </button>
      </div>
    </div>

  </div>
</header>
  );
};

export default Header;
