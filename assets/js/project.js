var currentBook = '';
var currentChapter = 1;
var currentVerses = [];
var currentTranslation = 'aa.json';
var bookMapping = {};
var bibleCache = {};
var synth = window.speechSynthesis;
var voices = [];
var currentUtterance = null;
var voice;

async function loadBookMapping() {
    try {
        const response = await fetch('./assets/json/book_mapping.json');
        bookMapping = await response.json();
    } catch (error) {
        console.error("Erro ao carregar o mapeamento dos livros:", error);
    }
}

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
// EVENT LISTENERS SECTION
document.getElementById("toggleButton").addEventListener("click", function () {
    const booksContainer = document.getElementById("books");
    const expandIcon = document.getElementById("expand-icon");
    const compressIcon = document.getElementById("compress-icon");

    booksContainer.classList.toggle("d-none");

    expandIcon.classList.toggle("d-none");
    compressIcon.classList.toggle("d-none");
});

document.querySelector("#dropdown-translation").addEventListener("click", function (event) {
    if (event.target.tagName === 'A') {
        const translation = event.target.getAttribute("data-translation");
        changeTranslation(translation);
        event.preventDefault();
    }
});
document.querySelector("#dropdown-voice").addEventListener("click", function (event) {
    if (event.target.tagName === 'A') {
        const voiceIndex = event.target.getAttribute("data-voice-index");
        voice = voices[voiceIndex];
        event.preventDefault();
    }
});

document.querySelector(".fa-arrow-left").closest("button").addEventListener("click", () => {
    const bookIndex = bibleJson.findIndex(book => book.name === currentBook);
    if (bookIndex === -1) return;

    if (currentChapter > 1) {
        currentChapter -= 1;
    } else if (bookIndex > 0) {
        const previousBook = bibleJson[bookIndex - 1];
        currentBook = previousBook.name;
        currentChapter = previousBook.chapters.length;
    } else {
        return;
    }

    const updatedBook = bibleJson.find(book => book.name === currentBook);
    currentVerses = updatedBook.chapters[currentChapter - 1];

    openChapterInUI(updatedBook);
    selectChapter(currentBook, currentChapter, currentVerses);
});

document.querySelector(".fa-arrow-right").closest("button").addEventListener("click", () => {
    const bookIndex = bibleJson.findIndex(book => book.name === currentBook);
    if (bookIndex === -1) return;

    const currentBookData = bibleJson[bookIndex];

    if (currentChapter < currentBookData.chapters.length) {
        currentChapter += 1;
    } else if (bookIndex < bibleJson.length - 1) {
        const nextBook = bibleJson[bookIndex + 1];
        currentBook = nextBook.name;
        currentChapter = 1;
    } else {
        return;
    }

    const updatedBook = bibleJson.find(book => book.name === currentBook);
    currentVerses = updatedBook.chapters[currentChapter - 1];

    openChapterInUI(updatedBook);
    selectChapter(currentBook, currentChapter, currentVerses);
});

function toggleChapters(bookItem, book, isInitialLoad = false) {
    const chaptersContainer = bookItem.querySelector(".chapters");
    const isExpanded = !chaptersContainer.classList.contains("d-none");
    const bookButton = bookItem.querySelector("a");

    document.querySelectorAll(".chapters").forEach(chap => chap.classList.add("d-none"));
    document.querySelectorAll("#books ul li a").forEach(btn => btn.classList.remove("active"));

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

        bookButton.classList.add("active");

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

    document.querySelectorAll("#books ul li").forEach(bookItem => {
        const bookButton = bookItem.querySelector("a");
        if (bookButton.textContent === bookName) {
            bookButton.classList.add("active");
        } else {
            bookButton.classList.remove("active");
        }
        stopReading();
    });

    document.querySelectorAll(".chapters").forEach(chaptersContainer => {
        chaptersContainer.querySelectorAll("button").forEach((chapterBtn, index) => {
            if (index + 1 === chapterNumber) {
                chapterBtn.classList.add("active");
            } else {
                chapterBtn.classList.remove("active");
            }
        });
    });

    document.querySelectorAll(".chapters").forEach(chaptersContainer => {
        chaptersContainer.querySelectorAll("button").forEach((chapterBtn, index) => {
            if (index + 1 === chapterNumber) {
                chapterBtn.classList.add("selected-chapter");
            } else {
                chapterBtn.classList.remove("selected-chapter");
            }
        });
    });
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
    if (currentTranslation === 'aa.json') {
        voice = voices.find(v => v.lang.startsWith('pt'));
    } else if (currentTranslation === 'kjv.json') {
        voice = voices.find(v => v.lang.startsWith('en'));
    }
}

