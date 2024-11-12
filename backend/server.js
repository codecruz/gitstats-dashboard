const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3001; // O el puerto que prefieras

const cors = require('cors');

// Crea una instancia de la aplicación Express

// Habilita CORS para permitir solicitudes desde http://localhost:3000
app.use(cors({
  origin: 'http://localhost:3000', // Permite solicitudes solo desde el frontend
  methods: ['GET', 'POST'], // Métodos permitidos
  allowedHeaders: ['Content-Type'], // Cabeceras permitidas
}));


// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Cambia según tu configuración
    password: '', // Cambia según tu configuración
    database: 'githubstats_db' // Nombre de la base de datos
});

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

// Ruta para obtener los últimos registros de cada repositorio
app.get('/api/db-stats', (req, res) => {
    const query = `
        SELECT * FROM dailystats
        WHERE (repositoryId, date) IN (
            SELECT repositoryId, MAX(date) FROM dailystats GROUP BY repositoryId
        )
    `;

    // Ejecutar la consulta SQL para obtener los últimos registros
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al consultar los registros de la base de datos:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        // Retornar los resultados como JSON
        res.json(results);
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor en ejecución en http://localhost:${port}`);
});
