function filterCollaborations() {
    const searchInput = document.getElementById('searchBar').value.toLowerCase();
    const collabItems = document.querySelectorAll('.collab-item');

    collabItems.forEach(item => {
        // Grab the text from both the <h1> and <p> (title and description) to match the search
        const collabTitle = item.querySelector('h1').textContent.toLowerCase();
        const collabDescription = item.querySelector('p').textContent.toLowerCase();

        // If search input matches either title or description, show the item
        if (collabTitle.includes(searchInput) || collabDescription.includes(searchInput)) {
            item.style.display = '';  // Show the item
        } else {
            item.style.display = 'none';  // Hide the item
        }
    });
}

let currentStatusFilter = 'all';
let currentGenreFilter = 'all';

function filterCollaborations() {
    const searchInput = document.getElementById('searchBar').value.toLowerCase();
    const collabItems = document.querySelectorAll('.collab-item');

    collabItems.forEach(item => {
        // Get the collaboration name (inside <h1> tag)
        const collabName = item.querySelector('h1').textContent.toLowerCase();

        // Get status and genre attributes from the HTML element
        const itemStatus = item.getAttribute('data-status');
        const itemGenre = item.getAttribute('data-genre');

        // Match status and genre filters
        const statusMatch = (currentStatusFilter === 'all' || itemStatus === currentStatusFilter);
        const genreMatch = (currentGenreFilter === 'all' || itemGenre === currentGenreFilter);

        // Show or hide item based on search, status, and genre filters
        if (collabName.includes(searchInput) && statusMatch && genreMatch) {
            item.style.display = 'flex';  // Display matched items
        } else {
            item.style.display = 'none';  // Hide unmatched items
        }
    });
}

function filterByTag(tag, type) {
    if (type === 'status') {
        currentStatusFilter = tag;
    } else if (type === 'genre') {
        currentGenreFilter = tag;
    }

    // Re-apply filters and search
    filterCollaborations();
    updateActiveFilters();  // Optional: If you want to show active filters
}

function updateActiveFilters() {
    const statusFilters = document.getElementById('status-filters');
    const genreFilters = document.getElementById('genre-filters');

    // Display active status filter
    if (currentStatusFilter === 'all') {
        statusFilters.textContent = 'None';
    } else {
        statusFilters.textContent = capitalizeFirstLetter(currentStatusFilter);
    }

    // Display active genre filter
    if (currentGenreFilter === 'all') {
        genreFilters.textContent = 'None';
    } else {
        genreFilters.textContent = capitalizeFirstLetter(currentGenreFilter);
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
