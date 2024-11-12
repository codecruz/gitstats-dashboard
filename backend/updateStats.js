require('dotenv').config();
const initializeDatabase = require('./models/db');
const axios = require('axios');

async function updateGitHubStats() {
    try {
        const { sequelize, Repository, DailyStat } = await initializeDatabase();

        if (!Repository || !DailyStat) {
            throw new Error('Models are not defined');
        }

        const repositories = await Repository.findAll();
        if (!repositories || repositories.length === 0) {
            throw new Error('No repositories found');
        }

        for (const repo of repositories) {
            const viewsResponse = await axios.get(`https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${repo.name}/traffic/views`, {
                headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
            });

            const { count: views, uniques: uniqueViews } = viewsResponse.data;

            const clonesResponse = await axios.get(`https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${repo.name}/traffic/clones`, {
                headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
            });

            const { count: clones, uniques: uniqueClones } = clonesResponse.data;

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
