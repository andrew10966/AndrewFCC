/*
CC BY-SA 4.0 https://creativecommons.org/licenses/by-sa/4.0/
*/

const clientId = "c1fa42a799fb45bbbeb59c08944142c2";
const clientSecret = "92a4e5f2636f4adf805076b35cfb9a57";
const tokenUrl = "https://accounts.spotify.com/api/token";
const apiUrl = "https://api.spotify.com/v1/tracks/";

let currentAudio = null;
let currentlyPlayingItem = null;

// Fetch a token for Spotify API
async function fetchToken() {
    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
        },
        body: new URLSearchParams({ grant_type: 'client_credentials' })
    });
    const data = await response.json();
    return data.access_token;
}

// Fetch specific track data from Spotify using the track's ID
async function fetchTrackData(trackId) {
    const token = await fetchToken();
    const response = await fetch(apiUrl + trackId, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
}

// Create a collab item (song) to display
function createCollabItem(track, statuses, genres) {
    // Check if track has a valid preview URL, album image, and artist data
    if (!track || !track.preview_url || !track.album || !track.album.images || !track.album.images[0] || !track.artists) {
        console.warn(`Skipping track with no preview: ${track ? track.id : 'unknown track'}`);
        return null; // Return null to skip track without preview
    }

    const item = document.createElement('div');
    item.className = 'collab-item';

    // Create status tags (handling multiple statuses)
    const statusTags = statuses.map(status => {
        const statusTag = document.createElement('span');
        const normalizedStatus = status.toLowerCase(); // Normalize to lowercase for consistency
        statusTag.className = `status-tag ${normalizedStatus}`; // Add class based on status value
        statusTag.textContent = status;
        statusTag.dataset.status = status;  // Keep status for filtering functionality
        return statusTag;
    });

    // Create genre tags
    const genreTags = genres.map(genre => {
        const genreTag = document.createElement('span');
        genreTag.className = `genre-tag ${genre.toLowerCase()}`;
        genreTag.textContent = genre;
        genreTag.dataset.genre = genre;  // Keep genre for filtering functionality
        return genreTag;
    });

    // Container for the tags
    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'tags';
    statusTags.forEach(tag => tagsDiv.appendChild(tag));
    genreTags.forEach(tag => tagsDiv.appendChild(tag));

    // Set up the HTML structure for the item (album cover, track name, artist, etc.)
    item.innerHTML = `
        <img src="${track.album.images[0].url}" class="cover-img" data-preview="${track.preview_url}" alt="${track.name}">
        <div class="play-pause-container">
            <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45"></circle>
            </svg>
            <i class="fa fa-play"></i>
        </div>
        <h3><a href="https://open.spotify.com/track/${track.id}" target="_blank">${track.name}</a></h3>
        <p>Artist(s): ${track.artists.map(artist => artist.name).join(', ')}</p>
        <p>Length: ${Math.floor(track.duration_ms / 60000)}:${(Math.floor((track.duration_ms % 60000) / 1000)).toString().padStart(2, '0')}</p>
    `;
    item.appendChild(tagsDiv);

    // Enable preview audio playback when clicking the cover image
    item.querySelector('.cover-img').addEventListener('click', function () {
        togglePreview(track.preview_url, item);
    });

    // Also enable preview audio playback when clicking the play/pause button
    item.querySelector('.play-pause-container').addEventListener('click', function () {
        togglePreview(track.preview_url, item);
    });

    return item;
}

// Handle the preview audio playback and update progress bar
function togglePreview(url, item) {
    const playPauseIcon = item.querySelector('.play-pause-container i');
    const progressCircle = item.querySelector('.play-pause-container circle');
    
    if (currentAudio) {
        if (currentAudio.src === url) {
            if (currentAudio.paused) {
                currentAudio.play();
                playPauseIcon.className = 'fa fa-pause';
                item.classList.add('playing'); // Show progress bar
            } else {
                currentAudio.pause();
                playPauseIcon.className = 'fa fa-play';
                item.classList.remove('playing'); // Hide progress bar
            }
        } else {
            if (currentlyPlayingItem) {
                currentlyPlayingItem.querySelector('.play-pause-container i').className = 'fa fa-play';
                currentlyPlayingItem.classList.remove('playing');
                clearInterval(currentlyPlayingItem.progressInterval); // Clear any existing progress intervals
            }

            currentAudio.pause();
            currentAudio = new Audio(url);
            currentAudio.play();
            playPauseIcon.className = 'fa fa-pause';
            item.classList.add('playing');
            currentlyPlayingItem = item;

            // Update progress bar
            currentlyPlayingItem.progressInterval = setInterval(() => {
                const progress = (currentAudio.currentTime / currentAudio.duration) * 283;
                progressCircle.style.strokeDashoffset = 283 - progress;
            }, 100);

            currentAudio.addEventListener('ended', () => {
                playPauseIcon.className = 'fa fa-play';
                clearInterval(currentlyPlayingItem.progressInterval);
                progressCircle.style.strokeDashoffset = 283; // Reset progress
                item.classList.remove('playing'); // Hide progress bar
            });
        }
    } else {
        currentAudio = new Audio(url);
        currentAudio.play();
        playPauseIcon.className = 'fa fa-pause';
        item.classList.add('playing');
        currentlyPlayingItem = item;

        // Update progress bar
        currentlyPlayingItem.progressInterval = setInterval(() => {
            const progress = (currentAudio.currentTime / currentAudio.duration) * 283;
            progressCircle.style.strokeDashoffset = 283 - progress;
        }, 100);

        currentAudio.addEventListener('ended', () => {
            playPauseIcon.className = 'fa fa-play';
            clearInterval(currentlyPlayingItem.progressInterval);
            progressCircle.style.strokeDashoffset = 283; // Reset progress
            item.classList.remove('playing'); // Hide progress bar
        });
    }
}

// Filtering logic
const statusCheckboxes = document.querySelectorAll('.status-checkbox');
const genreCheckboxes = document.querySelectorAll('.genre-checkbox');
const searchInput = document.getElementById('search');
const clearFiltersButton = document.getElementById('clear-filters');

// Add event listeners for filtering by status and genre
statusCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', filterCollabs);
});

genreCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', filterCollabs);
});

// Search input filter
searchInput.addEventListener('input', filterCollabs);

// Clear all filters
clearFiltersButton.addEventListener('click', () => {
    statusCheckboxes.forEach(checkbox => checkbox.checked = false);
    genreCheckboxes.forEach(checkbox => checkbox.checked = false);
    searchInput.value = '';
    filterCollabs();  // Reset the filter
});

// Function to filter the collab items
function filterCollabs() {
    const selectedStatuses = Array.from(statusCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
    const selectedGenres = Array.from(genreCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
    const searchQuery = searchInput.value.toLowerCase();

    const collabs = document.querySelectorAll('.collab-item');
    collabs.forEach(collab => {
        const collabStatuses = Array.from(collab.querySelectorAll('.status-tag')).map(tag => tag.dataset.status);
        const collabGenres = Array.from(collab.querySelectorAll('.genre-tag')).map(tag => tag.dataset.genre);
        const collabName = collab.querySelector('h3 a').textContent.toLowerCase();
        const collabArtist = collab.querySelector('p').textContent.toLowerCase().replace('artist(s): ', '');

        const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.some(status => collabStatuses.includes(status));
        const matchesGenre = selectedGenres.length === 0 || selectedGenres.some(genre => collabGenres.includes(genre));
        const matchesSearch = searchQuery === '' || collabName.includes(searchQuery) || collabArtist.includes(searchQuery);

        // Show if all conditions are met
        if (matchesStatus && matchesGenre && matchesSearch) {
            collab.style.display = 'block';
        } else {
            collab.style.display = 'none';
        }
    });
}

const trackIds = [
    { id: '7kEINvPA2ZLzUiDf5CWxkN', status: ['Open'], genres: ['Hardcore'] },
    { id: '4QzhzKPrduGWqUU6nfXiyh', status: ['Open'], genres: ['Hardcore'] },
    { id: '4nFj8qVVyzwIeuJZd8olSU', status: ['Open'], genres: ['Hardcore'] },
    { id: '0yAVKaQr7UxS9PCixQCwYs', status: ['Open'], genres: ['Hardcore'] },
    { id: '4iMpSorOVi44gL0iKPUOCG', status: ['Open'], genres: ['Hardcore'] },
    { id: '1DvfivaufWCBtLdiPp74nT', status: ['Open'], genres: ['Hardcore'] },
    { id: '4X7Ae3m7Ztenn6ssN0Xx4t', status: ['Open'], genres: ['Hardcore'] },
    { id: '3tguTCjcPpazDMtmuyF8sy', status: ['Open'], genres: ['Hardcore'] },
    { id: '2n7K5wAkx7uxMHngN4xZJw', status: ['Open'], genres: ['Hardcore'] },
    { id: '7dy6bWaPSLmipVoDoLaVeB', status: ['Open'], genres: ['Electronic'] },
    { id: '1rxTtYlOQNVSm1kziQq39R', status: ['Open'], genres: ['Hardcore'] },
    { id: '23BH0f8nTYV8KMryPScxdF', status: ['Open'], genres: ['Hardcore'] },
    { id: '00pBUY9LKffZzeCH80JE0H', status: ['Open'], genres: ['Hardcore'] },
    { id: '5y5qNTyfvCQ6s230gLSjlv', status: ['Open'], genres: ['Electronic'] },
    { id: '0QTwQbsSLkeFUGj8T6CgJV', status: ['Open'], genres: ['Hardcore'] },
    { id: '1lZHiK2IInP32FeQFEp7ZV', status: ['Open'], genres: ['Hardcore'] },
    { id: '37IckXt4iECFcL0AsJP2Oa', status: ['Open'], genres: ['Hardcore'] },
    { id: '5WI2ltQIdwgzf1SNE76JyR', status: ['Open'], genres: ['Electronic'] },
    { id: '0GLbugBl7oTlKZmlcm9M9w', status: ['Open'], genres: ['Hardcore'] },
    { id: '03N15VIQOQVV2XcolaW0gR', status: ['Open'], genres: ['Hardcore'] },
    { id: '7alnpbdgKsIvmvdBXtonFb', status: ['Open'], genres: ['Hardcore'] },
    { id: '0c8luHrSaAMG072sEEpTii', status: ['Open'], genres: ['Hardcore'] },
    { id: '6LvC4nm62BQGESBPhwgpgg', status: ['Open'], genres: ['Hardcore'] },
    { id: '1aFefpFxJjYLpeGGl4EELu', status: ['Open'], genres: ['Hardcore'] },
    { id: '2EHSBfC2epl3BXYR2uYrFd', status: ['Open', 'Finished'], genres: ['Hardcore'] },
    { id: '5sLoLqEFzmgq91nb6Q4cWv', status: ['Open'], genres: ['Electronic'] },
    { id: '1EFPehJv13my9zvLFzGE8Z', status: ['Open'], genres: ['Electronic'] },
    { id: '425KAU2QSkjYhTSDcgIHjO', status: ['Open'], genres: ['Electronic'] },
    { id: '4TAeOsMYQ3IecAuljAF3Ft', status: ['Open'], genres: ['Electronic'] },
    { id: '2ahW5IyuKcFCTnyV7gEvIC', status: ['Open'], genres: ['Electronic'] },
    { id: '1A8j067qyiNwQnZT0bzUpZ', status: ['Open'], genres: ['Electronic'] },
    { id: '0Kz1564ihrYZNsgE76wDI0', status: ['Open'], genres: ['Electronic'] },
    { id: '3RVKHMIsKak6QXsmu6i8ES', status: ['Open'], genres: ['Electronic'] },
    { id: '0bHLNUoBzK83c61N9W4ohF', status: ['Open'], genres: ['Electronic'] },
    { id: '3XmNMIucTYuXOEpAjcaeVi', status: ['Open'], genres: ['Electronic'] },
    { id: '3Vad9kkHv0DZZ0ioJdRrYV', status: ['Open'], genres: ['Electronic'] },
    { id: '5kJ4BWZ9Y1qFIwwTbMIxYX', status: ['Open'], genres: ['Electronic'] },
    { id: '0lHAMNU8RGiIObScrsRgmP', status: ['Open'], genres: ['Electronic'] },
    { id: '5OT9JgUd8WVWBJgYog7a82', status: ['Open'], genres: ['Latin'] },
    { id: '6Es8Sk3xe1HiJ2MXCfHHwR', status: ['Open'], genres: ['Latin'] },
    { id: '4UkUxO2WlKLc0Q1iEutGGh', status: ['Open'], genres: ['Latin'] },
    { id: '5lNcTbiGTEbPy6ZxmkXdLB', status: ['Open'], genres: ['Latin'] },
    { id: '5cAKmfCaqnYUnXqvTK8RxU', status: ['Open'], genres: ['Latin'] },
    { id: '3KKjc7pMPP3xgMNZ49Zm7R', status: ['Open'], genres: ['Pop'] },
    { id: '1RmakRsIJE6qsP1OjiUboJ', status: ['Open'], genres: ['Hip-Hop'] },
    { id: '0zO8ctW0UiuOefR87OeJOZ', status: ['Open'], genres: ['Hip-Hop'] },
    { id: '2R0eIBJGHpiv1nKbSzW4zq', status: ['Open'], genres: ['Electronic', 'Pop'] },
    { id: '2iJuuzV8P9Yz0VSurttIV5', status: ['Open'], genres: ['Electronic'] },
    { id: '0LohatbcUXRauoeMlR1jnS', status: ['Open'], genres: ['Pop'] },
    { id: '7jk7gqyEonmVVYahZN5zhW', status: ['Open'], genres: ['Electronic', 'Pop'] },
    { id: '7pNC5ZIKtwUK0ReSpM3P9f', status: ['Open'], genres: ['Hip-Hop'] },
    { id: '02iXInevQEAlihE3IPF0eh', status: ['Open'], genres: ['Pop'] },
    { id: '5b2bu6yyATC1zMXDGScJ2d', status: ['Open'], genres: ['Electronic', 'Pop'] },
    { id: '0KQh7AuuZvpTKWhcJa8Pbr', status: ['Open'], genres: ['Electronic'] },
    { id: '19t0Z7qsoV6A1CGJVYRnjm', status: ['Open'], genres: ['Latin'] },
    { id: '1A5yplwEk6cJbAL63L6bkp', status: ['Open'], genres: ['Latin', 'Electronic'] },
    { id: '7w7BrPbOjF5OxChs2dxFve', status: ['Open'], genres: ['Latin'] },
    { id: '2dYXrWkNO40NXy2Q3IYLRc', status: ['Open'], genres: ['Latin', 'Electronic'] },
    { id: '2qG5sZ7Si6sdK74qLxedYM', status: ['Open'], genres: ['Latin'] },
    { id: '3nlwxpdoduF0VTIphyOS2Q', status: ['Open'], genres: ['Electronic'] },
    { id: '4ZFseyLstY6ZrXBzlXmuR0', status: ['Open'], genres: ['Electronic'] },
    { id: '6SSXzc2QJiDX00xdmlRaKQ', status: ['Open'], genres: ['Hip-Hop'] },
    { id: '4U4oj8fW0f8N78FZtu3n9w', status: ['Open'], genres: ['R&B'] },
    { id: '1yW00C89gUWPvUh5fkyzz4', status: ['Open'], genres: ['Electronic'] },
    { id: '1p57K0vMB3TQ5Uh8aEj8ci', status: ['Open'], genres: ['Pop'] },
    { id: '2gBQ35qqBE75t00kV221Xy', status: ['Open'], genres: ['Electronic'] },
    { id: '59bnZbhyrWhJJPrwyOA18D', status: ['Open'], genres: ['Hip-Hop', 'Pop'] }
];


// Shuffle array function
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
shuffleArray(trackIds);

// Fetch and display the tracks
trackIds.forEach(async (track) => {
    const trackData = await fetchTrackData(track.id);
    
    // Only create and append collab item if the track data is valid
    if (trackData) {
        const collabItem = createCollabItem(trackData, track.status, track.genres);
        if (collabItem) {
            document.getElementById('collab-list').appendChild(collabItem);
        }
    }
});
