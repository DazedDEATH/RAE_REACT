import React, { useState } from 'react';
import AGVPanel from './agv-control-panel.tsx';
import './agv-control-panel.css';
import './sidebar.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const numberOfAGVs = 4;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-container">
      {/* Menú lateral */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        {/* Aquí puedes añadir contenido al menú más adelante */}
        <h2>Menú Lateral</h2>
      </div>

      {/* Botón para abrir/cerrar el menú lateral */}
      <button className="menu-button" onClick={toggleSidebar}>
        ☰
      </button>

      {/* Contenido principal que se oculta cuando el menú está abierto */}
      <div className={`content ${isSidebarOpen}`}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
            AGV Control Panel
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[...Array(numberOfAGVs)].map((_, index) => (
              <AGVPanel key={index + 1} agvNumber={index + 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

