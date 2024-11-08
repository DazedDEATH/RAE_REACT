import React, { useState } from 'react';

type LocationMap = { [key: number]: string };
type ErrorCode = { message: string; type: 'informative' | 'warning' | 'machine-stops' | 'none'; color: string };
type ErrorCodes = { [key: number]: ErrorCode };

interface SettingsPanelProps {
  locationMap: LocationMap;
  setLocationMap: React.Dispatch<React.SetStateAction<LocationMap>>;
  errorCodes: ErrorCodes;
  setErrorCodes: React.Dispatch<React.SetStateAction<ErrorCodes>>;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ locationMap, setLocationMap, errorCodes, setErrorCodes }) => {
  const [activeSection, setActiveSection] = useState<'locations' | 'errors'>('locations');

  const handleLocationChange = (key: number, value: string) => {
    setLocationMap(prev => ({ ...prev, [key]: value }));
  };

  const handleErrorCodeChange = (key: number, field: keyof ErrorCode, value: string) => {
    setErrorCodes(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  return (
    <div className="settings-panel">
      <div className="tabs">
        <button 
          onClick={() => setActiveSection('locations')}
          className={activeSection === 'locations' ? 'active' : ''}
        >
          Locations
        </button>
        <button 
          onClick={() => setActiveSection('errors')}
          className={activeSection === 'errors' ? 'active' : ''}
        >
          Error Codes
        </button>
      </div>

      {activeSection === 'locations' && (
        <div className="locations-settings">
          <h2>Location Settings</h2>
          {Object.entries(locationMap).map(([key, value]) => (
            <div key={key} className="setting-item">
              <label>Route {key}:</label>
              <input
                type="text"
                value={value}
                onChange={(e) => handleLocationChange(Number(key), e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      {activeSection === 'errors' && (
        <div className="errors-settings">
          <h2>Error Code Settings</h2>
          {Object.entries(errorCodes).map(([key, error]) => (
            <div key={key} className="setting-item">
              <h3>Error Code {key}</h3>
              <label>Message:</label>
              <input
                type="text"
                value={error.message}
                onChange={(e) => handleErrorCodeChange(Number(key), 'message', e.target.value)}
              />
              <label>Type:</label>
              <select
                value={error.type}
                onChange={(e) => handleErrorCodeChange(Number(key), 'type', e.target.value as ErrorCode['type'])}
              >
                <option value="informative">Informative</option>
                <option value="warning">Warning</option>
                <option value="machine-stops">Machine Stops</option>
                <option value="none">None</option>
              </select>
              <label>Color:</label>
              <input
                type="color"
                value={error.color}
                onChange={(e) => handleErrorCodeChange(Number(key), 'color', e.target.value)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;