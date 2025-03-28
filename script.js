// Global variables 
let allBooks = [];
let currentPage = 1;
const booksPerPage = 10;
let currentSearch = '';
let currentSort = 'title-asc';

// Fetch books function 
function fetchBooks(page = 1) {
    console.log("Fetching books for page:", page);
    fetch(`https://api.freeapi.app/api/v1/public/books?page=${page}&limit=${booksPerPage}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const books = data.data.data;
            if (page === 1) {
                allBooks = books;
            } else {
                allBooks = [...allBooks, ...books];
            }
            filterAndDisplayBooks();
            updatePagination(data.data);
        })
        .catch(error => {
            console.error('Error Fetching:', error);
        });
}

// Filter and display books 
function filterAndDisplayBooks() {
    let filteredBooks = [...allBooks];

    if (currentSearch) {
        filteredBooks = filteredBooks.filter(book => 
            book.volumeInfo.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
            (book.volumeInfo.authors && book.volumeInfo.authors.join(', ').toLowerCase().includes(currentSearch.toLowerCase()))
        );
    }

    filteredBooks.sort((a, b) => {
        if (currentSort === 'title-asc') {
            return a.volumeInfo.title.localeCompare(b.volumeInfo.title);
        } else if (currentSort === 'title-desc') {
            return b.volumeInfo.title.localeCompare(a.volumeInfo.title);
        } else if (currentSort === 'date-asc') {
            return new Date(a.volumeInfo.publishedDate || '0') - new Date(b.volumeInfo.publishedDate || '0');
        } else if (currentSort === 'date-desc') {
            return new Date(b.volumeInfo.publishedDate || '0') - new Date(a.volumeInfo.publishedDate || '0');
        }
        return 0;
    });
    displayBooks(filteredBooks.slice(0, currentPage * booksPerPage));
}

// Display books function 
function displayBooks(books) {
    const container = document.getElementById('book-container');
    container.innerHTML = '';

    books.forEach(book => {
        const bookItem = document.createElement('div');
        bookItem.classList.add('book-item');
        const volumeInfo = book.volumeInfo;
        const authors = volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown';

        bookItem.innerHTML = `
            <img src="${volumeInfo.imageLinks?.thumbnail || 'placeholder.jpg'}" alt="Book cover for ${volumeInfo.title}">
            <h3>${volumeInfo.title}</h3>
            <p>Author: ${authors}</p>
            <p>Publisher: ${volumeInfo.publisher || 'Not available'}</p>
            <p>Published: ${volumeInfo.publishedDate || 'Not available'}</p>
            <a href="${volumeInfo.infoLink}" target="_blank">More Details</a>
        `;
        container.appendChild(bookItem);
    });
}

// Update pagination
function updatePagination(data) {
    const loadMoreBtn = document.getElementById('load-more');
    loadMoreBtn.disabled = !data.nextPage;
}

// Updated Event Listeners
document.getElementById('search-btn').addEventListener('click', () => {
    currentSearch = document.getElementById('search-input').value;
    currentPage = 1; // Reset to first page on new search
    filterAndDisplayBooks();
});

// Modified search input listener to handle empty input
document.getElementById('search-input').addEventListener('input', (e) => {
    currentSearch = e.target.value;
    currentPage = 1; // Reset to first page
    filterAndDisplayBooks();
});

// Sort, view toggle, and load more listeners 
document.getElementById('sort-select').addEventListener('change', (e) => {
    currentSort = e.target.value;
    filterAndDisplayBooks();
});

document.getElementById('list-view').addEventListener('click', () => {
    document.body.classList.add('list-view');
    document.body.classList.remove('grid-view');
});

document.getElementById('grid-view').addEventListener('click', () => {
    document.body.classList.add('grid-view');
    document.body.classList.remove('list-view');
});

document.getElementById('load-more').addEventListener('click', () => {
    currentPage++;
    fetchBooks(currentPage);
});

// Initial fetch
fetchBooks();