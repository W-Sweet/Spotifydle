var URLS = []; // array containing all the URLS for every playlist
var GlobalURI; // array containing all the URIS for every playlist for embedding later. 
var covers = []; // array containing all the URLS for the cover of each playlist
var currPlaylistDisplayed = 0; // starts at 0 and goes to max
var playlistCount = 0; // amount of playlists.

var e; //dropdown with all the playlists
var selectedPlaylist;  // The selected playlist in the drop down menu at the top of the website, gotten from e.
var playlistIndex; // The index of the currently selected playlist, under the rotating image display.
var curr_song;
var current_guesses = -1; // starts at -1, value for use not having a song selected

document.addEventListener("DOMContentLoaded", function () { // on website load, gather all the playlist covers, and dispay them as a rotating wheel on the top of the webpage.
    console.log("Started website")
    coverHTML = document.getElementById('allCovers');
    document.getElementById('playlistCover').hidden = true;
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
                covers.push(...playlistCovers); // Store all covers
                console.log(covers);
            }).catch(error => console.error('Error fetching covers:', error));

        });
    
     fetch('/get_playlist_URIS', {method: 'POST'}) // get all playlist URIS and put them in a playlist. 
        .then(response => response.json())
        .then(data => {
            data.forEach(URI => { // put every URI into a array called URLS.
                console.log("THIS IS A URI  ", URI);
                GlobalURI = URI; 
            });
        });
});

// document.addEventListener("load", loadPlaylists());

document.getElementById('allCoversButton').addEventListener('click', function () { //if the playlist cover at the top of the page is pressed, we need to cycle to the next playlist image.
    console.log("current playlist NUM", currPlaylistDisplayed, " ", covers[currPlaylistDisplayed]);
    fetch('/getPlaylistCover', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ playlistURL: URLS[currPlaylistDisplayed] })
    })
        .then(response => response.json())
        .then(playlistCover => {
            coverHTML.src = covers[currPlaylistDisplayed]; // set the src of the image on the website, to the selected playlist image. 
            coverHTML.style.display = 'block';
        })

    playlistCount = covers.length;
    if (currPlaylistDisplayed == (playlistCount - 1)) {
        currPlaylistDisplayed = 0;
    }
    else {
        currPlaylistDisplayed += 1;
    }
});

document.getElementById('getPlaylistsButton').addEventListener('click', function () { //when the "Get your Playlists" button is pressed, fill in the dropdown, with all the user's playlist names, as well as display the rotating cover display at the bottom of the webpage.
    document.getElementById('playlistCover').hidden = false;
    fetch('/getPlaylistNames', { method: 'POST' }) // run all playlist names.
        .then(response => response.json())
        .then(data => {
            console.log("PLAYLIST NAMES:", data);
            const playlistContainer = document.getElementById('playlistContainer');
            var select = document.getElementById("playlists")
            playlistContainer.innerHTML = '';
            var iter = 0;
            data.forEach(name => { // going through and for each playlist adding it as a list object onto the webpage
                const listItem = document.createElement('li');
                listItem.textContent = name;
                playlistContainer.appendChild(listItem);
                console.log("Adding ", select.options.length, "  ", listItem.textContent)
                toAdd = new Option(name, iter);
                console.log("printing name again, ", toAdd.textContent)
                select.options[select.options.length] = toAdd; // add to dropdown menu all possible playlists. 
                iter += 1;
            });
            playlistCount = iter;
            // main game elements hidden till a playlist is selected
            document.getElementById('gameBody').hidden = false; 
        })
        selectedPlaylist = 0; // selected playlist
        playlistIndex = selectedPlaylist;
        const coverHTML = document.getElementById('playlistCover');
        console.log("pressed show cover")
        console.log("Selected playlist", selectedPlaylist);
        fetch('/get_playlist_URLS', { method: 'POST' }) // get Playlists URLS, and put them in a array, then go through the array and find the right link.
            .then(response => response.json())
            .then(data => {
                console.log("Got URLS");
                fetch('/getPlaylistCover', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ playlistURL: URLS[selectedPlaylist] })
                })
                    .then(response => response.json())
                    .then(playlistCover => {
                        console.log("Playlist Cover:", playlistCover);
                        coverHTML.src = playlistCover; // set the src of the image on the website, to the selected playlist image. 
                        coverHTML.style.display = 'block';
                    })
            });
    document.getElementById('getPlaylistsButton').onclick = null;
    document.getElementById('getPlaylistsButton').hidden = true;
});

