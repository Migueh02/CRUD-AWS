const express = require('express');
const path = require('path');
const cors = require('cors');
const { sequelize, testConnection } = require('./app/config/database');
const itemRoutes = require('./app/routes/itemRoutes');

// Cargar variables de entorno
require('dotenv').config();

// Inicializar app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'app/public')));

// Configurar componentes accesibles desde el frontend
app.use('/components', express.static(path.join(__dirname, 'app/components')));

// Rutas API
app.use('/api/items', itemRoutes);

// Ruta principal que sirve el frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/public/index.html'));
});

// Ruta para cualquier otra petición (Manejo de errores 404)
app.use((req, res) => {
  res.status(404).send('Página no encontrada');
});

// Sincronizar modelo con la base de datos y arrancar servidor
(async () => {
  try {
    // Probar conexión a la base de datos
    await testConnection();
    
    // Sincronizar modelos
    await sequelize.sync();
    console.log('Base de datos sincronizada correctamente');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
      console.log(`Accede a la aplicación en: http://localhost:${PORT}`);
    });
    
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
})(); 