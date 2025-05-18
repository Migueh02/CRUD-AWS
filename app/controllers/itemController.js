const Item = require('../models/item');
const { uploadToS3, deleteFromS3, renewSignedUrl } = require('../config/s3');

// Crear un nuevo item
exports.createItem = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Se requiere una imagen' });
    }

    // Subir imagen a S3
    const uploadResult = await uploadToS3(req.file);

    // Crear item en la base de datos
    const item = await Item.create({
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      url_imagen: uploadResult.url,
      s3_key: uploadResult.key // Guardar la key para futuras operaciones
    });

    res.status(201).json({
      message: 'Item creado exitosamente',
      item
    });
  } catch (error) {
    console.error('Error al crear item:', error);
    res.status(500).json({ message: 'Error al crear item', error: error.message });
  }
};

// Obtener todos los items
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.findAll();
    
    // Opcional: renovar URLs firmadas si están por expirar
    /* 
    for (let item of items) {
      // Aquí podrías implementar lógica para renovar URLs solo si están próximas a expirar
      if (item.s3_key) {
        item.url_imagen = await renewSignedUrl(item.s3_key, 604800); // 7 días
      }
    }
    */
    
    res.status(200).json(items);
  } catch (error) {
    console.error('Error al obtener items:', error);
    res.status(500).json({ message: 'Error al obtener items', error: error.message });
  }
};

// Obtener un item por ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item no encontrado' });
    }
    
    // Opcional: renovar URL firmada
    /*
    if (item.s3_key) {
      item.url_imagen = await renewSignedUrl(item.s3_key, 604800); // 7 días
    }
    */
    
    res.status(200).json(item);
  } catch (error) {
    console.error('Error al obtener item:', error);
    res.status(500).json({ message: 'Error al obtener item', error: error.message });
  }
};

// Actualizar un item
exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item no encontrado' });
    }

    let updateData = {
      nombre: req.body.nombre,
      descripcion: req.body.descripcion
    };

    // Si hay una nueva imagen, subirla a S3
    if (req.file) {
      // Eliminar la imagen anterior de S3 usando la key guardada
      if (item.s3_key) {
        await deleteFromS3(item.s3_key);
      } else {
        // Para compatibilidad con registros antiguos
        await deleteFromS3(item.url_imagen);
      }
      
      // Subir la nueva imagen a S3
      const uploadResult = await uploadToS3(req.file);
      updateData.url_imagen = uploadResult.url;
      updateData.s3_key = uploadResult.key;
    }

    // Actualizar el item en la base de datos
    await item.update(updateData);

    res.status(200).json({
      message: 'Item actualizado exitosamente',
      item
    });
  } catch (error) {
    console.error('Error al actualizar item:', error);
    res.status(500).json({ message: 'Error al actualizar item', error: error.message });
  }
};

// Eliminar un item
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item no encontrado' });
    }

    // Eliminar la imagen de S3 usando la key guardada si está disponible
    if (item.s3_key) {
      await deleteFromS3(item.s3_key);
    } else {
      // Para compatibilidad con registros antiguos
      await deleteFromS3(item.url_imagen);
    }
    
    // Eliminar el item de la base de datos
    await item.destroy();

    res.status(200).json({ message: 'Item eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar item:', error);
    res.status(500).json({ message: 'Error al eliminar item', error: error.message });
  }
}; 