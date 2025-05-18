const AWS = require('aws-sdk');
require('dotenv').config();

// Configurar AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Crear una instancia de S3
const s3 = new AWS.S3();

// Función para subir un archivo a S3
const uploadToS3 = async (file) => {
  const fileName = `${Date.now()}_${file.originalname}`;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype
    // Eliminamos ACL: 'public-read' para evitar el error
  };

  try {
    const uploadResult = await s3.upload(params).promise();
    
    // Generar una URL firmada con expiración de 1 semana
    const signedUrl = await getSignedUrl(fileName, 604800); // 7 días en segundos
    
    // Guardar en la base de datos tanto la URL de S3 como la key para futuras operaciones
    return {
      url: signedUrl,
      key: fileName
    };
  } catch (error) {
    console.error('Error al subir el archivo a S3:', error);
    throw error;
  }
};

// Función para generar URL firmada para un objeto
const getSignedUrl = async (key, expirationInSeconds = 3600) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Expires: expirationInSeconds
  };

  try {
    const url = await s3.getSignedUrlPromise('getObject', params);
    return url;
  } catch (error) {
    console.error('Error al generar URL firmada:', error);
    throw error;
  }
};

// Función para eliminar un archivo de S3
const deleteFromS3 = async (key) => {
  // Si recibimos una URL completa, extraemos la key
  if (key.includes('amazonaws.com')) {
    // Es una URL, extraer la key
    key = key.split('/').pop();
  }
  
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key
  };

  try {
    await s3.deleteObject(params).promise();
    console.log(`Archivo ${key} eliminado de S3 correctamente.`);
    return true;
  } catch (error) {
    console.error('Error al eliminar el archivo de S3:', error);
    throw error;
  }
};

// Función para renovar una URL firmada
const renewSignedUrl = async (key, expirationInSeconds = 3600) => {
  return await getSignedUrl(key, expirationInSeconds);
};

module.exports = {
  uploadToS3,
  deleteFromS3,
  getSignedUrl,
  renewSignedUrl
}; 