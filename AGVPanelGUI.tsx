import React, { useState, useEffect } from 'react'; // Importa la librería React, que es necesaria para crear componentes funcionales en una aplicación de React.
import { Battery, Wifi } from 'lucide-react'; // Importa los iconos de batería y wifi desde la librería lucide-react para mostrar en la interfaz.
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');


// Mock function to simulate agv_db.query_variable
const queryVariable = (variable: string, agvNumber: number) => {
  // Esta función simula una consulta a la base de datos para obtener el valor de una variable relacionada con un AGV específico.

  if (variable.startsWith('Traffic')) {
    // Si la variable comienza con 'Traffic', simula datos de tráfico devolviendo 0 o 1.
    return Math.floor(Math.random() * 2); // Retorna un valor aleatorio de 0 o 1 (simulando estado de tráfico).
  }

  if (variable === 'Battery.Percentage') {
    // Si la variable es 'Battery.Percentage', simula un valor de porcentaje de batería entre 0 y 100.
    return Math.floor(Math.random() * 101); // Retorna un valor entre 0 y 100, simulando el porcentaje de batería.
  }

  return Math.floor(Math.random() * 100); // Para cualquier otra variable, devuelve un valor aleatorio entre 0 y 100.
};

// Define las propiedades (props) que recibirá el componente AGVPanel
interface AGVProps {
  agvNumber: number; // El número del AGV que se le pasa como prop al componente.
}

// Componente que renderiza la información de una zona de tráfico específica para el AGV.
const TrafficZone: React.FC<{ zone: string; agvNumber: number }> = ({ zone, agvNumber }) => {
  // zone: Representa la zona de tráfico (A o B).
  // agvNumber: El número del AGV para el cual se muestran los datos de tráfico.

  const request = queryVariable(`Traffic.Zone${zone}.Request`, agvNumber); // Consulta si hay una solicitud de tráfico en la zona.
  const busy = queryVariable(`Traffic.Zone${zone}.Busy`, agvNumber); // Consulta si la zona de tráfico está ocupada.

  return (
    <div className="traffic-zone">
      {/* Contenedor de la zona de tráfico */}
      <div className="zone-title">Zone {zone}</div>
      {/* Título que muestra la zona de tráfico */}
      <div className="zone-content">
        {/* Contenedor para el contenido de la zona */}
        <div className="zone-item">
          {/* Muestra si hay una solicitud de tráfico */}
          <div className="zone-label">Request</div>
          {/* Etiqueta 'Request' */}
          <div className="zone-value request">{request}</div>
          {/* Muestra el valor de request (solicitud) */}
        </div>
        <div className="zone-item">
          {/* Muestra si la zona está ocupada */}
          <div className="zone-label">Busy</div>
          {/* Etiqueta 'Busy' */}
          <div className="zone-value busy">{busy}</div>
          {/* Muestra el valor de busy (ocupación) */}
        </div>
      </div>
    </div>
  );
};

