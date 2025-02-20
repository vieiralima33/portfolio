function waitForElement(selector, callback) {
    const element = document.querySelector(selector);
    if (element) {
        callback(element);
    } else {
        setTimeout(() => waitForElement(selector, callback), 100);
    }
}

document.addEventListener("DOMContentLoaded", function () {

    waitForElement("#searchForm", function (searchForm) {

        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const book = document.getElementById("book").value.trim();
            const chapter = document.getElementById("chapter").value.trim();
            const verse = document.getElementById("verse").value.trim();
            const translation = "ALMEIDA";

            if (!book || !chapter || !verse) {
                document.getElementById("verseTxt").innerText = "Por favor, preencha todos os campos!";
                return;
            }

            const url = `https://bible-api.com/${encodeURIComponent(book)}${chapter}:${verse}?translation=${translation}`;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    document.getElementById("chapterTxt").innerText = data.reference;
                    document.getElementById("verseTxt").innerText = data.text || "Versículo não encontrado.";
                })
                .catch(error => {
                    document.getElementById("verseTxt").innerText = "Erro ao buscar o versículo.";
                });
        });
    });
});
