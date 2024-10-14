import React from 'react';  // Importa la librería React, necesaria para crear componentes React.
import AGVPanel from './agv-control-panel.tsx';  // Importa el componente AGVPanel desde el archivo 'agv-control-panel.tsx'.
import './agv-control-panel.css';  // Importa el archivo de estilos CSS correspondiente a los paneles AGV.

function App() {
  // Definimos el número de AGVs que se mostrarán en la pantalla. Actualmente, está configurado para mostrar 2 paneles.
  const numberOfAGVs = 3;  // Puedes cambiar este número para mostrar más AGVs en la interfaz.

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* El contenedor principal del componente App, que ocupa la altura mínima de la pantalla y tiene fondo gris claro */}
      
      <div className="max-w-7xl mx-auto">
        {/* Este contenedor asegura que el contenido no exceda un ancho máximo (7xl = 1280px) y se centra horizontalmente usando mx-auto */}
        
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          {/* Encabezado principal de la página */}
          AGV Control Panel
          {/* El texto mostrado en la cabecera del panel: "AGV Control Panel" */}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Contenedor que utiliza un sistema de cuadrícula para organizar los paneles AGV */}
          {/* En pantallas grandes (lg), se muestran 3 columnas, y en pantallas más pequeñas solo 1 columna */}
          {/* gap-4 crea un espacio de 1rem (16px) entre los elementos de la cuadrícula */}

          {[...Array(numberOfAGVs)].map((_, index) => (
            // Esto crea un array con `numberOfAGVs` elementos vacíos (en este caso, 2).
            // Se usa el método .map para iterar sobre cada elemento del array y renderizar un componente AGVPanel por cada iteración.
            // El argumento `index` representa el índice actual en la iteración (0, 1, 2, etc.).

            <AGVPanel key={index + 1} agvNumber={index + 1} />
            // Renderiza el componente AGVPanel para cada AGV. Se pasa una prop llamada `agvNumber`, que es el número del AGV.
            // Usamos `key={index + 1}` para asignar una clave única a cada AGVPanel basado en su índice (clave requerida por React).
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;  // Exporta el componente App para que pueda ser utilizado en otros archivos del proyecto.
