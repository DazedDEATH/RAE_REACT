import React, { useState, useEffect } from 'react'; // Importa la librería React, que es necesaria para crear componentes funcionales en una aplicación de React.
import { Battery, Wifi } from 'lucide-react'; // Importa los iconos de batería y wifi desde la librería lucide-react para mostrar en la interfaz.
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

// Función para convertir ArrayBuffer a número con verificación estricta del tamaño
const arrayBufferToNumber = (buffer, expectedLength) => {
  if (!buffer || !(buffer instanceof ArrayBuffer)) {
    return 999;  // Si no es un ArrayBuffer, retorna 'N/A'
  }
  const view = new DataView(buffer);
  // Verificamos el tamaño exacto del buffer antes de leerlo
  if (buffer.byteLength >= expectedLength) {
    if (expectedLength === 1) {
      return view.getUint8(0);  // Si el tamaño esperado es 1 byte, usamos getUint8
    } else if (expectedLength === 2) {
      return view.getUint16(0);  // Si el tamaño esperado es 2 bytes, usamos getUint16
    }
  }
  return 999;  // Si el buffer no tiene el tamaño esperado
};


// Define las propiedades (props) que recibirá el componente AGVPanel
interface AGVProps {
  agvNumber: number; // El número del AGV que se le pasa como prop al componente.
}

// Componente que renderiza la información de una zona de tráfico específica para el AGV.
const TrafficZone: React.FC<{ zone: string; agvNumber: number; agvData: any }> = ({ zone, agvNumber, agvData }) => {
  // zone: Representa la zona de tráfico (A o B).
  // agvNumber: El número del AGV para el cual se muestran los datos de tráfico.
  // agvData: Los datos relacionados con el AGV.

  // Consulta y convierte la solicitud de tráfico en la zona.
  const request = arrayBufferToNumber(agvData[`Traffic.Zone${zone}.Request`], 1);
  const busy = arrayBufferToNumber(agvData[`Traffic.Zone${zone}.Busy`], 1); // Agregamos la conversión para el estado de ocupación.

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

  // Verificar si Communication.ID tiene datos pero todos los demás campos son nulos o undefined
  const isOnlyCommunicationIDPresent = agvData && agvData['Communication.ID'] && 
    (!agvData['Communication.Status'] && 
     !agvData['LayoutPosition.Route'] && 
     !agvData['LayoutPosition.Point'] && 
     !agvData['Traffic.ZoneA.Request'] && 
     !agvData['Traffic.ZoneA.Busy'] && 
     !agvData['Traffic.ZoneB.Request'] && 
     !agvData['Traffic.ZoneB.Busy'] && 
     !agvData['Battery.Percentage'] && 
     !agvData['ScreenInfo'] && 
     !agvData['AGVEnable']);

  // Mostrar "Loading..." si Communication.ID tiene valor pero el resto de los campos son nulos
  if (isOnlyCommunicationIDPresent) {
    return;
  }

  if (!agvData) {
    return;
  }

  const batteryPercentage = arrayBufferToNumber(agvData['Battery.Percentage'], 2); // Consulta el porcentaje de batería del AGV.
  const agvEnabled = agvData['AGVEnable']; // Consulta si el AGV está habilitado (si el valor es mayor a 50).
  const wifiStatus = agvData['Communication.Status']; // Consulta si el AGV está conectado a WiFi (valor mayor a 50 significa conectado).
  const screenInfo = arrayBufferToNumber(agvData['ScreenInfo'], 2); // Consulta la información de la pantalla del AGV.
  const route = arrayBufferToNumber(agvData['LayoutPosition.Route'], 2);
  const point = arrayBufferToNumber(agvData['LayoutPosition.Point'], 2);
  const communicationId = agvData['Communication.ID'];

  // Función para determinar el color de la batería basado en su porcentaje.
  const getBatteryColor = (percentage: number) => {
    if (percentage > 66) return 'battery-high'; // Si la batería está por encima del 66%, el color es 'alto'.
    if (percentage > 33) return 'battery-medium'; // Si está entre el 33% y el 66%, el color es 'medio'.
    return 'battery-low'; // Si está por debajo del 33%, el color es 'bajo'.
  };

  return (
    <div className="agv-panel">
      <div className="panel-header">
        <div className="header-left">
          <div className="id-agv">
            <div className="id-labels">
              <span className="label">C_ID</span>
              <span className="label">ID_AGV</span>
            </div>
            <div className="id-values">
              
              <div className="communication-id">
                <div className="comm-id-value">{communicationId}</div>
              </div>

              <div className={`value ${agvEnabled ? 'enabled' : 'disabled'}`}>
                {agvData['ID_AGV']}
              </div>

            </div>
          </div>
          <div className="battery">
            <div className="label">Battery</div>
            <div className={`value ${getBatteryColor(batteryPercentage)}`}>
              <Battery className="battery-icon" />
              <span>{batteryPercentage}%</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="screen-info">
            <div className="label">ScreenInfo</div>
            <div className="value">{screenInfo}</div>
          </div>
          <div className="communication">
            <div className="label">Communication</div>
            <div className={`value ${wifiStatus === 1 ? 'connected' : 'disconnected'}`}>
              <Wifi className="wifi-icon" />
            </div>
          </div>
        </div>
      </div>

      <div className={`location ${route === 2 ? '' : 'hidden'}`}>
        CORNER MOD RH
      </div>

      <div className="panel-body">
        <div className="route-point">
          <div className="route">
            <div className="label">Route</div>
            <div className="value">{route}</div>
          </div>
          <div className="point">
            <div className="label">Point</div>
            <div className="value">{point}</div>
          </div>
        </div>

        <div className={`error ${screenInfo === 19 ? '' : 'hidden'}`}>
          Change route
        </div>

        <div className="traffic-zones">
          <TrafficZone zone="A" agvNumber={agvNumber} agvData={agvData} />
          <TrafficZone zone="B" agvNumber={agvNumber} agvData={agvData} />
        </div>
      </div>
    </div>
  );
};

export default AGVPanel;