function defaultBook() {
    if (!currentBook) {
        const firstBook = bibleJson[0];
        selectChapter(firstBook.name, 1, firstBook.chapters[0]);
    }
}

function openChapterInUI(bookData) {
    const bookItems = document.querySelectorAll("#books ul li");
    bookItems.forEach(bookItem => {
        const bookName = bookItem.querySelector("a").textContent;
        const chaptersContainer = bookItem.querySelector(".chapters");

        if (bookName === bookData.name) {
            const isOpen = !chaptersContainer.classList.contains("d-none");

            if (!isOpen) {
                toggleChapters(bookItem, bookData, true);
            }
        } else {
            chaptersContainer.classList.add("d-none");
        }
    });
}

async function initVoices() {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            voices = synth.getVoices();
            if (voices.length > 0) {
                clearInterval(interval);
                resolve(voices);
            }
        }, 100);
    });
}

async function setVoice() {
    voices = await initVoices();
    voices = voices.filter(v => v.lang.startsWith("pt") || v.lang.startsWith("en"));
    const seen = new Set();
    voices = voices.filter(v => {
        const key = v.name + v.lang;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    const voiceDropdown = document.querySelector("#dropdown-voice");
    if (!voiceDropdown) return;

    voiceDropdown.innerHTML = "";

    voices.forEach((voice, index) => {
        const voiceItem = document.createElement("li");
        const voiceLink = document.createElement("a");
        voiceLink.classList.add("dropdown-item", "text-info");
        voiceLink.href = "#";
        voiceLink.textContent = `${voice.name} (${voice.lang})`;
        voiceLink.setAttribute("data-voice-index", index);
        voiceItem.appendChild(voiceLink);
        voiceDropdown.appendChild(voiceItem);
    });
}

if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = setVoice();
}

document.getElementById("readChapterBtn").addEventListener("click", () => {
    stopReading();

    if (!currentVerses || currentVerses.length === 0) return;

    const text = currentVerses.map((verse, i) => `${i + 1}. ${verse}`).join(" ");
    const parts = text.split(/(?<=[.!?])\s+/);
    const utterance = new SpeechSynthesisUtterance(
        parts.forEach(part => {
        const u = new SpeechSynthesisUtterance(part);
        if (voice) {
            u.voice = voice;
            u.lang = voice.lang;
        }
        speechSynthesis.speak(u);
    }));
    currentUtterance = utterance;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    setTimeout(() => {
        synth.speak(utterance);
        updateIcons("playing");
    }, 100);
});


document.getElementById("pauseBtn").addEventListener("click", () => {
    if (synth.speaking && !synth.paused) {
        synth.pause();
        updateIcons("paused");
    }
});

document.getElementById("resumeBtn").addEventListener("click", () => {
    if (synth.paused) {
        synth.resume();
        updateIcons("playing");
    }
});

document.getElementById("stopBtn").addEventListener("click", () => {
    stopReading();
    updateIcons("stopped");
});

function stopReading() {
    synth.cancel();
    currentUtterance = null;
    updateIcons("stopped");
}

function updateIcons(state) {
    const readBtn = document.getElementById("readChapterBtn");
    const pauseBtn = document.getElementById("pauseBtn");
    const resumeBtn = document.getElementById("resumeBtn");
    const stopBtn = document.getElementById("stopBtn");

    switch (state) {
        case "playing":
            readBtn.classList.add("d-none");
            pauseBtn.classList.remove("d-none");
            resumeBtn.classList.add("d-none");
            stopBtn.classList.remove("d-none");
            break;
        case "paused":
            readBtn.classList.add("d-none");
            pauseBtn.classList.add("d-none");
            resumeBtn.classList.remove("d-none");
            stopBtn.classList.remove("d-none");
            break;
        case "stopped":
            readBtn.classList.remove("d-none");
            pauseBtn.classList.add("d-none");
            resumeBtn.classList.add("d-none");
            stopBtn.classList.add("d-none");
            break;
    }
}

loadBookMapping();
loadBible();
setVoice();