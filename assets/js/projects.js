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

var currentBook = '';
var currentChapter = 1;
var currentVerses = [];


// Função para carregar a Bíblia com a tradução escolhida
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

            // Se o livro atual for o mesmo do selecionado, mostramos os capítulos
            if (book.name === currentBook) {
                toggleChapters(bookItem, book, true);
            }
        });

    } catch (error) {
        console.error("Erro ao carregar a Bíblia:", error);
        document.querySelector("#books ul").innerHTML = "<li class='text-danger'>Erro ao carregar os livros.</li>";
    }
}

// Função para alternar os capítulos
function toggleChapters(bookItem, book, isInitialLoad = false) {
    const chaptersContainer = bookItem.querySelector(".chapters");
    const isExpanded = !chaptersContainer.classList.contains("d-none");

    // Oculta os capítulos de todos os livros
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

        // Se for a carga inicial, mantém o capítulo selecionado
        if (isInitialLoad && currentChapter) {
            selectChapter(book.name, currentChapter, book.chapters[currentChapter - 1]);
        }
    }
}

// Função para selecionar um capítulo
function selectChapter(bookName, chapterNumber, verses) {
    currentBook = bookName; // Armazenamos o livro atual
    currentChapter = chapterNumber; // Armazenamos o capítulo atual
    currentVerses = verses; // Armazenamos os versículos

    document.getElementById("chapterTxt").textContent = `${bookName} ${chapterNumber}`;
    const versesText = verses.map((verse, index) => `<strong>${index + 1}.</strong> ${verse}`).join("<br/> ");
    document.getElementById("verseTxt").innerHTML = versesText;
}

// Função que altera a tradução e carrega o versículo selecionado
function changeTranslation(translation) {
    loadBible(translation.toLowerCase() + '.json'); // Carrega a nova tradução

    // Exibe a mensagem do modal
    const modalMessage = document.getElementById('modalMessage');
    modalMessage.textContent = 'Translation changed to ' + translation + '!';

    // Exibe o modal de sucesso
    const modal = new bootstrap.Modal(document.getElementById('translationModal'));
    modal.show();

    // Recarrega o capítulo/versículo atual com a nova tradução
    if (currentBook && currentChapter && currentVerses.length > 0) {
        // Carrega os dados da nova tradução
        const bookData = bibleJson.find(book => book.name === currentBook);
        if (bookData) {
            selectChapter(currentBook, currentChapter, bookData.chapters[currentChapter - 1]);
        }
    } else {
        // Caso não haja um capítulo ou versículo selecionado, carrega o primeiro capítulo/versículo de um livro
        if (bibleJson.length > 0) {
            const firstBook = bibleJson[0]; // Primeiro livro da Bíblia
            selectChapter(firstBook.name, 1, firstBook.chapters[0]);
        }
    }
}

// Carregando a tradução inicial
loadBible();