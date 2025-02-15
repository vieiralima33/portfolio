function loadPage(page) {
    fetch(page)
        .then(response => response.text())
        .then(html => {
            document.getElementById('content').innerHTML = html;
            
            const profilePhoto = document.getElementById("profile-photo");
            if (profilePhoto) {
                profilePhoto.addEventListener("click", toggleProfile);
            }
        })
        .catch(error => console.error('Error loading page:', error));
}

function toggleProfile() {
    const presentation = document.getElementById("presentation");
    const profilePhoto = document.getElementById("profile-photo");
    if (!presentation || !profilePhoto) return;

    const isToggled = profilePhoto.dataset.toggled === "true";

    presentation.classList.toggle("show");
    profilePhoto.style.marginRight = isToggled ? "0px" : "-100px";
    profilePhoto.dataset.toggled = !isToggled;
}

document.addEventListener("DOMContentLoaded", () => {
    loadPage('about.html');
});