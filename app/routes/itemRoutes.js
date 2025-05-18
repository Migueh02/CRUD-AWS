const express = require('express');
const multer = require('multer');
const router = express.Router();
const itemController = require('../controllers/itemController');

// Configuración de multer para procesar archivos
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de 5MB
  },
  fileFilter: (req, file, cb) => {
    // Validar tipos de archivos: solo imágenes
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten imágenes'), false);
    }
    cb(null, true);
  }
});

// Rutas CRUD para los items
router.post('/', upload.single('imagen'), itemController.createItem);
router.get('/', itemController.getAllItems);
router.get('/:id', itemController.getItemById);
router.put('/:id', upload.single('imagen'), itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

module.exports = router; 