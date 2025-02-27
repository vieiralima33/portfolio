function loadPage(page) {
    fetch(page)
        .then(response => response.text())
        .then(html => {
            document.getElementById('content').innerHTML = html;
            loadPageScript(page); 
        })
        .catch(error => console.error('Error loading page:', error));
}

function loadPageScript(page) {
    let scriptPath = '';
    if (page.includes('projects.html')) {
        scriptPath = './assets/js/projects.js';
    }

    if (scriptPath) {
        const script = document.createElement('script');
        script.src = scriptPath;
        script.defer = true;
        script.dataset.pagina = true;
        document.body.appendChild(script);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadPage('./src/about.html');
});