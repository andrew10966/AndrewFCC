const clientId = "a8d951c9a7764fd0ba2ad2ceda8d8404";
const clientSecret = "869ff777db2146c99f44ed2513587899";

const genreTags = {
    "1mdBOh69mhjfyjJh8kt0JY": "HARDCORE",
    "4TBw4TPKTtVqFRtP2u8iID": "HIP-HOP",
    "1NGrsCr8k4ky78QsBEId1r": "POP",
    "5lNcTbiGTEbPy6ZxmkXdLB": "LATIN",
    "0a8Sr6b6xqVwIoApMM90Un": "RAP",
    "0wCikTVwYGaSvppCFG75C1": "ELECTRONIC"
};

let songs = [];

// Get Spotify access token
async function getAccessToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;
}

// Fetch playlists and their songs
async function fetchPlaylists(accessToken) {
    const playlistIds = Object.keys(genreTags);
    for (let playlistId of playlistIds) {
        const playlistUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
        const response = await fetch(playlistUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        displaySongs(data.items, genreTags[playlistId]);
    }
}

// Display songs on the page
function displaySongs(tracks, genre) {
    const songList = document.getElementById('songList');
    
    tracks.forEach(track => {
        const songItem = document.createElement('div');
        songItem.classList.add('song-item');
        songItem.dataset.genre = genre;

        const songCover = track.track.album.images[0].url;
        const songTitle = track.track.name;
        const songArtist = track.track.artists[0].name;
        const songUrl = track.track.external_urls.spotify; // Spotify URL

        songItem.innerHTML = `
            <a href="${songUrl}" target="_blank">
                <img src="${songCover}" alt="${songTitle}">
                <h3>${songTitle}</h3>
                <p>${songArtist}</p>
                <div class="song-tags">
                    <span class="genre-tag">${genre}</span>
                    <span class="status-tag" data-status="OPEN">OPEN</span>
                </div>
            </a>
        `;

        songList.appendChild(songItem);
    });
}

// Filter by genre and status
function filterSongs() {
    const genreFilter = document.getElementById('genreFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    const songItems = document.querySelectorAll('.song-item');
    songItems.forEach(song => {
        const genreTag = song.dataset.genre;
        const statusTags = song.querySelectorAll('.status-tag');
        const hasStatus = Array.from(statusTags).some(tag => tag.dataset.status === statusFilter || statusFilter === 'all');
        const matchesGenre = genreFilter === 'all' || genreTag === genreFilter;

        song.style.display = matchesGenre && hasStatus ? 'block' : 'none';
    });
}

// Search for songs
function searchSongs() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const songItems = document.querySelectorAll('.song-item');

    songItems.forEach(song => {
        const songTitle = song.querySelector('h3').textContent.toLowerCase();
        const songArtist = song.querySelector('p').textContent.toLowerCase();
        const matchesSearch = songTitle.includes(searchInput) || songArtist.includes(searchInput);

        song.style.display = matchesSearch ? 'block' : 'none';
    });
}

// Clear all filters
function clearFilters() {
    document.getElementById('genreFilter').value = 'all';
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('searchInput').value = '';
    filterSongs();
}

// Event listeners
document.getElementById('genreFilter').addEventListener('change', filterSongs);
document.getElementById('statusFilter').addEventListener('change', filterSongs);
document.getElementById('searchInput').addEventListener('input', searchSongs);
document.getElementById('clearFilters').addEventListener('click', clearFilters);

// Initialize
getAccessToken().then(fetchPlaylists);