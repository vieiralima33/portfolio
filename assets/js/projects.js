var currentBook = '';
var currentChapter = 1;
var currentVerses = [];
var currentTranslation = 'aa.json';
var bookMapping = {};

async function loadBookMapping() {
    try {
        const response = await fetch('./assets/json/book_mapping.json');
        bookMapping = await response.json();
    } catch (error) {
        console.error("Erro ao carregar o mapeamento dos livros:", error);
    }
}

document.getElementById("toggleButton").addEventListener("click", function () {
    const booksContainer = document.getElementById("books");
    const expandIcon = document.getElementById("expand-icon");
    const compressIcon = document.getElementById("compress-icon");

    booksContainer.classList.toggle("d-none");

    expandIcon.classList.toggle("d-none");
    compressIcon.classList.toggle("d-none");
});

var bibleCache = {};

async function loadBible() {
    try {
        const response = await fetch(`./assets/json/${currentTranslation}`);
        bibleJson = await response.json();
        const booksContainer = document.querySelector("#books ul");
        booksContainer.innerHTML = "";
        
        const fragment = document.createDocumentFragment();
        
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
            fragment.appendChild(bookItem);
            
            bookButton.addEventListener("click", () => toggleChapters(bookItem, book));
            
            if (!currentBook) {
                if (
                    (currentTranslation === 'aa.json' && book.name === "Gênesis") ||
                    (currentTranslation === 'kjv.json' && book.name === "Genesis")
                ) {
                    currentBook = book.name;
                    selectChapter(book.name, 1, book.chapters[0]);
                }
            }
        });
        
        booksContainer.appendChild(fragment);
        
        if (!currentBook) {
            defaultBook();
        }
    } catch (error) {
        console.error("Erro ao carregar a Bíblia:", error);
        document.querySelector("#books ul").innerHTML = "<li class='text-danger'>Erro ao carregar os livros.</li>";
    }
}

document.querySelector(".dropdown-menu").addEventListener("click", function (event) {
    if (event.target.tagName === 'A') {
        const translation = event.target.getAttribute("data-translation");
        changeTranslation(translation);
        event.preventDefault();
    }
});

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
function getMappedBookName(targetTranslation, currentBookName) {
    if (targetTranslation.toUpperCase() === "AA") {
        if (bookMapping["AA"] && bookMapping["AA"][currentBookName]) {
            return currentBookName;
        } else {
            for (let key in bookMapping["KJV"]) {
                if (bookMapping["KJV"][key] === currentBookName) {
                    return key;
                }
            }
        }
    } else if (targetTranslation.toUpperCase() === "KJV") {
        if (bookMapping["KJV"] && bookMapping["KJV"][currentBookName]) {
            return bookMapping["KJV"][currentBookName];
        } else {
            for (let key in bookMapping["AA"]) {
                if (bookMapping["AA"][key] === currentBookName && bookMapping["KJV"][key]) {
                    return bookMapping["KJV"][key];
                }
            }
        }
    }
    return currentBookName;
}

async function changeTranslation(translation) {
    const previousBook = currentBook;
    const previousChapter = currentChapter;
    
    currentTranslation = translation.toLowerCase() + '.json';
    
    await loadBible();
    
    if (previousBook && previousChapter) {
        const mappedBookName = getMappedBookName(translation, previousBook);
        currentBook = mappedBookName;
        const bookData = bibleJson.find(book => book.name === mappedBookName);
        if (bookData) {
            const booksContainer = document.querySelector("#books ul");
            const bookItems = booksContainer.querySelectorAll("li");
            let bookItemToToggle = null;
            
            bookItems.forEach(bookItem => {
                if (bookItem.querySelector("a").textContent === mappedBookName) {
                    bookItemToToggle = bookItem;
                }
            });
            
            if (bookItemToToggle) {
                toggleChapters(bookItemToToggle, bookData, true);
                selectChapter(mappedBookName, previousChapter, bookData.chapters[previousChapter - 1]);
            }
        } else {
            defaultBook();
        }
    } else {
        defaultBook();
    }
}

function defaultBook() {
    if (!currentBook) {
        const firstBook = bibleJson[0];
        selectChapter(firstBook.name, 1, firstBook.chapters[0]);
    }
}

loadBookMapping();
loadBible();
