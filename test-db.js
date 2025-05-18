const { sequelize, testConnection } = require('./app/config/database');

console.log('Configuración de la base de datos:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);

(async () => {
  try {
    console.log('Intentando conectar a la base de datos...');
    await testConnection();
    
    // Probar consulta simple
    const [results] = await sequelize.query('SHOW TABLES;');
    console.log('Tablas en la base de datos:', results);
    
    console.log('Prueba completada con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('Error durante la prueba:', error);
    process.exit(1);
  }
})(); 