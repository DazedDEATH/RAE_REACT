const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",  // Permitir solicitudes desde el frontend
    methods: ["GET", "POST"]
  }
});

app.use(cors({ origin: 'http://localhost:3000' }));  // Habilita CORS

// Configuración de la base de datos
const dbConfig = {
  user: 'Streamlit',
  password: 'abc',
  server: 'DAZEDS-DESKTOP\\SQLEXPRESS',
  database: 'AMS',
  options: {
    encrypt: false,
    enableArithAbort: true,
  },
};

let currentData = [];  // Variable para almacenar los datos actuales de la base de datos

// Función para obtener todos los datos de la tabla TestID
async function getAllData() {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request().query(`SELECT * FROM [AMS].[dbo].[TestID]`);
    return result.recordset;  // Retorna todos los registros
  } catch (err) {
    console.error("Error al obtener datos de la base de datos:", err);
    throw err;
  }
}

// Función para verificar si los datos han cambiado
function haveDataChanged(newData, oldData) {
  return JSON.stringify(newData) !== JSON.stringify(oldData);  // Compara los datos actuales con los nuevos
}

// Función de polling que se ejecuta cada 3 segundos
async function pollDatabase() {
  try {
    const newData = await getAllData();  // Obtén los datos actualizados
    if (haveDataChanged(newData, currentData)) {
      console.log('Datos cambiaron, actualizando frontend...');
      currentData = newData;  // Actualiza la referencia a los datos actuales
      io.emit('agvData', currentData);  // Envia los datos actualizados al frontend
    }
  } catch (err) {
    console.error("Error al hacer polling a la base de datos:", err);
  }
}

// Escuchar las conexiones WebSocket
io.on('connection', async (socket) => {
  console.log('Cliente conectado');

  // Al conectarse un cliente, envía los datos actuales
  const allData = await getAllData();
  currentData = allData;  // Inicializa los datos actuales
  socket.emit('agvData', currentData);  // Envia los datos al frontend

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Inicia el polling cada 3 segundos
setInterval(pollDatabase, 3000);

// Iniciar el servidor en el puerto 3001
server.listen(3001, () => {
  console.log('Servidor corriendo en el puerto 3001');
});
