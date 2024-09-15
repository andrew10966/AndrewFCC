// Hey so uh I dont really have the resourse to keep these Ids private so please dont do anything weird
const clientId = 'a8d951c9a7764fd0ba2ad2ceda8d8404';
const clientSecret = '5348d32b1a8d44319b2a1387577646dd';
const playlistId = '1mdBOh69mhjfyjJh8kt0JY';

// Example status tags
const songStatus = {
  '7kEINvPA2ZLzUiDf5CWxkN': ['open', 'priority'],
  '4QzhzKPrduGWqUU6nfXiyh': ['open'],
  '4nFj8qVVyzwIeuJZd8olSU': ['open', 'priority'],
  '0yAVKaQr7UxS9PCixQCwYs': ['open'],
  '4iMpSorOVi44gL0iKPUOCG': ['open'],
  '1DvfivaufWCBtLdiPp74nT': ['open'],
  '4X7Ae3m7Ztenn6ssN0Xx4t': ['open'],
  '3tguTCjcPpazDMtmuyF8sy': ['open'],
  '2n7K5wAkx7uxMHngN4xZJw': ['open'],
  '1rxTtYlOQNVSm1kziQq39R': ['open'],
  '23BH0f8nTYV8KMryPScxdF': ['open'],
  '00pBUY9LKffZzeCH80JE0H': ['open'],
  '0QTwQbsSLkeFUGj8T6CgJV': ['open', 'priority'],
  '1lZHiK2IInP32FeQFEp7ZV': ['open'],
  '3f1FxobGH4lQHp8F24IrC1': ['open'],
  '3occ54bSc151j9TndlGn9G': ['open'],
  '0Ua3nDprcE2YVHpINa9ceM': ['open'],
  '0GLbugBl7oTlKZmlcm9M9w': ['open'],
  '37IckXt4iECFcL0AsJP2Oa': ['open', 'priority'],
  '7alnpbdgKsIvmvdBXtonFb': ['open'],
  '4o69YKROIPG40Bc4oM0wTk': ['open'],
  '03N15VIQOQVV2XcolaW0gR': ['open'],
  '77WTQNkAcCLStiMBWVySK9': ['open'],
  '7ph7avpjeeRJv4HsHp84mf': ['open', 'priority'],
  '0c8luHrSaAMG072sEEpTii': ['open', 'priority'],
  '45eT7AahIkUl82p0vFxiZF': ['open'],
  '0Rv6Qk5lM1krVa8vWyrATj': ['open'],
  '2EHSBfC2epl3BXYR2uYrFd': ['open', 'finished'],
  '5R0RyDhTqHpYP1occAIX8a': ['open'],
  '28xaU1zdGofWCsxKwvIZ2o': ['open'],
  '0FX6lSNWJSSvBtImmw3Nsn': ['open'],
  '0AFTpRPUhGPALm684b0vfX': ['open'],
  '0P9nDl97KUEO1rhIdIKSS1': ['open'],
  '6Skd3j06mmlIlVGrBOpVE2': ['open'],
  '48Ur17WT0embliDh7IVwE9': ['open'],
  '6LvC4nm62BQGESBPhwgpgg': ['open', 'priority'],
  '1aL399KnfueCuX3gPML2Rp': ['open'],
  '1aFefpFxJjYLpeGGl4EELu': ['open'],
  '5LJKjFXDm0Nb8RgpeV3Zbd': ['open'],
  '7dKBsM3Tp2dXPybxvCes9P': ['open'],
};

async function getAccessToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
      },
      body: 'grant_type=client_credentials'
  });
  const data = await response.json();
  return data.access_token;
}

async function getPlaylistData(accessToken) {
  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
          'Authorization': 'Bearer ' + accessToken
      }
  });
  const data = await response.json();
  return data.items;
}

function createGenreFilters() {
  const genreFilters = document.getElementById('genre-filters');
  const genres = ['Hardcore']; // Add more genres if needed

  genres.forEach(genre => {
      const filterTag = document.createElement('div');
      filterTag.classList.add('filter-tag');

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = genre;
      input.name = 'genre';
      input.value = genre;

      const label = document.createElement('label');
      label.htmlFor = genre;
      label.textContent = genre;

      filterTag.appendChild(input);
      filterTag.appendChild(label);
      genreFilters.appendChild(filterTag);
  });
}

function createStatusFilters() {
  const statusFilters = document.getElementById('status-filters');
  const statuses = ['open', 'taken', 'finished', 'in-progress', 'priority'];

  statuses.forEach(status => {
      const filterTag = document.createElement('div');
      filterTag.classList.add('filter-tag');

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = status;
      input.name = 'status';
      input.value = status;

      const label = document.createElement('label');
      label.htmlFor = status;
      label.textContent = status.charAt(0).toUpperCase() + status.slice(1);

      filterTag.appendChild(input);
      filterTag.appendChild(label);
      statusFilters.appendChild(filterTag);
  });
}

