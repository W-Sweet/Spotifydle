var URLS = []; // array containing all the URLS for every playlist
var URI; // var containing the URI for the user spotify enviornemnt. 
var coverURLS = []; // array containing all the URLS for the cover of each playlist
var playlistCount = 0; // amount of playlists.
var selectedDropdownPlaylist;  // The selected playlist in the drop down menu at the top of the website, gotten from e.
var playlistIndex; // The index of the currently selected playlist, under the rotating image display.
var curr_song;
var curr_song_url = null; // temp variable to get the url for the randomly selected song.
var current_guesses = -1; // starts at -1, value for use not having a song selected
var win_flag = 0; // flag to let the page know player won game. 0 is false, 1 is true.
var has_embed = 0;
var debug = 1; // flag programmer sets while working on the page. Enable debug rendering on webpage
var embedController = null; // embed Controller
var timeToPlaySongs = [15000, 12000, 8000, 4000, 2000]
var lastsongselected  // tracker for the last song selected by spotifydle. intended to prevent players recieving the same song two times in a row randomly
var allRandomSongs = []; //array containing all random songs of a selected playlist
var playlistcache // cache for all the songs in the currently selected playlist
var cur_playlist_numsongs = -1
const dataList = document.getElementById('allRandomSongs')

document.addEventListener("DOMContentLoaded", function () { // on website load, gather all the playlist covers, and dispay them as a rotating wheel on the top of the webpage.
    console.log("Started website")
    coverHTML = document.getElementById('allCovers');
    document.getElementById('playlistImageCover').hidden = true;
    fetch('/get_playlist_URLS', { method: 'POST' }) // get Playlists URLS, and put them in a array, then go through the array and find the right link.
        .then(response => response.json())
        .then(data => {
            data.forEach(URL => { // put every URL into a array called URLS.
                URLS.push(URL);
            });
            Promise.all(
                URLS.map(url =>
                    fetch('/getPlaylistCover', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ playlistURL: url }) // Use url fr"DOMContentLoaded"om map
                    })
                        .then(response => response.json())
                )
            ).then(playlistCovers => {
                coverURLS.push(...playlistCovers); // Store all covers
                console.log(coverURLS);
            })
                .then(loadPlaylists).catch(error => console.error('Error fetching covers:', error));

            // experimental: attempting to call loadPlaylists() on website start with guarauntee that /get_playlist_URLS has been executed
        });

    fetch('/get_playlist_URIS', { method: 'POST' }) // get all playlist URIS and put them in a playlist. 
    fetch('/get_playlist_URIS', { method: 'POST' }) // get Playlists URLS, and put them in a array, then go through the array and find the right link.
        .then(response => response.json())
        .then(data => {
            data.forEach(URI => { // put every URI into a array called URLS.
                URIS = URI;
            });
        });


    var logo = document.getElementById('logo');
    var pageTitle = document.getElementById('pageTitle');
    pageTitle.style.height = logo.style.height;
});

document.getElementById('playlistImageCover').addEventListener('click', function () { //Fucntion to allow the playlist cover to be pressed, which will cause it to display the next playlist looping back to the first playlist when we reach the last playlist.
    const coverHTML = document.getElementById('playlistImageCover');
    console.log("Playlist cover pressed");
    if (playlistIndex == (coverURLS.length - 1)) { // we are looking at the final playlist.
        console.log("We are looking at the final playlist and need to loop back to 0.");
        playlistIndex = 0;
    }
    else { // increment by 1. 
        console.log("We are not looking at the last playlist");
        playlistIndex++;
    }
    coverHTML.src = coverURLS[playlistIndex]; // re-display the playlist on the website. 
    coverHTML.style.display = 'block';

})

document.getElementById('selectPlaylist').addEventListener('click', function () { //when the Select this playlist button is pressed, it will select a random song from said playlist and show it on the website. 
    console.log("Hit select this playlist");



    fetch('/getAllSongs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            playlistURL: URLS[playlistIndex]
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Adding");
            dataList.innerHTML = ''; // empty the datalist
            data.randomSongs.forEach(songName => { //go through the random songs, and add them to the datalist
                const option = document.createElement('option');
                option.value = songName;
                console.log(songName)
                dataList.appendChild(option);
            });
        })


    // getRandomSong is only called in this context. Would it be possible to make a different function for getRandomSong that takes in a restrict
    // and works on the assumption that the below getRandomSong has been called at least once?
    getRandomSong(playlistIndex).then(song => {
        console.log("Random song from selected playlist: ", song);
        curr_song = song;
        //Get current song url, for later use in creating embed. 
        fetch('/getSongURL', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                playlistURL: (URLS[playlistIndex]),
                songName: (curr_song)
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log(data.songURL);
                curr_song_url = data.songURL;
                //need to log the last selected song.
                if (curr_song_url == lastsongselected) {
                    console.log("The logic for checking if it is the same as the last selected song is working!");
                }
                else {
                    lastsongselected = curr_song_url;
                }
            })

            /*
            IMPORTANT IMPORTANT!
            With the way I'm currently implementing this, we need to make sure that the input user playlist is greater than just one
            song! Otherwise we'll probably get stuck in an inifinite loop of calling the same function over and over. This likewise needs
            to be scaled up depending on if I make the pseudo-random re-roll a queue of the last-x songs. Maybe have an alternative case in
            the code somewhere that doesn't trigger the last-x comparison if the length of the playlist isn't long enough?
            
            Current idea for implementation: encapsulate the getting of the random song into a function and have the if-else logic branch
            call the function recursively until the curr_song_url and the lastsongselected don't match?

            Alternatively, we can change the implementation of getrandomSong itself to behave differently if passed a song --> like a restriction
            that bars that song from being chosen again?
            */
            .then(createEmbed)
    });

    //unhide the play music clip button
    document.getElementById('startGame').hidden = false;

})


