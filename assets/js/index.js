document.getElementById("profile-photo").addEventListener("click", function() {
    const  presentation = document.getElementById("presentation");
    const  profilePhoto = document.getElementById("profile-photo");
    const isToggled = profilePhoto.dataset.toggled === "true";

    presentation.classList.toggle("show");

    profilePhoto.style.marginRight = isToggled ? "0px" : "-100px";
    profilePhoto.dataset.toggled = !isToggled;
});