document.getElementById('getSongs').addEventListener('click', function () { // when the "Get Random Song" button is pressed, print out to the console a random song.
    //before we get a random song from a playlist, we need the url for the playlist.
    console.log("Pressed second button");
    const randomSongs = document.getElementById('randomSongs');
    e = document.getElementById('playlists'); //dropdown with all the playlists
    selectedPlaylist = e.selectedIndex;
    console.log("Selected this index for random song", selectedPlaylist);
    fetch('/get_playlist_URLS', { method: 'POST' }) // get Playlists URLS, and put them in a array, then from the array, get the said URL and feed it into getRandomSong, then pring out the random song.
        .then(response => response.json())
        .then(data => {
            fetch('/getRandomSong', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ playlistURL: URLS[selectedPlaylist] }) // pass to the getRandomSong method in main.py, the URL of the selected playlist.
            })
                .then(response => response.json())
                .then(songData => {
                    const listItem = document.createElement('li');
                    listItem.textContent = songData;
                    randomSongs.appendChild(listItem);
                    console.log("Random song from playlist:", songData); // print out a random song from the selected playlist
                    curr_song = songData; //temporary storage of songData in global variable, for testing song guesses
                    guessCheckToggle(1);
                })

        });
});

document.getElementById('selectedPlaylistCover').addEventListener('click', function () { // when the show playlist cover button is pressed, present the selected playlist cover on the website. OBSELETE, done now on populating playlists in dropdown menu, or the getPlaylistButton.
    e = document.getElementById('playlists'); //dropdown with all the playlists
    selectedPlaylist = e.selectedIndex; // selected playlist
    playlistIndex = selectedPlaylist;
    const coverHTML = document.getElementById('playlistCover');
    console.log("pressed show cover")
    console.log("Selected playlist", selectedPlaylist);
    fetch('/get_playlist_URLS', { method: 'POST' }) // get Playlists URLS, and put them in a array, then go through the array and find the right link.
        .then(response => response.json())
        .then(data => {
            console.log("Got URLS");
            fetch('/getPlaylistCover', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ playlistURL: URLS[selectedPlaylist] })
            })
                .then(response => response.json())
                .then(playlistCover => {
                    console.log("Playlist Cover:", playlistCover);
                    coverHTML.src = playlistCover; // set the src of the image on the website, to the selected playlist image. 
                    coverHTML.style.display = 'block';
                })
        });
})

document.getElementById('playlistCover').addEventListener('click', function () { //Fucntion to allow the playlist cover to be pressed, which will cause it to display the next playlist looping back to the first playlist when we reach the last playlist.
    const coverHTML = document.getElementById('playlistCover');
    console.log("Playlist cover pressed");
    if (playlistIndex == (covers.length - 1)) { // we are looking at the final playlist.
        console.log("We are looking at the final playlist and need to loop back to 0.");
        playlistIndex = 0;
    }
    else { // increment by 1. 
        console.log("We are not looking at the last playlist");
        playlistIndex++;
    }
    coverHTML.src = covers[playlistIndex]; // re-display the playlist on the website. 
    coverHTML.style.display = 'block';
})

document.getElementById('selectPlaylist').addEventListener('click', function () { //when the Select ts playlist button is pressed, it will select a random song from said playlist and show it on the website. 
    console.log("Hit select this playlist");
    getRandomSong(playlistIndex).then(song => {
        console.log("Random song from selected playlist: ", song);
        // from here want to also get the URI of the randomly selected song. 
    });
})

document.getElementById('createEmbed').addEventListener('click', function() { // when create embed is pressed, embed the selected user playlist onto the webpage. 
    console.log("Show embed button pressed");
    console.log(URLS[playlistIndex]);
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
        console.log("breakfeast right off of the mirror");
        const embedURI = document.getElementById('embed-iframe');
        const options = {
            uri: GlobalURI                                                                                        
        };
        const callback = (EmbedController) => {};
        IFrameAPI.createController(embedURI, options, callback);    // NEED to refactor how we embed, possibly only embeding song to be played, look at when to get URI. 
    };
})


document.getElementById('playRandom').addEventListener('click', function() {
    console.log("Pressed play random");
    // call method for start_playback within main.py, passing URI of selected song. 

})
document.getElementById('userGuessSubmit').addEventListener('click', guessCheck)

function PrintOutSelected() { // whenever a new playlist is selected in the dropdown, 
    var e = document.getElementById('playlists'); //dropdown with all the playlists
    console.log("SELECTED INDEX", e.selectedIndex);
    var selectedPlaylist = e.options[e.selectedIndex].textContent;
    console.log("Selected playlist", selectedPlaylist);
}

