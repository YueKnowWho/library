const myLibrary = [];

const bookContainer = document.querySelector(".book-collection");
const addBookButton = document.querySelector("#add-book-button");
const bookDialog = document.querySelector("#book-dialog");
const bookForm = document.querySelector("#book-form");
const cancelButton = document.querySelector("#cancel-button");
const editBookDialog = document.querySelector("#edit-book-dialog");
const editBookForm = document.querySelector("#edit-book-form");
const cancelEditButton = document.querySelector("#cancel-edit-button");

let bookBeingEditedId = null;

function Book(title, author, pages, read) {
    if (!new.target) {
        throw new Error("Book must be called with the new operator.");
    }

    this.id = crypto.randomUUID();
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.read = read;
}

Book.prototype.toggleRead = function () {
    this.read = !this.read;
};

Book.prototype.info = function () {
    const status = this.read ? "read" : "not read yet";
    return `${this.title} by ${this.author}, ${this.pages} pages, ${status}`;
};

function addBookToLibrary(library, title, author, pages, read) {
    library.push(new Book(title, author, pages, read));
}

function displayBook(library) {
    bookContainer.replaceChildren();

    for (const book of library) {
        bookContainer.appendChild(createBookCard(book));
    }
}

function createBookCard(book) {
    const bookCard = document.createElement("article");

    bookCard.classList.add("book-card");
    bookCard.dataset.bookId = book.id;
    bookCard.innerHTML = `
        <h2 class="book-title">${book.title}</h2>
        <p class="book-author">${book.author}</p>
        <div class="pagesxstatus">
            <p class="book-pages">${book.pages} pages</p>
            <label class="toggle">
                <span class="toggle-label">${getReadLabel(book)}</span>
                <input class="status" type="checkbox" ${book.read ? "checked" : ""}>
                <span class="toggle-slider"></span>
            </label>
        </div>
        <div class="book-actions">
            <button data-action="edit" type="button">Edit</button>
            <button data-action="remove" type="button">Remove</button>
        </div>
    `;

    return bookCard;
}

function getReadLabel(book) {
    return book.read ? "Read" : "Not read";
}

function getBookFromElement(element) {
    const card = element.closest(".book-card");

    if (!card) {
        return { card: null, book: null };
    }

    const book = myLibrary.find(
        (libraryBook) => libraryBook.id === card.dataset.bookId
    );

    return { card, book };
}

function handleToggleChange(event) {
    const toggle = event.target;

    if (!toggle.matches(".status")) {
        return;
    }

    const { card, book } = getBookFromElement(toggle);

    if (!book) {
        return;
    }

    book.toggleRead();
    card.querySelector(".toggle-label").textContent = getReadLabel(book);
}

function handleBookButtonClick(event) {
    const button = event.target.closest("button");

    if (!button) {
        return;
    }

    const { card, book } = getBookFromElement(button);

    if (!book) {
        return;
    }

    const action = button.dataset.action;

    if (action === "edit") {
        openEditDialog(book);
    } else if (action === "remove") {
        removeBook(book, card);
    }
}

function removeBook(book, card) {
    myLibrary.splice(myLibrary.indexOf(book), 1);
    card.remove();
}

function getBookFormData(form) {
    const formData = new FormData(form);

    return {
        title: formData.get("title"),
        author: formData.get("author"),
        pages: Number(formData.get("pages")),
        read: formData.has("read"),
    };
}

function openEditDialog(book) {
    bookBeingEditedId = book.id;
    editBookForm.elements.title.value = book.title;
    editBookForm.elements.author.value = book.author;
    editBookForm.elements.pages.value = book.pages;
    editBookForm.elements.read.checked = book.read;
    editBookDialog.showModal();
}

function seedLibrary() {
    const books = [
        ["The Hobbit", "J.R.R. Tolkien", 310, false],
        ["Pride and Prejudice", "Jane Austen", 279, true],
        ["1984", "George Orwell", 328, true],
        ["The Great Gatsby", "F. Scott Fitzgerald", 180, false],
        ["Dune", "Frank Herbert", 412, false],
        ["To Kill a Mockingbird", "Harper Lee", 281, true],
    ];

    for (const [title, author, pages, read] of books) {
        addBookToLibrary(myLibrary, title, author, pages, read);
    }
}

bookContainer.addEventListener("change", handleToggleChange);
bookContainer.addEventListener("click", handleBookButtonClick);

addBookButton.addEventListener("click", () => {
    bookForm.reset();
    bookDialog.showModal();
});

cancelButton.addEventListener("click", () => {
    bookDialog.close();
});

bookForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const { title, author, pages, read } = getBookFormData(bookForm);
    addBookToLibrary(myLibrary, title, author, pages, read);
    displayBook(myLibrary);
    bookDialog.close();
});

cancelEditButton.addEventListener("click", () => {
    editBookDialog.close();
});

editBookForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const book = myLibrary.find(
        (libraryBook) => libraryBook.id === bookBeingEditedId
    );

    if (!book) {
        editBookDialog.close();
        return;
    }

    const { title, author, pages, read } = getBookFormData(editBookForm);
    Object.assign(book, { title, author, pages, read });
    displayBook(myLibrary);
    editBookDialog.close();
});

seedLibrary();
displayBook(myLibrary);
