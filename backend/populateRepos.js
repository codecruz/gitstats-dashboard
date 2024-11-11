require('dotenv').config();
const axios = require('axios');
const initializeDatabase = require('./models/db');

async function fetchAllRepos(username, token) {
    let repos = [];
    let page = 1;
    let hasNextPage = true;

    while (hasNextPage) {
        const url = `https://api.github.com/users/${username}/repos?per_page=100&page=${page}`;
        try {
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.status !== 200) {
                throw new Error(`API responded with status code: ${response.status}`);
            }

            const data = response.data;
            repos = repos.concat(data);

            const linkHeader = response.headers['link'];
            if (linkHeader && linkHeader.includes('rel="next"')) {
                page++;
            } else {
                hasNextPage = false;
            }
        } catch (error) {
            console.error('Error fetching repos:', error.message);
            throw error; 
        }
    }

    return repos;
}

async function populateRepositories() {
    try {
        const { sequelize, Repository } = await initializeDatabase();

        const username = process.env.GITHUB_USERNAME;
        const token = process.env.GITHUB_TOKEN;

        const repos = await fetchAllRepos(username, token);

        for (const repo of repos) {
            await Repository.create({
                name: repo.name,
                githubUrl: repo.html_url,
            });
            console.log(`Repository ${repo.name} added to the database`);
        }

        console.log('All repositories have been added to the database!');
        sequelize.close();
    } catch (error) {
        console.error('Error populating repositories:', error.message);
    }
}

populateRepositories();
