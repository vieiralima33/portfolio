document.addEventListener("click", (event) => {
    const profilePhoto = document.getElementById("profile-photo");
    const presentation = document.getElementById("presentation");

    if (!profilePhoto || !presentation) return;

    if (event.target.id === "profile-photo") {
        const isToggled = profilePhoto.dataset.toggled === "true";

        presentation.classList.toggle("show");
        profilePhoto.dataset.toggled = (!isToggled).toString();
    }
});