require('dotenv').config();
const initializeDatabase = require('./models/db');
const axios = require('axios');

async function updateGitHubStats() {
    try {
        const { sequelize, Repository, DailyStat } = await initializeDatabase();

        if (!Repository || !DailyStat) {
            throw new Error('Models are not defined');
        }

        // 1. Obtener los repositorios de GitHub
        const githubReposResponse = await axios.get(`https://api.github.com/users/${process.env.GITHUB_USERNAME}/repos`, {
            headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
        });

        if (githubReposResponse.status !== 200) {
            throw new Error(`Failed to fetch repositories from GitHub: ${githubReposResponse.statusText}`);
        }

        const githubRepos = githubReposResponse.data; // Repositorios desde GitHub

        // 2. Obtener los repositorios ya existentes en la base de datos
        const existingRepos = await Repository.findAll({ attributes: ['name'] });
        const existingRepoNames = existingRepos.map(repo => repo.name);

        // 3. Filtrar los repositorios nuevos que no estén en la base de datos
        const newRepos = githubRepos.filter(repo => !existingRepoNames.includes(repo.name));

        // 4. Agregar los repositorios nuevos a la base de datos
        for (const repo of newRepos) {
            await Repository.create({
                name: repo.name,
                githubUrl: repo.html_url,
            });
            console.log(`Added new repository: ${repo.name}`);
        }

        // 5. Obtener todos los repositorios de la base de datos
        const repositories = await Repository.findAll();

        // 6. Actualizar las estadísticas de cada repositorio
        for (const repo of repositories) {
            // Obtener estadísticas de vistas
            const viewsResponse = await axios.get(`https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${repo.name}/traffic/views`, {
                headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
            });

            const { count: views, uniques: uniqueViews } = viewsResponse.data;

            // Obtener estadísticas de clones
            const clonesResponse = await axios.get(`https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${repo.name}/traffic/clones`, {
                headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
            });

            const { count: clones, uniques: uniqueClones } = clonesResponse.data;

            // Crear el registro de estadísticas diarias
            if (views !== undefined && uniqueViews !== undefined && clones !== undefined && uniqueClones !== undefined) {
                await DailyStat.create({
                    repositoryId: repo.id,
                    views,
                    uniqueViews,
                    clones,
                    uniqueClones,
                    date: new Date().toISOString().slice(0, 10),
                });
                console.log(`Updated stats for ${repo.name}`);
            } else {
                console.log(`Data not fully available for ${repo.name}`);
            }
        }
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

updateGitHubStats();
