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
                    <div class="canvas-container">
                        <canvas id="chart-${repo.repo}" class="mt-4"></canvas>
                    </div>
                </div>
            `;
        }).join('');  // Genera el HTML para todos los repositorios

        // Crear el gráfico para cada tarjeta después de que se cargue todo el contenido
        githubRepos.forEach(async (repo) => {
            const ctx = document.getElementById(`chart-${repo.repo}`).getContext('2d');
            const dbRepo = latestRepositoryStatsMap[repoNameToIdMap[repo.repo]];

            // Llamar a la función fetchRepositoryStats para obtener los datos para este repositorio
            const data = await fetchRepositoryStats(dbRepo.repositoryId);

            if (data.length === 0) {
                console.warn(`No data available for repository: ${repo.repo}`);
                return;
            }

            // Obtener los datos para el gráfico (ya en el formato correcto)
            const labels = data.map(item => new Date(item.date).toLocaleDateString()); // Fechas
            const clonesData = data.map(item => item.clones);
            const uniqueClonesData = data.map(item => item.uniqueClones);
            const viewsData = data.map(item => item.views);
            const uniqueViewsData = data.map(item => item.uniqueViews);

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Clones',
                        data: clonesData,
                        borderColor: 'blue',
                        fill: false,
                        tension: 0.1
                    }, {
                        label: 'Unique Clones',
                        data: uniqueClonesData,
                        borderColor: 'green',
                        fill: false,
                        tension: 0.1
                    }, {
                        label: 'Views',
                        data: viewsData,
                        borderColor: 'orange',
                        fill: false,
                        tension: 0.1
                    }, {
                        label: 'Unique Views',
                        data: uniqueViewsData,
                        borderColor: 'red',
                        fill: false,
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true, // Ajustar el tamaño del gráfico en función del contenedor
                    scales: {
                        x: {
                            ticks: {
                                display: false  // Ocultar las etiquetas en el eje X
                            },
                            title: {
                                display: false  // Ocultar el título del eje X
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false  // Eliminar la leyenda y los cuadraditos
                        }
                    }
                }
            });
            
            
        });

    } catch (error) {
        console.error('Error fetching data:', error);
        spinner.classList.add('hidden');
        container.innerHTML = '<p class="text-red-500">Error loading data.</p>';
    }
});

// Función para obtener los datos de un repositorio específico
async function fetchRepositoryStats(repositoryId) {
    try {
        // Llamar a la API con el repositoryId (Nota: la URL ahora es http://localhost:3001)
        const response = await fetch(`http://localhost:3001/api/db-stats/${repositoryId}`);

        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        const data = await response.json();

        // Procesar los datos y convertirlos en el formato que necesitas para el gráfico
        const chartData = data.map(item => ({
            date: new Date(item.date).toLocaleDateString(), // Formatear la fecha
            clones: item.clones,
            uniqueClones: item.uniqueClones,
            views: item.views,
            uniqueViews: item.uniqueViews
        }));

        console.log(chartData);  // Mostrar los datos procesados para el gráfico

        return chartData;
    } catch (error) {
        console.error('Error fetching repository stats:', error);
        return [];
    }
}

// Función para obtener las últimas estadísticas de los repositorios
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
