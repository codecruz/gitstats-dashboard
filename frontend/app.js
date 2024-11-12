document.addEventListener('DOMContentLoaded', async () => {
    const spinner = document.getElementById('spinner');
    const container = document.getElementById('repo-container');
    const header = document.getElementById('header');

    spinner.classList.remove('hidden');

    try {
        const usernameResponse = await fetch('/api/username');
        if (!usernameResponse.ok) {
            throw new Error('Error fetching username');
        }
        const { username } = await usernameResponse.json();

        const githubResponse = await fetch('/api/stats');
        if (!githubResponse.ok) {
            throw new Error('Error fetching GitHub data');
        }
        const githubRepos = await githubResponse.json();

        console.log("Github Repos");
        console.log(githubRepos);

        const dbStatsResponse = await fetch('http://localhost:3001/api/db-stats');
        if (!dbStatsResponse.ok) {
            throw new Error('Error fetching DB data');
        }
        const dbRepos = await dbStatsResponse.json();

        const latestRepositoryStats = getLatestStats(dbRepos);

        const latestRepositoryStatsMap = latestRepositoryStats.reduce((acc, repo) => {
            acc[repo.repositoryId] = repo;
            return acc;
        }, {});

        const repoNameToIdMap = githubRepos.reduce((acc, repo, index) => {
            acc[repo.repo] = index + 1;
            return acc;
        }, {});

        header.classList.remove('hidden');
        spinner.classList.add('hidden');
        spinner.classList.remove('spinner');

        if (githubRepos.length === 0) {
            container.innerHTML = '<p class="text-gray-500">No repositories found.</p>';
            return;
        }

        container.innerHTML = githubRepos.map((repo) => {
            const dbRepo = latestRepositoryStatsMap[repoNameToIdMap[repo.repo]];

            let clonesChange = 'No Change';
            let viewsChange = 'No Change';
            let uniqueClones = "No Change";
            let uniqueViews = "No Change";



            if (dbRepo) {
                if (repo.clones > dbRepo.clones) {
                    diff = repo.clones - dbRepo.clones;
                    clonesChange = '+' + diff;
                } else if (repo.clones < dbRepo.clones) {
                    diff = dbRepo.clones - repo.clones;
                    clonesChange = '-' + diff;
                }

                if (repo.views > dbRepo.views) {
                    diff = repo.views - dbRepo.views;
                    viewsChange = '+' + diff;
                } else if (repo.views < dbRepo.views) {
                    diff = dbRepo.views - repo.views;
                    viewsChange = '-' + diff;
                }

                if (repo.unique_clones > dbRepo.unique_clones) {
                    diff = repo.unique_clones - dbRepo.unique_clones;
                    uniqueClones = '+' + diff;
                } else if (repo.unique_clones < dbRepo.unique_clones) {
                    diff = dbRepo.unique_clones - repo.unique_clones;
                    uniqueClones = '-' + diff;
                }

                if (repo.unique_views > dbRepo.unique_views) {
                    diff = repo.unique_views - dbRepo.unique_views;
                    uniqueViews = '+' + diff;
                } else if (repo.unique_views < dbRepo.unique_views) {
                    diff = dbRepo.unique_views - repo.unique_views;
                    uniqueViews = '-' + diff;
                }
            }

            return ` 
                <div class="bg-white p-6 rounded-lg shadow-lg">
                    <h2 class="text-xl font-semibold text-gray-800">${repo.repo}</h2>
                    <a href="https://github.com/${username}/${repo.repo}" class="text-blue-500 hover:underline" target="_blank">View on GitHub</a>
                    <p class="mt-4"><strong class="text-gray-600">Clones:</strong> ${repo.clones} <span class="text-sm text-gray-500">(${clonesChange})</span></p>
                    <p class="mt-2"><strong class="text-gray-600">Unique Clones:</strong> ${repo.unique_clones} <span class="text-sm text-gray-500">(${uniqueClones})</span></p>
                    <p class="mt-2"><strong class="text-gray-600">Views:</strong> ${repo.views} <span class="text-sm text-gray-500">(${viewsChange})</span></p>
                    <p class="mt-2"><strong class="text-gray-600">Unique Views:</strong> ${repo.unique_views} <span class="text-sm text-gray-500">(${uniqueViews})</span></p>
                    <p class="mt-2"><strong class="text-gray-600">Last Updated:</strong> ${new Date(repo.last_updated).toLocaleDateString()}</p>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error fetching data:', error);
        spinner.classList.add('hidden');
        container.innerHTML = '<p class="text-red-500">Error loading data.</p>';
    }
});

function getLatestStats(data) {
    const latestStats = {};

    data.forEach(record => {
        const repoId = record.repositoryId;

        if (!latestStats[repoId] || new Date(record.updatedAt) > new Date(latestStats[repoId].updatedAt)) {
            latestStats[repoId] = record;  // Guardar el registro más reciente
        }
    });

    console.log("Local Repos");
    console.log(Object.values(latestStats));

    return Object.values(latestStats);
}
