let play = document.getElementById("play")
let songs;
let currentSong = new Audio();
let currentFolder;
let cardContainer = document.getElementsByClassName("card-container");

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

function convertToMinutesSeconds(currentTime, duration) {
    const formattedCurrentTime = formatTime(currentTime);
    const formattedDuration = formatTime(duration);
    return `${formattedCurrentTime} / ${formattedDuration}`;
}
const getSongs = async(folder) => {
    currentFolder = folder;
    let data = await fetch(`http://${document.location.host}/${folder}/`);
    let response = await data.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let a = div.getElementsByTagName("a")
    songs = [];
    for (let index = 0; index < a.length; index++) {
        const element = a[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currentFolder}/`)[1])
        }
        }

        // show all the song in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ''
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li class="d-flex justify-between align-center">
        <div class="song-info d-flex justify-center align-center">
        <img class="cover-img" src="/images/cover.svg" alt="">
                            <div class="song-name">${song.replaceAll('%20', " ")}</div>
                            <div class="artist"></div>
                        </div>
                        <div class="play-now d-flex justify-center align-center">
                            <div>Play now</div>
                            <img class="invert" src="/images/play.svg" alt="" width="20px" height="24px">
                        </div>
                    </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName('li')).forEach(e => {
        e.addEventListener('click', element=> {
            playMusic(e.querySelector(".song-info").querySelector(".song-name").innerHTML)
            if (window.matchMedia("(max-width: 910px)").matches) {
                document.querySelector(".sidebar").style.left = '-145%';
            }
        })
    })
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currentFolder}/` + track;
    if (!pause) {
        currentSong.play()
        play.src = '/images/pause.svg'
    }
    document.querySelector(".current-song-name").innerHTML = decodeURI(track);
    document.querySelector(".song-time").innerHTML = "00:00/00:00";
}

 // get albums using fetch
 const getAlbum = async () => {
    let data = await fetch(`http://${document.location.host}/songs/`);
    let response = await data.text();
    
    let div = document.createElement("div");
    div.innerHTML = response
    let anchers = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".card-container");
    let array = Array.from(anchers)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes('/songs/')) {
            let folder = e.href.split("/").slice(-1)[0];
            let data = await fetch(`http://${document.location.host}/songs/${folder}/info.json`);
            let response = await data.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder=${folder} class="card">
                    <img src="./songs/${folder}/cover.jpg" alt="cover-image" >
                    <img class="play" src="/images/play.svg" alt="">
                    <h3>${response.title}</h3>
                    <p>${response.description}</p>
                </div>`
        }
 }

}

const main = async() => {
    // Get the list of all songs
    await getSongs('songs/ar')
    playMusic(songs[0], true)

    // Show all the albums on the page
    await getAlbum()

    // Attach an event listener to play and pause
    play.addEventListener('click', ()=> {
        if (currentSong.paused) {
        currentSong.play()
        play.src = '/images/pause.svg'
    } 
    else {
        currentSong.pause()
        play.src = '/images/playsong.svg'
    }
})

// time update event

currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".song-time").innerHTML = `${convertToMinutesSeconds(currentSong.currentTime, currentSong.duration)}`
    let progress = currentSong.currentTime / currentSong.duration * 100 + "%";
    document.querySelector(".circle").style.left = progress;
    
})

// Add an evevnt to listener seekbar

document.querySelector(".seekbar").addEventListener("click", e=> {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100;
})

// Add event to conroll hamburg

document.querySelector(".hamburg").addEventListener("click", () => {
    document.querySelector(".sidebar").style.left = '0%'
})

// Add event to conroll cross

document.querySelector(".cross").addEventListener("click", () => {
    document.querySelector(".sidebar").style.left = '-145%'
})

// Add event to listen next
prev.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index - 1) >= 0) {
        playMusic(songs[index-1])
    }
})

// Add event to listen next
next.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index + 1) < songs.length) {
        playMusic(songs[index+1])
    }
})

// Addd event listner to control volume
document.querySelector(".range").addEventListener("input", (e) => {
    currentSong.volume = e.target.value
} )

// Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener('click', async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            document.querySelector(".sidebar").style.left = '0%';
        })
    })
    
    // add event listner to mute the track
    document.querySelector(".volume").addEventListener("click", (e) => {
        console.log(e.target.src)
        if(e.target.src.includes('volume.svg')) {
            e.target.src = e.target.src.replace('volume.svg', 'mute.svg');
            currentSong.volume = 0;
            document.querySelector(".range").value = 0;
        }
        else {
            e.target.src = e.target.src.replace('mute.svg', 'volume.svg');
            console.log(e.target.src)
            currentSong.volume = 0.3;
            document.querySelector(".range").value = 0.3;
            console.log(document.querySelector(".range").value)
        }
    })
}

main()