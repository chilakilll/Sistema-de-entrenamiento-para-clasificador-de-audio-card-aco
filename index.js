const express = require('express');
const app = express();
const mysql = require('mysql2/promise');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;
const Joi = require('joi');
const bcrypt = require('bcrypt');

// Middleware
app.use(express.static('public')); // Para servir archivos estáticos
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Validación de datos de registro
const registerSchema = Joi.object({
  nombre: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  aceptarTerminos: Joi.boolean().required(),
});

// Configuración de Multer (archivos se guardan en /uploads)
const storage = multer.diskStorage({  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });


// Conexión a MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'RodoCaroUva@2008',
  database: 'heartforge'
});

(async () => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS now');
    console.log('✅ Conexión a MySQL exitosa:', rows[0]);
  } catch (err) {
    console.error('❌ Error de conexión inicial:', err);
  }
})();



// Ruta para registro de usuarios
app.post('/register', async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const { nombre, email, password, aceptarTerminos } = req.body;

  if (!aceptarTerminos) {
    return res.status(400).json({ success: false, message: 'Debe aceptar los términos y condiciones' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const [existingUsers] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'El usuario ya está registrado' });
    }

    await pool.query('INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)', [nombre, email, hashedPassword]);
    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// Ruta para inicio de sesión
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [results] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [email]);

    if (results.length === 0) {
      return res.json({
        success: false,
        message: 'No se encontró el usuario. Por favor regístrese.'
      });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.contrasena);

    if (isMatch) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false, message: 'Contraseña incorrecta' });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});


// Ruta para subir archivo de audio
app.post('/subir', upload.single('audio'), async (req, res) => {

try {
    // Verifica que se haya recibido el archivo
    if (!req.file) {
      return res.status(400).send("No se recibió el archivo");
    }

    // Muestra en consola el archivo recibido y los datos del formulario
    console.log("Archivo recibido:", req.file);
    console.log("Datos recibidos:", req.body);

    // Extraer campos del formulario
    const { nombre_paciente, sexo, edad, estatura, peso, categoria } = req.body;
    const nombre_archivo = req.file.filename;

    // Suponiendo que tienes el usuario autenticado, por ahora pondremos un usuario_id fijo (reemplaza esto según tu sistema de login)
    const usuario_id = 1; // <-- REEMPLAZAR con el ID del usuario actual si está autenticado

    // Inserta los datos en la base de datos
    const sql = `
      INSERT INTO audios (usuario_id, nombre_archivo, fecha_subida, categoria, nombre_paciente, edad, estatura, peso, sexo)
      VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?)
    `;

    await pool.query(sql, [usuario_id, nombre_archivo, categoria, nombre_paciente, edad, estatura, peso, sexo]);

    // Responde al frontend con éxito
    res.send("✅ Archivo subido y datos registrados con éxito");

  } catch (error) {
    console.error("Error al subir el archivo:", error);
    res.status(500).send("Error en el servidor");
  }
});

// Carpeta estática para los archivos sub

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});