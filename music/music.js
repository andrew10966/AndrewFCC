document.addEventListener('DOMContentLoaded', () => {
    const musicProjects = [
        { title: "02/10/2024", file: "Project_1006.ogg" },
        { title: "02/23/2024 -V1", file: "Aria_Math_Enkkore_Remix.mp3" },
        { title: "02/23/2024 -V2", file: "Aria Math (Enkkore's Hardcore Remix).mp3" },
        { title: "03/12/2024", file: "Project_10.mp3" },
        { title: "03/22/2024", description: "As I was gathering all the songs I kept listening to this one, I dont really like the synth but other than that its pretty good IMO!", file: "Project_12.wav", favorite: true },
        { title: "04/08/2024 -V1", description: "Was this most likely just a miss export? We'll never know...", file: "Project_17.ogg" },
        { title: "04/08/2024 -V2", file: "Project_17.mp3" },
        { title: "04/08/2024 -V3", file: "Project_17 (1).ogg" },
        { header: "Birthday Jokes!" },
        { title: "Tiny's Birthday Yipee", file: "Project_14.ogg" },
        { title: "Minnie's Birthday Yipee", file: "Untitled.ogg" },
    ];

    const musicList = document.querySelector('.music-list');

    musicProjects.forEach(project => {
        if (project.header) {
            // Insert a new header for the section
            const header = document.createElement('h3');
            header.textContent = project.header;
            musicList.appendChild(header);
        } else {
            // Create music item
            const musicItem = document.createElement('div');
            musicItem.classList.add('music-item');
            if (project.favorite) {
                musicItem.classList.add('favorite');
            }
            musicItem.innerHTML = `
                <h2>${project.title}</h2>
                ${project.description ? `<p>${project.description}</p>` : ''}
                <audio controls>
                    <source src="${project.file}" type="audio/ogg">
                    Your browser does not support the audio element.
                </audio>
            `;
            musicList.appendChild(musicItem);
        }
    });
});