# CRUD AWS - Sistema de Gestión de Registros con Imágenes

Este proyecto implementa un sistema CRUD básico que permite subir, visualizar, editar y eliminar registros con imágenes. Las imágenes se almacenan en Amazon S3, y la metadata de los registros (incluyendo la URL de la imagen) se guarda en una base de datos relacional en RDS.

## Características

- **Funcionalidad CRUD completa**:
  - Crear registros con nombre, descripción e imagen
  - Ver todos los registros existentes
  - Editar registros existentes
  - Eliminar registros (elimina también la imagen de S3)
- **Backend en Node.js con Express**
- **Almacenamiento en AWS**:
  - Imágenes en S3
  - Datos en RDS MySQL
- **Contenedorización con Docker**

## Requisitos previos

- Docker y Docker Compose (para desarrollo local)
- Cuenta de AWS con acceso a S3 y RDS
- Node.js y npm (para desarrollo sin Docker)

## Configuración

1. Clona este repositorio:
   ```
   git clone https://github.com/Migueh02/CRUD-AWS.git
   cd CRUD-AWS
   ```

2. Crea un archivo `.env` con tus credenciales AWS y configuración:
   ```
   # Configuración del servidor
   PORT=3000

   # Configuración de la base de datos
   DB_HOST=tu-instancia-rds.region.rds.amazonaws.com
   DB_USER=admin
   DB_PASSWORD=password
   DB_NAME=crud_app
   DB_PORT=3306

   # Configuración de AWS S3
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=tu-access-key
   AWS_SECRET_ACCESS_KEY=tu-secret-key
   S3_BUCKET_NAME=tu-bucket-s3
   ```

## Ejecución en desarrollo

### Con Docker Compose (local)

```bash
docker-compose up
```

La aplicación estará disponible en http://localhost:3000.

### Sin Docker (local)

```bash
npm install
npm run dev
```

## Despliegue en AWS

### Opción 1: EC2 con Docker

1. Aprovisiona una instancia EC2 con Amazon Linux 2 o Ubuntu
2. Instala Docker:
   ```bash
   sudo yum update -y
   sudo amazon-linux-extras install docker
   sudo service docker start
   sudo usermod -a -G docker ec2-user
   ```

3. Clona el repositorio y configura las variables de entorno
4. Construye y ejecuta el contenedor:
   ```bash
   docker build -t crud-aws .
   docker run -p 80:3000 --env-file .env -d crud-aws
   ```

### Opción 2: AWS ECS (Elastic Container Service)

1. Crea un repositorio en ECR (Elastic Container Registry)
2. Construye y sube la imagen Docker:
   ```bash
   aws ecr get-login-password --region REGION | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.REGION.amazonaws.com
   docker build -t crud-aws .
   docker tag crud-aws:latest ACCOUNT.dkr.ecr.REGION.amazonaws.com/crud-aws:latest
   docker push ACCOUNT.dkr.ecr.REGION.amazonaws.com/crud-aws:latest
   ```

3. Crea un cluster en ECS
4. Define una task definition con tu imagen Docker y las variables de entorno necesarias
5. Configura un servicio para ejecutar la task

## Estructura del proyecto

```
.
├── app/
│   ├── components/       # Componentes frontend
│   ├── config/           # Configuración de conexiones
│   ├── controllers/      # Controladores de API
│   ├── models/           # Modelos de datos
│   ├── public/           # Archivos estáticos
│   └── routes/           # Rutas de API
├── .env                  # Variables de entorno (no incluido en git)
├── .gitignore
├── docker-compose.yml    # Configuración de Docker Compose
├── Dockerfile            # Configuración de Docker
├── package.json          # Dependencias
├── README.md             # Este archivo
└── server.js             # Punto de entrada de la aplicación
```

## Tecnologías utilizadas

- **Backend**: Node.js, Express, Sequelize ORM
- **Frontend**: HTML, CSS, JavaScript vanilla
- **Base de datos**: MySQL (Amazon RDS)
- **Almacenamiento**: Amazon S3
- **Contenedorización**: Docker
- **Despliegue**: AWS EC2/ECS

## Autor

Miguel - 2023

## Licencia

MIT 