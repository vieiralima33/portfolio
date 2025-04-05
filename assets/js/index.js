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
    if (page.includes('project.html')) {
        scriptPath = './assets/js/project.js';
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
let menu = document.getElementById("collapsibleNavId");
let toggleButton = document.getElementById("menuToggle");
let links = document.querySelectorAll("#collapsibleNavId .nav-link");

toggleButton.addEventListener("click", () => {
    menu.classList.toggle("d-none");
});

links.forEach(link => {
    link.addEventListener("click", () => {
        menu.classList.add("d-none");
    });
});

