document.getElementById('content').addEventListener('click', function (event) {
    if (event.target.classList.contains('btn-primary')) {
        const bookItem = event.target.parentElement;
        const bookName = event.target.textContent;
        const bookData = bibleJson.find(book => book.name === bookName);
        if (bookData) {
            toggleChapters(bookItem, bookData);
        }
    }
    if (event.target.classList.contains('btn-secondary')){
        const bookName = event.target.parentElement.parentElement.querySelector('a').textContent;
        const bookData = bibleJson.find(book => book.name === bookName);
        const chapters = event.target.parentElement;
        const chapterIndex = Array.from(chapters.children).indexOf(event.target);
        selectChapter(bookData.name, chapterIndex + 1, bookData.chapters[chapterIndex]);
    }
});

async function loadBible() {
    try {
        const response = await fetch('./assets/json/aa.json');
        bibleJson = await response.json();
        const booksContainer = document.querySelector("#books ul");
        booksContainer.innerHTML = "";
        bibleJson.forEach(book => {
            const bookItem = document.createElement("li");
            bookItem.classList.add("list-group");
            const bookButton = document.createElement("a");
            bookButton.classList.add("btn", "btn-primary", "bg-gradient", "fw-semibold", "rounded-0", "w-100");
            bookButton.textContent = book.name;
            const chaptersContainer = document.createElement("div");
            chaptersContainer.classList.add("chapters", "d-none", "mt-1");
            bookItem.appendChild(bookButton);
            bookItem.appendChild(chaptersContainer);
            booksContainer.appendChild(bookItem);
        });
    } catch (error) {
        console.error("Erro ao carregar a Bíblia:", error);
        document.querySelector("#books ul").innerHTML = "<li class='text-danger'>Erro ao carregar os livros.</li>";
    }
}

loadBible();

function toggleChapters(bookItem, book) {
    const chaptersContainer = bookItem.querySelector(".chapters");
    const isExpanded = !chaptersContainer.classList.contains("d-none");

    document.querySelectorAll(".chapters").forEach(chap => chap.classList.add("d-none"));

    if (isExpanded) {
        chaptersContainer.classList.add("d-none");
    } else {
        chaptersContainer.innerHTML = "";
        book.chapters.forEach((verses, index) => {
            const chapterButton = document.createElement("button");
            chapterButton.classList.add("btn", "btn-secondary", "bg-gradient", "fw-semibold", "mb-1", "col-4");
            chapterButton.textContent = index < 9 ? `0${index + 1}`:`${index + 1}`;
            chapterButton.onclick = () => selectChapter(book.name, index + 1, verses);

            chaptersContainer.appendChild(chapterButton);
        });

        chaptersContainer.classList.remove("d-none"); 
    }
}

function selectChapter(bookName, chapterNumber, verses) {
    document.getElementById("chapterTxt").textContent = `${bookName} ${chapterNumber}`;
    const versesText = verses.map((verse, index) => `<strong>${index + 1}.</strong> ${verse}`).join("<br/> ");
    document.getElementById("verseTxt").innerHTML = versesText;
}