async function getRandomSong(val) { 
    /*
    when passed a playlist index, IE 2 would be the second playlist in the list of a users playlists, the fucntion returns a random song from the second playlist. 
    */
    const playlistResponse = await fetch('/get_playlist_URLS', { method: 'POST' });
    const playlistData = await playlistResponse.json();

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
    randomSongs.appendChild(listItem);
    return songData; // returns a random song based off of val.
}


function guessCheck(){
    var userGuess = document.getElementById('userGuess').value;

    console.log("User Guess:", userGuess); //prints out the user's guess, for debugging purposes
    console.log("Selected Song:", curr_song); //prints out the current song being guessed, for debugging purposes

    if(userGuess === curr_song){
        console.log("Good Job!"); //debug statement for testing logic
        console.log("Current Guesses:", current_guesses);
        guessCheckToggle(0);

    }
    else{
        console.log("You SUCK!"); //debug statement for testing logic
        current_guesses--;
        if(current_guesses == 0){
            console.log("You Lose, too bad!")
            guessCheckToggle(0);
        }
        else{
            console.log("Current Guesses:", current_guesses);
            updateGuessCountDisplay();
        }
        
    }

    // console.log(typeof curr_song);
}

//turns the interface for submitting guesses on/off depending on input text string
//0 toggles guessCheck interface off, 1 toggles guessCheck interface on
function guessCheckToggle(status){
    if(status == 0){
        current_guesses = -1; //sets the guess counter value to the default
        document.getElementById('userGuessSubmit').hidden = true;   //hides the guess submit button
    }
    else{
        current_guesses = 5; //sets the guess counter value to the max
        document.getElementById('userGuessSubmit').hidden = false;  //shows the guess submit button
        document.getElementById('guessCountDisplay').hidden = false;
    }
    updateGuessCountDisplay();
}

function updateGuessCountDisplay(){
    /* 
        Guess count display should appear when the user chooses a song to guess. It should disappear when the
        user chooses a new playlist and they no longer have a song selected. When the user wins or loses, the
        box should update to reflect the outcome of their game.
    */
   if(current_guesses < 0){
    document.getElementById('guessCountDisplay').innerHTML = "You Lose! Too Bad!";
   }
   else{
    document.getElementById('guessCountDisplay').innerHTML = "Remaining Guesses: " + current_guesses;
   }
}

/* 
    Currently, the guess check will work off of directly comparing the input string to the name of the song
    as fetched by spotipy. As it is unreasonable to expect the user to be able to get the string value
    exactly correct, I suggest we eventually implement a song search function in the style of something like
    bandle.
*/

function loadPlaylists(){
    document.getElementById('playlistCover').hidden = false;
    fetch('/getPlaylistNames', { method: 'POST' }) // run all playlist names.
        .then(response => response.json())
        .then(data => {
            console.log("PLAYLIST NAMES:", data);
            const playlistContainer = document.getElementById('playlistContainer');
            var select = document.getElementById("playlists")
            playlistContainer.innerHTML = '';
            var iter = 0;
            data.forEach(name => { // going through and for each playlist adding it as a list object onto the webpage
                const listItem = document.createElement('li');
                listItem.textContent = name;
                playlistContainer.appendChild(listItem);
                console.log("Adding ", select.options.length, "  ", listItem.textContent)
                toAdd = new Option(name, iter);
                console.log("printing name again, ", toAdd.textContent)
                select.options[select.options.length] = toAdd; // add to dropdown menu all possible playlists. 
                iter += 1;
            });
            playlistCount = iter;
            // main game elements hidden till a playlist is selected
            document.getElementById('gameBody').hidden = false; 
        })
        selectedPlaylist = 0; // selected playlist
        playlistIndex = selectedPlaylist;
        const coverHTML = document.getElementById('playlistCover');
        console.log("pressed show cover")
        console.log("Selected playlist", selectedPlaylist);
        fetch('/get_playlist_URLS', { method: 'POST' }) // get Playlists URLS, and put them in a array, then go through the array and find the right link.
            .then(response => response.json())
            .then(data => {
                console.log("Got URLS");
                fetch('/getPlaylistCover', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ playlistURL: URLS[selectedPlaylist] })
                })
                    .then(response => response.json())
                    .then(playlistCover => {
                        console.log("Playlist Cover:", playlistCover);
                        coverHTML.src = playlistCover; // set the src of the image on the website, to the selected playlist image. 
                        coverHTML.style.display = 'block';
                    })
            });
}