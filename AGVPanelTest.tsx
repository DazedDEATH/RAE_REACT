import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Conéctate al servidor WebSocket
const socket = io('http://localhost:3001');

// Función para convertir ArrayBuffer a número con verificación estricta del tamaño
const arrayBufferToNumber = (buffer, expectedLength) => {
  if (!buffer || !(buffer instanceof ArrayBuffer)) {
    return 'N/A';  // Si no es un ArrayBuffer, retorna 'N/A'
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

  return 'N/A';  // Si el buffer no tiene el tamaño esperado
};

const AGVPanel = ({ agvNumber }) => {
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

  return (
    <div className="agv-panel">
      <h2>AGV with Communication ID {agvData['Communication.ID']}</h2>
      
      <p><strong>Communication ID:</strong> {agvData['Communication.ID']}</p>
      <p><strong>Communication Status:</strong> {agvData['Communication.Status']}</p>

      {/* Usamos arrayBufferToNumber y verificamos si el tamaño es al menos 2 bytes para VARBINARY(2) */}
      <p><strong>Layout Position Route:</strong> {arrayBufferToNumber(agvData['LayoutPosition.Route'], 2)}</p>
      <p><strong>Layout Position Point:</strong> {arrayBufferToNumber(agvData['LayoutPosition.Point'], 2)}</p>

      {/* Para campos VARBINARY(1), verificamos si el tamaño es al menos 1 byte */}
      <p><strong>Traffic Zone A Request:</strong> {arrayBufferToNumber(agvData['Traffic.ZoneA.Request'], 1)}</p>
      <p><strong>Traffic Zone A Busy:</strong> {arrayBufferToNumber(agvData['Traffic.ZoneA.Busy'], 1)}</p>

      <p><strong>Traffic Zone B Request:</strong> {arrayBufferToNumber(agvData['Traffic.ZoneB.Request'], 1)}</p>
      <p><strong>Traffic Zone B Busy:</strong> {arrayBufferToNumber(agvData['Traffic.ZoneB.Busy'], 1)}</p>

      <p><strong>Battery Percentage:</strong> {agvData['Battery.Percentage'] ? `${arrayBufferToNumber(agvData['Battery.Percentage'], 2)}%` : 'N/A'}</p>

      <p><strong>Screen Info:</strong> {arrayBufferToNumber(agvData['ScreenInfo'], 2)}</p>

      <p><strong>AGV Enable:</strong> {agvData['AGVEnable'] ? 'Enabled' : 'Disabled'}</p>

      <p><strong>Time:</strong> {agvData['TIME'] ? new Date(agvData['TIME']).toLocaleString() : 'N/A'}</p>
    </div>
  );
};

export default AGVPanel;