// I think this code is depreciated? We would need to move the first line. 
document.getElementById('startGame').addEventListener('click', function () {    // https://web.archive.org/web/20191026192215/https://developer.spotify.com/documentation/web-api/reference/player/start-a-users-playback/
    console.log("Pressed start Game");

    if (embedController != null) {
        console.log("starting game")
        embedController.play();
        console.log("Playing for ", timeToPlaySongs[4]);
        sleep(timeToPlaySongs[4]).then(() => { embedController.pause(); console.log("Pausing song"); }); // we let the song play for the shortest interval, then pause and wait for the user to guess. 
    }
    else {
        console.log("embedController is null")
    }
})

document.getElementById('userGuessSubmit').addEventListener('click', guessCheck)

function PrintOutSelected() { // whenever a new playlist is selected in the dropdown, 
    var e = document.getElementById('playlists'); //dropdown with all the playlists
    console.log("SELECTED INDEX", e.selectedIndex);
    var selectedDropdownPlaylist = e.options[e.selectedIndex].textContent;
    console.log("Selected playlist", selectedDropdownPlaylist);
}

async function getRandomSong(val) { // when passed a playlist index, IE 2 would be the second playlist in the list of a users playlists, the fucntion returns a random song from the second playlist. 
    console.log("Selected this index for random song", val);
    const playlistResponse = await fetch('/get_playlist_URLS', { method: 'POST' });
    const playlistData = await playlistResponse.json(); // might just be able to store playlist data in a global variable?

    cur_playlist_numsongs = playlistData.length //should store the number of songs in the currently selected playlist?

    // Assuming playlistData contains the array `URLS`
    const songResponse = await fetch('/getRandomSong', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ playlistURL: playlistData[val] })
    });
    const songData = await songResponse.json();

    const listItem = document.createElement('li');
    listItem.textContent = songData;
    randomSongs.appendChild(listItem); // could use this by leveraging it as a cache to check if the song has been pulled for pseudo random song?

    guessCheckToggle(1);

    return songData; // returns a random song based off of val.
}


function guessCheck() {
    var userGuess = document.getElementById('userGuess').value;

    console.log("User Guess:", userGuess); //prints out the user's guess, for debugging purposes
    console.log("Selected Song:", curr_song); //prints out the current song being guessed, for debugging purposes


    //timeToPlaySongsInMS
    if (userGuess === curr_song) {
        console.log("You won, Good Job!"); //debug statement for testing logic
        win_flag = 1;
        embedController.pause();
        embedController.play();
        guessCheckToggle(0);
    }

    else {
        console.log("You SUCK!"); //debug statement for testing logic
        current_guesses--;
        if (current_guesses == 0) {
            console.log("You Lose, too bad!")
            embedController.pause();
            embedController.play();
            guessCheckToggle(0);
        }
        else {
            embedController.pause(); // restart song
            embedController.play();
            sleep(timeToPlaySongs[current_guesses - 1]).then(() => { embedController.pause(); console.log("Pausing song"); }); //play song for a set amount of time, correlating to the amount of guesses left. 
            console.log("Current Guesses:", current_guesses);
            updateGuessCountDisplay();
        }

    }

}

//turns the interface for submitting guesses on/off depending on input text string
//0 toggles guessCheck interface off, 1 toggles guessCheck interface on
function guessCheckToggle(status) {
    if (status == 0) {
        current_guesses = -1; //sets the guess counter value to the default
        document.getElementById('userGuessElements').hidden = true;   //hides the guess submit button
    }
    else {
        current_guesses = 5; //sets the guess counter value to the max
        document.getElementById('userGuessElements').hidden = false;  //shows the guess submit button
        document.getElementById('guessCountDisplay').hidden = false;
    }
    updateGuessCountDisplay();
}

function updateGuessCountDisplay() {
    /* 
        Guess count display should appear when the user chooses a song to guess. It should disappear when the
        user chooses a new playlist and they no longer have a song selected. When the user wins or loses, the
        box should update to reflect the outcome of their game.
    */
    if (current_guesses < 0) {
        if (win_flag == 1) {
            document.getElementById('guessCountDisplay').innerHTML = "You Win! Congratulations!";
            win_flag = 0;
        }
        else document.getElementById('guessCountDisplay').innerHTML = "You Lose! Too Bad!";
    }
    else {
        document.getElementById('guessCountDisplay').innerHTML = "Remaining Guesses: " + current_guesses;
    }
}

