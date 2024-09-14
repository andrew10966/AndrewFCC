function filterCollaborations() {
    const searchInput = document.getElementById('searchBar').value.toLowerCase();
    const collabItems = document.querySelectorAll('.collab-item');

    collabItems.forEach(item => {
        const collabName = item.querySelector('h3').textContent.toLowerCase();
        if (collabName.includes(searchInput)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

let currentStatusFilter = 'all';
let currentGenreFilter = 'all';

function updateActiveFilters() {
    const statusFilters = document.getElementById('status-filters');
    const genreFilters = document.getElementById('genre-filters');

    if (currentStatusFilter === 'all') {
        statusFilters.textContent = 'None';
    } else {
        statusFilters.textContent = capitalizeFirstLetter(currentStatusFilter);
    }

    if (currentGenreFilter === 'all') {
        genreFilters.textContent = 'None';
    } else {
        genreFilters.textContent = capitalizeFirstLetter(currentGenreFilter);
    }
}

function filterByTag(tag, type) {
    if (type === 'status') {
        currentStatusFilter = tag;
    } else if (type === 'genre') {
        currentGenreFilter = tag;
    }

    let collabItems = document.querySelectorAll('.collab-item');

    collabItems.forEach(item => {
        let itemTags = item.getAttribute('data-status').split(' ');
        let itemGenres = item.getAttribute('data-genre').split(' ');

        let statusMatch = (currentStatusFilter === 'all' || itemTags.includes(currentStatusFilter));
        let genreMatch = (currentGenreFilter === 'all' || itemGenres.includes(currentGenreFilter));

        if (statusMatch && genreMatch) {
            item.style.display = 'flex'; // Show item if it matches both filters
        } else {
            item.style.display = 'none'; // Hide item if it does not match both filters
        }
    });

    updateActiveFilters(); // Update the display of active filters
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}