// Componente principal AGVPanel
const AGVPanel: React.FC<AGVProps> = ({ agvNumber }) => {
  const [agvData, setAgvData] = useState(null);

  useEffect(() => {
    // Escucha los datos enviados desde el servidor WebSocket
    socket.on('agvData', (data) => {
      // Filtra los datos del AGV específico basado en el valor de `Communication.ID`
      const filteredData = data.find((agv) => agv['Communication.ID'] === agvNumber);
      setAgvData(filteredData);  // Actualiza los datos solo del AGV con el Communication.ID correspondiente
    });

    return () => {
      socket.off('agvData');  // Limpia el evento cuando se desmonta el componente
    };
  }, [agvNumber]);

  if (!agvData) return <div>Loading...</div>;  // Mostrar "Loading..." si no hay datos

  const batteryPercentage = 0; // Consulta el porcentaje de batería del AGV.
  const agvEnabled = agvData['AGVEnable'] > 50; // Consulta si el AGV está habilitado (si el valor es mayor a 50).
  const wifiStatus = queryVariable('Communication.Status', agvNumber) > 50; // Consulta si el AGV está conectado a WiFi (valor mayor a 50 significa conectado).
  const screenInfo = 19; // Consulta la información de la pantalla del AGV.

  // Función para determinar el color de la batería basado en su porcentaje.
  const getBatteryColor = (percentage: number) => {
    if (percentage > 66) return 'battery-high'; // Si la batería está por encima del 66%, el color es 'alto'.
    if (percentage > 33) return 'battery-medium'; // Si está entre el 33% y el 66%, el color es 'medio'.
    return 'battery-low'; // Si está por debajo del 33%, el color es 'bajo'.
  };

  return (
    <div className="agv-panel">
      {/* Contenedor principal del panel del AGV */}
      <div className="panel-header">
        {/* Cabecera del panel */}
        <div className="header-left">
          {/* Parte izquierda de la cabecera */}
          <div className="id-agv">
            {/* Muestra el número del AGV */}
            <div className="label">ID_AGV</div>
            {/* Etiqueta para el ID del AGV */}
            <div className={`value ${agvEnabled ? 'enabled' : 'disabled'}`}>
              {/* Muestra si el AGV está habilitado o deshabilitado */}
              {agvData['ID_AGV']}
              {/* Muestra el valor del ID del AGV */}
            </div>
          </div>
          <div className="battery">
            {/* Información de la batería */}
            <div className="label">Battery</div>
            {/* Etiqueta 'Battery' */}
            <div className={`value ${getBatteryColor(batteryPercentage)}`}>
              {/* Muestra el estado de la batería con un color según su nivel */}
              <Battery className="battery-icon" />
              {/* Icono de batería */}
              <span>{batteryPercentage}%</span>
              {/* Muestra el porcentaje de la batería */}
            </div>
          </div>
        </div>
        <div className="header-right">
          {/* Parte derecha de la cabecera */}
          <div className="screen-info">
            {/* Información de la pantalla del AGV */}
            <div className="label">ScreenInfo</div>
            {/* Etiqueta 'ScreenInfo' */}
            <div className="value">{screenInfo}</div>
            {/* Muestra la información de la pantalla */}
          </div>
          <div className="communication">
            {/* Estado de la comunicación del AGV */}
            <div className="label">Communication</div>
            {/* Etiqueta 'Communication' */}
            <div className={`value ${wifiStatus ? 'connected' : 'disconnected'}`}>
              {/* Muestra el estado de la conexión WiFi */}
              <Wifi className="wifi-icon" />
              {/* Icono de WiFi */}
            </div>
          </div>
        </div>
      </div>

      <div className="panel-body">
        {/* Cuerpo principal del panel del AGV */}
        <div className="route-point">
          {/* Información de la ruta y el punto del AGV */}
          <div className="route">
            {/* Muestra la ruta actual del AGV */}
            <div className="label">Route</div>
            {/* Etiqueta 'Route' */}
            <div className="value">{queryVariable('LayoutPosition.Route', agvNumber)}</div>
            {/* Muestra el valor de la ruta */}
          </div>
          <div className="point">
            {/* Muestra el punto actual del AGV */}
            <div className="label">Point</div>
            {/* Etiqueta 'Point' */}
            <div className="value">{queryVariable('LayoutPosition.Point', agvNumber)}</div>
            {/* Muestra el valor del punto */}
          </div>
        </div>

        <div className={`change-route ${screenInfo === 19 ? '' : 'hidden'}`}>
          {/* Botón para cambiar la ruta (visible solo si screenInfo es igual a 19) */}
          Change route
        </div>

        <div className="traffic-zones">
          {/* Contenedor para las zonas de tráfico */}
          <TrafficZone zone="A" agvNumber={agvNumber} />
          {/* Renderiza el componente TrafficZone para la zona A */}
          <TrafficZone zone="B" agvNumber={agvNumber} />
          {/* Renderiza el componente TrafficZone para la zona B */}
        </div>
      </div>
    </div>
  );
};

export default AGVPanel; // Exporta el componente AGVPanel para que pueda ser utilizado en otras partes de la aplicación.