/* 
    Currently, the guess check will work off of directly comparing the input string to the name of the song
    as fetched by spotipy. As it is unreasonable to expect the user to be able to get the string value
    exactly correct, I suggest we eventually implement a song search function in the style of something like
    bandle.
*/

function loadPlaylists() {
    document.getElementById('playlistImageCover').hidden = false;
    fetch('/getPlaylistNames', { method: 'POST' }) // run all playlist names.
        .then(response => response.json())
        .then(data => {
            console.log("PLAYLIST NAMES:", data);
            // debug line for rendering list of user playlists visible. might delete later.
            if (debug == 1) {
                document.getElementById('playlistIntro').hidden = false;
                document.getElementById('playlistContainer').hidden = false;
                document.getElementById('randomSongsWrapper').hidden = false;
                document.getElementById('randomSongIntro').hidden = false;
                document.getElementById('randomSongs').hidden = false;
            }
            var select = document.getElementById("playlists")
            playlistContainer.innerHTML = '';
            var iter = 0;
            data.forEach(name => { // going through and for each playlist adding it as a list object onto the webpage
                const listItem = document.createElement('li');
                listItem.textContent = name;
                // another debug line for redering list of user playlists
                if (debug == 1) {
                    playlistContainer.appendChild(listItem);
                    console.log("Adding ", select.options.length, "  ", listItem.textContent);
                }
                toAdd = new Option(name, iter);
                console.log("printing name again, ", toAdd.textContent)
                select.options[select.options.length] = toAdd; // add to dropdown menu all possible playlists. 
                iter += 1;
            });
            playlistCount = iter;
            // main game elements hidden till a playlist is selected
            // I'm gonna be so for real, the line of code below this might be depreciated
            document.getElementById('gameBody').hidden = false;
        })
    selectedDropdownPlaylist = 1; // selected playlist
    playlistIndex = selectedDropdownPlaylist;
    const coverHTML = document.getElementById('playlistImageCover');
    console.log("pressed show cover")
    console.log("Selected playlist", selectedDropdownPlaylist);
    for (let i = 0; i < coverURLS.length - 1; i++)
        coverHTML.src = coverURLS[i]; // set the src of the image on the website, to the selected playlist image. 
    coverHTML.style.display = 'block';

}

function createEmbed() {
    console.log("Show embed button pressed");

    if (has_embed == 0 && curr_song_url != null) { // doesn't have embed
        document.getElementById("embed-iframe").hidden = false; // unhide the embed


        window.onSpotifyIframeApiReady = (IFrameAPI) => { // wait for spotifyIframeApi to ready
            console.log("THE API IS READY AND AVAILABLE");
            const element = document.getElementById('embed-iframe');
            const options = {
                uri: curr_song_url,
                height: '0',
                width: '0%'
            };
            const callback = (EmbedController) => { embedController = EmbedController };
            IFrameAPI.createController(element, options, callback);
        };
        console.log("Completed embed function")
        has_embed = 1; // we now have an embed and attempt playing a song.

    }
    else {
        embedController.loadUri(curr_song_url);
        console.log("Already have embed, or curr_song_url is null");
    }
}

//helper function to delay on the website. Very strange since we are in JS, use sparingly.
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function selectPlaylist() {
    console.log("Hit select this playlist");





    // getRandomSong is only called in this context. Would it be possible to make a different function for getRandomSong that takes in a restrict
    // and works on the assumption that the below getRandomSong has been called at least once?
    getRandomSong(playlistIndex).then(song => {
        console.log("Random song from selected playlist: ", song);
        curr_song = song;
        //Get current song url, for later use in creating embed. 
        fetch('/getSongURL', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                playlistURL: (URLS[playlistIndex]),
                songName: (curr_song)
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log(data.songURL);
                curr_song_url = data.songURL;
                //need to log the last selected song.
                if (curr_song_url == lastsongselected && cur_playlist_numsongs != 1) {
                    console.log("The logic for checking if it is the same as the last selected song is working!");
                    selectPlaylist();
                    // ok so it checks the last played song and resets if its the same but lowkey this implementation sucks
                    // I have no idea if it is even remotely scalable
                }
                else {
                    lastsongselected = curr_song_url;
                }
            })

            /*
            IMPORTANT IMPORTANT!
            With the way I'm currently implementing this, we need to make sure that the input user playlist is greater than just one
            song! Otherwise we'll probably get stuck in an inifinite loop of calling the same function over and over. This likewise needs
            to be scaled up depending on if I make the pseudo-random re-roll a queue of the last-x songs. Maybe have an alternative case in
            the code somewhere that doesn't trigger the last-x comparison if the length of the playlist isn't long enough?
            
            Current idea for implementation: encapsulate the getting of the random song into a function and have the if-else logic branch
            call the function recursively until the curr_song_url and the lastsongselected don't match?

            Alternatively, we can change the implementation of getrandomSong itself to behave differently if passed a song --> like a restriction
            that bars that song from being chosen again?
            */
            .then(createEmbed)
    });

    //unhide the play music clip button
    document.getElementById('startGame').hidden = false;

}