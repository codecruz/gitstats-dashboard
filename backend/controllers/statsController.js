const db = require('../config/db');

exports.getStats = (req, res) => {
    const query = `
        SELECT * FROM dailystats
        WHERE (repositoryId, date) IN (
            SELECT repositoryId, MAX(date) FROM dailystats GROUP BY repositoryId
        )
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener las estadísticas:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        res.json(results);
    });
};
