const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:3001',  
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));


app.get('/api/username', (req, res) => {
    const username = process.env.GITHUB_USERNAME;
    res.json({ username });
});

app.use(express.static('../frontend'));

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

app.listen(PORT, () => {
});
