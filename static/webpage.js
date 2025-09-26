var URLS = []; // array containing all the URLS for every playlist
var covers = []; // array containing all the URLS for the cover of each playlist
var currPlaylistDisplayed = 0; // starts at 0 and goes to max
var playlistCount = 0;
var curr_song;

document.addEventListener("DOMContentLoaded", function() { // on website load, gather all the playlist covers, and dispay them as a rotating wheel on the top of the webpage.
    console.log("Started website")
    coverHTML = document.getElementById('allCovers');
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
                    body: JSON.stringify({ playlistURL: url }) // Use url from map
                })
                .then(response => response.json())
            )
        ).then(playlistCovers => {
            covers.push(...playlistCovers); // Store all covers
            console.log(covers);
        }).catch(error => console.error('Error fetching covers:', error));
 
    });
});

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
    if (currPlaylistDisplayed == (playlistCount-1)){
        currPlaylistDisplayed = 0;
    }
    else{
        currPlaylistDisplayed+=1;
    }
    
    //document.getElementById('allCoversButton').src = covers[currPlaylistDisplayed];

});


document.getElementById('dataButton').addEventListener('click', function () { //when the "Get your Playlists" button is pressed, fill in the ul, with all the user's playlist names. 
    fetch('/getPlaylistNames', { method: 'POST' }) // run all playlist names.
            //console.log("here") 
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
        })
        .catch(error => console.error('Error:', error));
});

document.getElementById('getSongs').addEventListener('click', function () { // when the "Get Random Song" button is pressed, print out to the console a random song.
    //before we get a random song from a playlist, we need the url for the playlist.
    console.log("Pressed second button");
    const randomSongs = document.getElementById('randomSongs');
    var e = document.getElementById('playlists'); //dropdown with all the playlists
    var selectedPlaylist = e.selectedIndex;
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
                })
            
        });
});

document.getElementById('selectedPlaylistCover').addEventListener('click', function () { // when the button is pressed, present the selected playlist cover on the website.
    var e = document.getElementById('playlists'); //dropdown with all the playlists
    var selectedPlaylist = e.selectedIndex; // selected playlist
    const coverHTML = document.getElementById('playlistCover');
    console.log("pressed show cover")
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
                console.log("Playlist Cover:", playlistCover );
                coverHTML.src = playlistCover; // set the src of the image on the website, to the selected playlist image. 
                coverHTML.style.display = 'block';
            })
    });
})

document.getElementById('playRandom').addEventListener('click', function() { //Begin playing a random song from the selected playlist.

})

document.getElementById('userGuess').addEventListener('change', guessCheck)
document.getElementById('userGuessSubmit').addEventListener('click', guessCheck)
// double triggers guesscheck upon user submitting an answer. I think remove one but want to test to make
// sure it doesn't break anything before I make a change and commit.

function PrintOutSelected() { // whenever a new playlist is selected in the dropdown, 
    var e = document.getElementById('playlists'); //dropdown with all the playlists
    console.log("SELECTED INDEX", e.selectedIndex);
    var selectedPlaylist = e.options[e.selectedIndex].textContent;
    console.log("Selected playlist", selectedPlaylist);

}

function guessCheck(){
    var userGuess = document.getElementById('userGuess').value;

    console.log("User Guess:", userGuess); //prints out the user's guess, for debugging purposes
    console.log("Selected Song:", curr_song); //prints out the current song being guessed, for debugging purposes

    if(userGuess === curr_song){
        console.log("Good Job!"); //debug statement for testing logic
    }
    else{
        console.log("You SUCK!"); //debug statement for testing logic
    }

    // console.log(typeof curr_song);
}

/* 
    Currently, the guess check will work off of directly comparing the input string to the name of the song
    as fetched by spotipy. As it is unreasonable to expect the user to be able to get the string value
    exactly correct, I suggest we eventually implement a song search function in the style of something like
    bandle.
*/
