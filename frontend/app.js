document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('/api/stats');
    const repos = await response.json();
    
    const container = document.getElementById('repo-container');
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
});
