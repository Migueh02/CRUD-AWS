// Componente principal para gestionar los items
document.addEventListener('DOMContentLoaded', () => {
  // Referencias a elementos del DOM
  const itemForm = document.getElementById('item-form');
  const itemList = document.getElementById('item-list');
  const itemName = document.getElementById('item-name');
  const itemDescription = document.getElementById('item-description');
  const itemImage = document.getElementById('item-image');
  const submitBtn = document.getElementById('submit-btn');
  const previewImage = document.getElementById('preview-image');
  const modalEdit = document.getElementById('modal-edit');
  const closeModalBtn = document.querySelector('.close-modal');
  const editForm = document.getElementById('edit-form');
  const editName = document.getElementById('edit-name');
  const editDescription = document.getElementById('edit-description');
  const editId = document.getElementById('edit-id');
  
  let items = [];
  let editMode = false;
  
  // Función para mostrar una vista previa de la imagen seleccionada
  itemImage.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        previewImage.src = e.target.result;
        previewImage.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Función para limpiar el formulario
  const resetForm = () => {
    itemForm.reset();
    previewImage.src = '';
    previewImage.style.display = 'none';
    editMode = false;
    submitBtn.textContent = 'Crear Item';
  };
  
  // Cargar items al iniciar
  const loadItems = async () => {
    try {
      const response = await fetch('/api/items');
      if (!response.ok) throw new Error('Error al cargar items');
      
      items = await response.json();
      renderItems();
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error al cargar los items', 'error');
    }
  };
  
  // Renderizar items en la lista
  const renderItems = () => {
    itemList.innerHTML = '';
    
    if (items.length === 0) {
      itemList.innerHTML = '<p class="no-items">No hay items para mostrar</p>';
      return;
    }
    
    items.forEach(item => {
      const itemCard = document.createElement('div');
      itemCard.className = 'item-card';
      itemCard.innerHTML = `
        <div class="item-image-container">
          <img src="${item.url_imagen}" alt="${item.nombre}" class="item-image">
        </div>
        <div class="item-details">
          <h3>${item.nombre}</h3>
          <p>${item.descripcion}</p>
          <div class="item-actions">
            <button class="edit-btn" data-id="${item.id}">Editar</button>
            <button class="delete-btn" data-id="${item.id}">Eliminar</button>
          </div>
        </div>
      `;
      itemList.appendChild(itemCard);
    });
    
    // Agregar event listeners a los botones
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', handleEditClick);
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', handleDeleteClick);
    });
  };
  
  // Manejar envío del formulario (crear o actualizar)
  itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!itemName.value || !itemDescription.value) {
      showMessage('Por favor complete todos los campos', 'error');
      return;
    }
    
    if (!editMode && !itemImage.files[0]) {
      showMessage('Por favor seleccione una imagen', 'error');
      return;
    }
    
    const formData = new FormData();
    formData.append('nombre', itemName.value);
    formData.append('descripcion', itemDescription.value);
    
    if (itemImage.files[0]) {
      formData.append('imagen', itemImage.files[0]);
    }
    
    try {
      let response;
      
      if (editMode) {
        // Modo actualización
        const itemId = editId.value;
        response = await fetch(`/api/items/${itemId}`, {
          method: 'PUT',
          body: formData
        });
      } else {
        // Modo creación
        response = await fetch('/api/items', {
          method: 'POST',
          body: formData
        });
      }
      
      if (!response.ok) throw new Error('Error en la operación');
      
      showMessage(editMode ? 'Item actualizado correctamente' : 'Item creado correctamente', 'success');
      resetForm();
      loadItems();
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error en la operación', 'error');
    }
  });
  
  // Manejar click en botón editar
  const handleEditClick = (e) => {
    const itemId = e.target.dataset.id;
    const item = items.find(i => i.id == itemId);
    
    if (!item) return;
    
    // Mostrar modal de edición
    modalEdit.style.display = 'block';
    editName.value = item.nombre;
    editDescription.value = item.descripcion;
    editId.value = item.id;
  };
  
  // Manejar click en botón eliminar
  const handleDeleteClick = async (e) => {
    if (!confirm('¿Está seguro de que desea eliminar este item?')) return;
    
    const itemId = e.target.dataset.id;
    
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Error al eliminar');
      
      showMessage('Item eliminado correctamente', 'success');
      loadItems();
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error al eliminar el item', 'error');
    }
  };
  
  // Manejar envío del formulario de edición
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!editName.value || !editDescription.value) {
      showMessage('Por favor complete todos los campos', 'error');
      return;
    }
    
    const formData = new FormData();
    formData.append('nombre', editName.value);
    formData.append('descripcion', editDescription.value);
    
    try {
      const response = await fetch(`/api/items/${editId.value}`, {
        method: 'PUT',
        body: formData
      });
      
      if (!response.ok) throw new Error('Error al actualizar');
      
      showMessage('Item actualizado correctamente', 'success');
      modalEdit.style.display = 'none';
      loadItems();
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error al actualizar el item', 'error');
    }
  });
  
  // Cerrar modal
  closeModalBtn.addEventListener('click', () => {
    modalEdit.style.display = 'none';
  });
  
  // Cerrar modal al hacer clic fuera de él
  window.addEventListener('click', (e) => {
    if (e.target == modalEdit) {
      modalEdit.style.display = 'none';
    }
  });
  
  // Mostrar mensaje (success, error, info)
  const showMessage = (message, type = 'info') => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
      messageDiv.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      messageDiv.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(messageDiv);
      }, 300);
    }, 3000);
  };
  
  // Inicializar la aplicación
  loadItems();
}); 