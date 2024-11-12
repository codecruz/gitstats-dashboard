const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Ruta para obtener las estadísticas más recientes de los repositorios
router.get('/db-stats', statsController.getStats);

module.exports = router;
