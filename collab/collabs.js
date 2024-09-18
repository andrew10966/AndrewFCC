/*
CC BY-SA 4.0 https://creativecommons.org/licenses/by-sa/4.0/
!! My Id's will be cycled (changed) every Sunday at 10pm MST !!
This is to prevent anyone from doing anything malicious
*/
// My personal Id's, you are free to use them. To get your own go to https://developer.spotify.com/
const clientId = "c1fa42a799fb45bbbeb59c08944142c2";
const clientSecret = "92a4e5f2636f4adf805076b35cfb9a57";
const tokenUrl = "https://accounts.spotify.com/api/token";
const apiUrl = "https://api.spotify.com/v1/tracks/";

// Variables to track current playing preview and icon
let currentAudio = null;
let currentlyPlayingItem = null;
let currentIcon = null;

// Fetches a token for Spotify API using client Id's (No need to change even if you use your own Id's)
async function fetchToken() {
    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
        },
        body: new URLSearchParams({
            grant_type: 'client_credentials'
        })
    });
    const data = await response.json();
    return data.access_token;
}

// Fetches specific track data from Spotify using the track's ID
async function fetchTrackData(trackId) {
    const token = await fetchToken();
    const response = await fetch(apiUrl + trackId, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    return data;
}

// Makes a Collab Item (What displays the song info)
function createCollabItem(track, status, genres) {
    const item = document.createElement('div'); // Create container for each collab item
    item.className = 'collab-item'; // Assign CSS class

    // Create status tag (Open, Closed, etc.)
    const statusTag = document.createElement('span'); 
    statusTag.className = `status-tag ${status}`;
    statusTag.textContent = status;

    // Create tags for each genre
    const genreTags = genres.map(genre => {
        const genreTag = document.createElement('span');
        genreTag.className = `genre-tag ${genre}`;
        genreTag.textContent = genre;
        return genreTag;
    });

    // Container for the status and genre tags
    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'tags';
    tagsDiv.appendChild(statusTag);
    genreTags.forEach(tag => tagsDiv.appendChild(tag));

    // Set up the HTML structure for the item (album cover, track name, artist, etc.) Can edit this, just know what your doing
    item.innerHTML = `
    <img src="${track.album.images[0].url}" class="cover-img" data-preview="${track.preview_url}" alt="${track.name}">
    <div class="play-pause"><i class="fa fa-play"></i></div>
    <h3><a href="https://open.spotify.com/track/${track.id}" target="_blank">${track.name}<a></h3>
    <p>Artist(s): ${track.artists.map(artist => artist.name).join(', ')}</p>
    <p>Length: ${Math.floor(track.duration_ms / 60000)}:${Math.floor((track.duration_ms % 60000) / 1000).toString().padStart(2, '0')}</p>
`;
    item.appendChild(tagsDiv);

    // When you click the cover this allows the song to preview
    item.querySelector('.cover-img').addEventListener('click', function() {
        togglePreview(track.preview_url, item);
    });

    return item;
}

// Handles the playing and pausing of audio previews
function togglePreview(url, item) {
    if (currentAudio) {
        if (currentAudio.src === url) {
            if (currentAudio.paused) {
                currentAudio.play();
                item.querySelector('.play-pause').innerHTML = '<i class="fa fa-pause"></i>';
            } else {
                currentAudio.pause();
                item.querySelector('.play-pause').innerHTML = '<i class="fa fa-play"></i>';
            }
        } else {
            if (currentlyPlayingItem) {
                currentlyPlayingItem.querySelector('.play-pause').innerHTML = '<i class="fa fa-play"></i>';
            }

            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = new Audio(url);
            currentAudio.play();
            item.querySelector('.play-pause').innerHTML = '<i class="fa fa-pause"></i>';
            currentlyPlayingItem = item;
            currentAudio.addEventListener('ended', () => {
                item.querySelector('.play-pause').innerHTML = '<i class="fa fa-play"></i>';
            });
        }
    } else {
        currentAudio = new Audio(url);
        currentAudio.play();
        item.querySelector('.play-pause').innerHTML = '<i class="fa fa-pause"></i>';
        currentlyPlayingItem = item;
        currentAudio.addEventListener('ended', () => {
            item.querySelector('.play-pause').innerHTML = '<i class="fa fa-play"></i>';
        });
    }
}

// Allows the user to filter by tag
function filterCollabs() {
    const selectedStatuses = Array.from(document.getElementById('status').selectedOptions).map(option => option.value);
    const selectedGenres = Array.from(document.getElementById('genre').selectedOptions).map(option => option.value);

    // Loop through each collab item and filter based on selected tags
    document.querySelectorAll('.collab-item').forEach(item => {
        const status = item.querySelector('.status-tag').textContent;
        const genres = Array.from(item.querySelectorAll('.genre-tag')).map(tag => tag.textContent);

        // Check if the item matches the selected filters
        const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(status);
        const matchesGenre = selectedGenres.length === 0 || selectedGenres.some(genre => genres.includes(genre));

        // Show or hide items based on filter matches
        item.style.display = matchesStatus && matchesGenre ? '' : 'none';
    });
}

// For clear button
function clearFilters() {
    document.getElementById('status').selectedIndex = -1;
    document.getElementById('genre').selectedIndex = -1;
    filterCollabs();
}

// Event listeners for filter changes and search bar input
document.getElementById('status').addEventListener('change', filterCollabs);
document.getElementById('genre').addEventListener('change', filterCollabs);
document.getElementById('search').addEventListener('input', function() {
    const query = this.value.toLowerCase();
    document.querySelectorAll('.collab-item').forEach(item => {
        const title = item.querySelector('h3').textContent.toLowerCase();
        const artist = item.querySelector('p').textContent.toLowerCase();
        item.style.display = title.includes(query) || artist.includes(query) ? '' : 'none';
    });
});

// Clear button
document.getElementById('clear-filters').addEventListener('click', clearFilters);

// Here is where the code gets anything like ${track...}. To get your track id just paste the code from the end of a track link 
//eg; "https://open.spotify.com/track/3Vad9kkHv0DZZ0ioJdRrYV" -> { id: '3Vad9kkHv0DZZ0ioJdRrYV', status: 'Open/Closed/etc', genres: ['Pop', 'Hip-Hop', 'etc'] },
const trackIds = [
    { id: '7kEINvPA2ZLzUiDf5CWxkN', status: 'Open', genres: ['Hardcore'] },
    { id: '4QzhzKPrduGWqUU6nfXiyh', status: 'Open', genres: ['Hardcore'] },
    { id: '4nFj8qVVyzwIeuJZd8olSU', status: 'Open', genres: ['Hardcore'] },
    { id: '0yAVKaQr7UxS9PCixQCwYs', status: 'Open', genres: ['Hardcore'] },
    { id: '4iMpSorOVi44gL0iKPUOCG', status: 'Open', genres: ['Hardcore'] },
    { id: '1DvfivaufWCBtLdiPp74nT', status: 'Open', genres: ['Hardcore'] },
    { id: '4X7Ae3m7Ztenn6ssN0Xx4t', status: 'Open', genres: ['Hardcore'] },
    { id: '3tguTCjcPpazDMtmuyF8sy', status: 'Open', genres: ['Hardcore'] },
    { id: '2n7K5wAkx7uxMHngN4xZJw', status: 'Open', genres: ['Hardcore'] },
    { id: '7dy6bWaPSLmipVoDoLaVeB', status: 'Open', genres: ['Electronic'] },
    { id: '1rxTtYlOQNVSm1kziQq39R', status: 'Open', genres: ['Hardcore'] },
    { id: '23BH0f8nTYV8KMryPScxdF', status: 'Open', genres: ['Hardcore'] },
    { id: '00pBUY9LKffZzeCH80JE0H', status: 'Open', genres: ['Hardcore'] },
    { id: '5y5qNTyfvCQ6s230gLSjlv', status: 'Open', genres: ['Electronic'] },
    { id: '0QTwQbsSLkeFUGj8T6CgJV', status: 'Open', genres: ['Hardcore'] },
    { id: '1lZHiK2IInP32FeQFEp7ZV', status: 'Open', genres: ['Hardcore'] },
    { id: '37IckXt4iECFcL0AsJP2Oa', status: 'Open', genres: ['Hardcore', 'Priority'] },
    { id: '5WI2ltQIdwgzf1SNE76JyR', status: 'Open', genres: ['Electronic'] },
    { id: '0GLbugBl7oTlKZmlcm9M9w', status: 'Open', genres: ['Hardcore'] },
    { id: '03N15VIQOQVV2XcolaW0gR', status: 'Open', genres: ['Hardcore'] },
    { id: '7alnpbdgKsIvmvdBXtonFb', status: 'Open', genres: ['Hardcore'] },
    { id: '0c8luHrSaAMG072sEEpTii', status: 'Open', genres: ['Hardcore'] },
    { id: '4ZFseyLstY6ZrXBzlXmuR0', status: 'Open', genres: ['Electronic'] },
    { id: '6LvC4nm62BQGESBPhwgpgg', status: 'Open', genres: ['Hardcore'] },
    { id: '1aFefpFxJjYLpeGGl4EELu', status: 'Open', genres: ['Hardcore'] },
    { id: '2EHSBfC2epl3BXYR2uYrFd', status: 'Finished', genres: ['Hardcore', 'Priority'] },
    { id: '5sLoLqEFzmgq91nb6Q4cWv', status: 'Open', genres: ['Electronic'] },
    { id: '1EFPehJv13my9zvLFzGE8Z', status: 'Open', genres: ['Electronic'] },
    { id: '425KAU2QSkjYhTSDcgIHjO', status: 'Open', genres: ['Electronic'] },
    { id: '4TAeOsMYQ3IecAuljAF3Ft', status: 'Open', genres: ['Electronic'] },
    { id: '2ahW5IyuKcFCTnyV7gEvIC', status: 'Open', genres: ['Electronic'] },
    { id: '1A8j067qyiNwQnZT0bzUpZ', status: 'Open', genres: ['Electronic'] },
    { id: '0Kz1564ihrYZNsgE76wDI0', status: 'Open', genres: ['Electronic'] },
    { id: '3RVKHMIsKak6QXsmu6i8ES', status: 'Open', genres: ['Electronic'] },
    { id: '0bHLNUoBzK83c61N9W4ohF', status: 'Open', genres: ['Electronic'] },
    { id: '3XmNMIucTYuXOEpAjcaeVi', status: 'Open', genres: ['Electronic'] },
    { id: '3Vad9kkHv0DZZ0ioJdRrYV', status: 'Open', genres: ['Electronic'] },
    { id: '5kJ4BWZ9Y1qFIwwTbMIxYX', status: 'Open', genres: ['Electronic'] },
    { id: '0lHAMNU8RGiIObScrsRgmP', status: 'Open', genres: ['Electronic'] },
    { id: '3nlwxpdoduF0VTIphyOS2Q', status: 'Open', genres: ['Electronic', 'Priority'] },
    { id: '2qG5sZ7Si6sdK74qLxedYM', status: 'Open', genres: ['Latin', 'Priority'] },
    { id: '5OT9JgUd8WVWBJgYog7a82', status: 'Open', genres: ['Latin'] },
    { id: '6Es8Sk3xe1HiJ2MXCfHHwR', status: 'Open', genres: ['Latin'] },
    { id: '4UkUxO2WlKLc0Q1iEutGGh', status: 'Open', genres: ['Latin'] },
    { id: '5lNcTbiGTEbPy6ZxmkXdLB', status: 'Open', genres: ['Latin'] },
    { id: '5cAKmfCaqnYUnXqvTK8RxU', status: 'Open', genres: ['Latin'] },
    { id: '2dYXrWkNO40NXy2Q3IYLRc', status: 'Open', genres: ['Latin'] },
    { id: '7w7BrPbOjF5OxChs2dxFve', status: 'Open', genres: ['Latin'] },
    { id: '3KKjc7pMPP3xgMNZ49Zm7R', status: 'Open', genres: ['Pop'] },
    { id: '1RmakRsIJE6qsP1OjiUboJ', status: 'Open', genres: ['Hip-Hop'] },
    { id: '0zO8ctW0UiuOefR87OeJOZ', status: 'Open', genres: ['Hip-Hop'] }
];
const collabList = document.getElementById('collab-list');

// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Shuffle the trackIds array
shuffleArray(trackIds);

// Fetch data for each track and create a collab item for each one
trackIds.forEach(async (track) => {
    const trackData = await fetchTrackData(track.id); // Fetch track data
    const collabItem = createCollabItem(trackData, track.status, track.genres); // Create a new collab item
    collabList.appendChild(collabItem); // Add the item to the page
});
