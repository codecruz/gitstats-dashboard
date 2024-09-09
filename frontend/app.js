document.addEventListener('DOMContentLoaded', async () => {
    const spinner = document.getElementById('spinner');
    const container = document.getElementById('repo-container');
    const header = document.getElementById('header');

    // Muestra el spinner antes de hacer la petición
    spinner.classList.remove('hidden');
    console.log('Spinner visible, haciendo petición...');

    try {
        const response = await fetch('/api/stats');
        if (!response.ok) {
            throw new Error('Error en la respuesta de la API');
        }
        const repos = await response.json();
        console.log('Datos recibidos:', repos);

        // Oculta el spinner
        header.classList.remove('hidden');
        spinner.classList.add('hidden');
        spinner.classList.remove('spinner');
        console.log('Spinner ocultado, mostrando repositorios...');

        // Comprueba si los repositorios están vacíos
        if (repos.length === 0) {
            container.innerHTML = '<p class="text-gray-500">No repositories found.</p>';
            return;
        }

        container.innerHTML = repos.map(repo => `
            <div class="bg-white p-6 rounded-lg shadow-lg">
                <h2 class="text-xl font-semibold text-gray-800">${repo.repo}</h2>
                <a href="https://github.com/${repo.repo}" class="text-blue-500 hover:underline" target="_blank">View on GitHub</a>
                <p class="mt-4"><strong class="text-gray-600">Clones:</strong> ${repo.clones}</p>
                <p class="mt-2"><strong class="text-gray-600">Unique Clones:</strong> ${repo.unique_clones}</p>
                <p class="mt-2"><strong class="text-gray-600">Views:</strong> ${repo.views}</p>
                <p class="mt-2"><strong class="text-gray-600">Unique Views:</strong> ${repo.unique_views}</p>
                <p class="mt-2"><strong class="text-gray-600">Last Updated:</strong> ${new Date(repo.last_updated).toLocaleDateString()}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching data:', error);

        // Oculta el spinner incluso si hay un error
        spinner.classList.add('hidden');
        container.innerHTML = '<p class="text-red-500">Error loading data.</p>';
    }
});
