// backend/app.js
const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const initializeDatabase = require('./models/db'); // Importa la función de inicialización

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializa la base de datos y sincroniza las tablas
initializeDatabase().then(({ sequelize }) => {
    sequelize.sync({ alter: true })
        .then(() => {
            console.log('Database & tables created!');
        })
        .catch(err => {
            console.error('Error creating database:', err);
        });

    // Ruta para obtener el nombre de usuario de GitHub
    app.get('/api/username', (req, res) => {
        const username = process.env.GITHUB_USERNAME;
        res.json({ username });
    });

    // Sirve los archivos estáticos desde el frontend
    app.use(express.static('../frontend'));

    // Función para obtener todos los repositorios
    async function fetchAllRepos(username, token) {
        let repos = [];
        let page = 1;
        let hasNextPage = true;

        while (hasNextPage) {
            const url = `https://api.github.com/users/${username}/repos?per_page=100&page=${page}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }

            const data = await response.json();
            repos = repos.concat(data);

            const linkHeader = response.headers.get('link');
            if (linkHeader && linkHeader.includes('rel="next"')) {
                page++;
            } else {
                hasNextPage = false;
            }
        }

        return repos;
    }

    // Ruta para obtener las estadísticas de los repositorios
    app.get('/api/stats', async (req, res) => {
        const token = process.env.GITHUB_TOKEN;
        const username = process.env.GITHUB_USERNAME;

        try {
            const repos = await fetchAllRepos(username, token);
            const statsData = [];

            for (const repo of repos) {
                const cloneUrl = `https://api.github.com/repos/${username}/${repo.name}/traffic/clones`;
                const cloneResponse = await fetch(cloneUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });

                let cloneData = { count: 'Data not available', uniques: 'Data not available' };
                if (cloneResponse.ok) {
                    cloneData = await cloneResponse.json();
                }

                const viewUrl = `https://api.github.com/repos/${username}/${repo.name}/traffic/views`;
                const viewResponse = await fetch(viewUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });

                let viewData = { count: 'Data not available', uniques: 'Data not available' };
                if (viewResponse.ok) {
                    viewData = await viewResponse.json();
                }

                statsData.push({
                    repo: repo.name,
                    clones: cloneData.count,
                    unique_clones: cloneData.uniques,
                    views: viewData.count,
                    unique_views: viewData.uniques,
                    last_updated: repo.updated_at
                });
            }

            res.json(statsData);
        } catch (error) {
            res.status(500).json({ error: error.toString() });
        }
    });

    // Inicia el servidor después de que se complete la inicialización
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
});
