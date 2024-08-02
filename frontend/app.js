document.addEventListener("DOMContentLoaded", function () {
    fetch('/api/stats')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Network response was not ok ' + response.statusText);
            }
        })
        .then(data => {
            const statsDiv = document.getElementById('stats');
            statsDiv.innerHTML = ''; // Limpiar contenido previo

            data.forEach(repoData => {
                const repoElement = document.createElement('div');
                repoElement.classList.add('bg-white', 'p-4', 'rounded', 'shadow', 'transition', 'transform', 'hover:scale-105');

                repoElement.innerHTML = `
                <h2 class="text-xl font-bold mb-2">${repoData.repo}</h2>
                <div class="mb-4">
                    <h3 class="text-lg font-semibold">Clones</h3>
                    <p class="text-gray-700">Total: <span class="font-semibold">${repoData.clones}</span></p>
                    <p class="text-gray-700">Unique: <span class="font-semibold">${repoData.unique_clones}</span></p>
                </div>
                <div>
                    <h3 class="text-lg font-semibold">Visits</h3>
                    <p class="text-gray-700">Total: <span class="font-semibold">${repoData.views}</span></p>
                    <p class="text-gray-700">Unique: <span class="font-semibold">${repoData.unique_views}</span></p>
                </div>
            `;
                statsDiv.appendChild(repoElement);
            });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
});