function filterSongs() {
  const searchQuery = document.getElementById('search').value.toLowerCase();
  const filters = document.querySelectorAll('#status-filters input[type="checkbox"]');
  const playlistContainer = document.getElementById('playlist');

  const checkedFilters = Array.from(filters)
      .filter(filter => filter.checked)
      .map(filter => filter.value);

  const songs = playlistContainer.querySelectorAll('.song');

  songs.forEach(song => {
      const songName = song.querySelector('h3').textContent.toLowerCase();
      const songArtist = song.querySelector('p').textContent.toLowerCase();
      const songStatuses = Array.from(song.querySelectorAll('.status-tag')).map(tag => tag.classList[1]);
      
      const matchesSearch = songName.includes(searchQuery) || songArtist.includes(searchQuery);
      const hasStatus = checkedFilters.length === 0 || checkedFilters.some(filter => songStatuses.includes(filter));
      
      if (matchesSearch && hasStatus) {
          song.style.display = 'block'; // Show song
      } else {
          song.style.display = 'none'; // Hide song
      }
  });
}

async function displayPlaylist() {
  const accessToken = await getAccessToken();
  const playlistContainer = document.getElementById('playlist');
  playlistContainer.innerHTML = '';

  const tracks = await getPlaylistData(accessToken);
  console.log(tracks); // Log the playlist data to inspect

  // Filter out songs that are not in songStatus
  const filteredTracks = tracks.filter(track => songStatus[track.track.id]);

  // Shuffle the filtered tracks
  const shuffledTracks = filteredTracks.sort(() => 0.5 - Math.random());

  shuffledTracks.forEach(track => {
      const song = track.track;
      console.log(song); // Log each song object to inspect

      const songElement = document.createElement('div');
      songElement.classList.add('song');
      songElement.dataset.genre = 'Hardcore';
      
      const statuses = songStatus[song.id] || [];
      statuses.forEach(status => {
          songElement.classList.add('status-' + status);
      });

      // Create the image element and wrap it with a link
      const img = document.createElement('img');
      img.src = song.album.images[0].url;
      img.alt = song.name;

      const link = document.createElement('a');
      link.href = song.external_urls.spotify;
      link.target = '_blank';
      link.appendChild(img);

      // Create the details container for the title and artist
      const details = document.createElement('div');

      const title = document.createElement('h3');
      title.textContent = song.name;

      const artist = document.createElement('p');
      artist.textContent = 'Artist: ' + song.artists.map(artist => artist.name).join(', ');

      const genreTag = document.createElement('span');
      genreTag.classList.add('genre-tag');
      genreTag.textContent = 'Hardcore';

      const statusTagsContainer = document.createElement('div');
      statusTagsContainer.classList.add('status-tags');
      
      statuses.forEach(status => {
          const statusTag = document.createElement('span');
          statusTag.classList.add('status-tag');
          statusTag.classList.add(status);
          statusTag.textContent = status.charAt(0).toUpperCase() + status.slice(1);
          statusTagsContainer.appendChild(statusTag);
      });

      details.appendChild(title);
      details.appendChild(artist);
      details.appendChild(genreTag);
      details.appendChild(statusTagsContainer);

      songElement.appendChild(link); // Add the link (with image) first
      songElement.appendChild(details); // Then add the details

      playlistContainer.appendChild(songElement);
  });
}


// Initialize filters and display playlist
createGenreFilters();
createStatusFilters();
displayPlaylist();

// Filtering functionality
document.addEventListener('DOMContentLoaded', () => {
  const filters = document.querySelectorAll('#status-filters input[type="checkbox"]');
  const searchInput = document.getElementById('search');
  
  // Function to apply filters
  function applyFilters() {
      filterSongs();
  }

  // Add event listener to all checkboxes
  filters.forEach(filter => {
      filter.addEventListener('change', applyFilters);
  });

  // Add event listener to search input
  searchInput.addEventListener('input', filterSongs);

  // Initialize with all songs visible
  applyFilters();
});

async function logSongIds() {
  const accessToken = await getAccessToken(); // Get the access token
  const tracks = await getPlaylistData(accessToken); // Fetch playlist data

  // Loop through each track in the playlist
  tracks.forEach(track => {
      const song = track.track; // Extract the song object
      console.log('Song ID:', song.id); // Log the song ID
      console.log('Song Name:', song.name); // Log the song name
  });
}

logSongIds();