document.getElementById('books').addEventListener('click', function (event) {
    if (event.target.classList.contains('btn-dark')) {
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

document.getElementById("toggleButton").addEventListener("click", function () {
    const booksDiv = document.getElementById("books");
    const expandIco = document.getElementById("expand-icon");
    const compressIco = document.getElementById("compress-icon");
    expandIco.classList.toggle("d-none");
    compressIco.classList.toggle("d-none");
    booksDiv.classList.toggle("d-none");
});

var currentBook = '';
var currentChapter = 1;
var currentVerses = [];


async function loadBible(translate = 'aa.json') {
    try {
        const response = await fetch(`./assets/json/${translate}`);
        bibleJson = await response.json();
        const booksContainer = document.querySelector("#books ul");
        booksContainer.innerHTML = "";

        bibleJson.forEach(book => {
            const bookItem = document.createElement("li");
            bookItem.classList.add("list-group");
            const bookButton = document.createElement("a");
            bookButton.classList.add("btn", "btn-dark", "bg-gradient", "fw-semibold", "rounded-0");
            bookButton.textContent = book.name;
            const chaptersContainer = document.createElement("div");
            chaptersContainer.classList.add("chapters", "d-none", "py-1");
            bookItem.appendChild(bookButton);
            bookItem.appendChild(chaptersContainer);
            booksContainer.appendChild(bookItem);

            if (book.name === currentBook) {
                toggleChapters(bookItem, book, true);
            } else {
                defaultBook(currentBook)
            }
        });

    } catch (error) {
        console.error("Erro ao carregar a Bíblia:", error);
        document.querySelector("#books ul").innerHTML = "<li class='text-danger'>Erro ao carregar os livros.</li>";
    }
}

function toggleChapters(bookItem, book, isInitialLoad = false) {
    const chaptersContainer = bookItem.querySelector(".chapters");
    const isExpanded = !chaptersContainer.classList.contains("d-none");

    document.querySelectorAll(".chapters").forEach(chap => chap.classList.add("d-none", "bg-dark"));

    if (isExpanded) {
        chaptersContainer.classList.add("d-none");
    } else {
        chaptersContainer.innerHTML = "";
        book.chapters.forEach((verses, index) => {
            const chapterButton = document.createElement("button");
            chapterButton.classList.add("btn", "btn-secondary", "bg-gradient", "fw-semibold", "p-1", "m-1", "col-sm-3", "col-4");
            chapterButton.textContent = index < 9 ? `0${index + 1}` : `${index + 1}`;
            chapterButton.onclick = () => selectChapter(book.name, index + 1, verses);

            chaptersContainer.appendChild(chapterButton);
        });

        chaptersContainer.classList.remove("d-none");

        if (isInitialLoad && currentChapter) {
            selectChapter(book.name, currentChapter, book.chapters[currentChapter - 1]);
        }
    }
}

function selectChapter(bookName, chapterNumber, verses) {
    currentBook = bookName; 
    currentChapter = chapterNumber; 
    currentVerses = verses; 

    document.getElementById("chapterTxt").textContent = `${bookName.toUpperCase()} ${chapterNumber}`;
    const versesText = verses.map((verse, index) => `<span style="color: #00c3ffc0;">${index + 1}.</span> ${verse}`).join("<br/>");
    document.getElementById("verseTxt").innerHTML = versesText;
}

function changeTranslation(translation) {
    loadBible(translation.toLowerCase() + '.json');

    const modalMessage = document.getElementById('modalMessage');
    modalMessage.textContent = 'Translation changed to ' + translation + '!';

    const modal = new bootstrap.Modal(document.getElementById('translationModal'));
    modal.show();

    if (currentBook && currentChapter && currentVerses.length > 0) {
        const bookData = bibleJson.find(book => book.name === currentBook);
        if (bookData) {
            selectChapter(currentBook, currentChapter, bookData.chapters[currentChapter - 1]);
        }
    } else {
        defaultBook(currentBook);
    }
}
function defaultBook(currentBook){
    if (currentBook.length == 0) {
        const firstBook = bibleJson[0];
        selectChapter(firstBook.name, 1, firstBook.chapters[0]);
    }
}

loadBible();