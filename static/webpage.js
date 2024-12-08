var currPlaylistDisplayed = 0;
var playlistCount = 0;
var URLS = [];
var covers = [];
document.addEventListener("DOMContentLoaded", function() { // on website load, gather all the playlist covers, and dispay them as a rotating wheel on the top of the webpage.
    console.log("Started website, display allCovers")
    const coverHTML = document.getElementById('allCovers');
    
    fetch('/get_playlist_URLS', { method: 'POST' }) // get Playlists URLS, and put them in a array, then go through the array and find the right link.
    .then(response => response.json())
    .then(data => {
        data.forEach(URL => {
            URLS.push(URL);
        });
        fetch('/getPlaylistCover', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ playlistURL: URLS[currPlaylistDisplayed] })
        })
            .then(response => response.json())
            .then(playlistCover => {
                covers.push(playlistCover)
                console.log("Playlist Cover:", playlistCover );
                coverHTML.src = playlistCover; // set the src of the image on the website, to the selected playlist image. 
                coverHTML.style.display = 'block';
            })
    });
});

document.getElementById('allCoversButton').addEventListener('click', function () { //if the playlist cover at the top of the page is pressed, we need to cycle to the next playlist image.
    console.log("current playlist NUM", currPlaylistDisplayed);
    console.log("current max playlist", playlistCount);
    const coverHTML = document.getElementById('allCovers');
    if (currPlaylistDisplayed == playlistCount){
        currPlaylistDisplayed = 0;
    }
    else{
        currPlaylistDisplayed+=1;
    }
    coverHTML.src = covers[currPlaylistDisplayed];
    coverHTML.style.display = 'block';
    console.log("Pressed on image");
    
});


document.getElementById('dataButton').addEventListener('click', function () { //when the "Get your Playlists" button is pressed, fill in the ul, with all the user's playlist names. 
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
        })
        .catch(error => console.error('Error:', error));
});

document.getElementById('getSongs').addEventListener('click', function () { // when the "Get Random Song" button is pressed, print out to the console a random song.
    //before we get a random song from a playlist, we need the url for the playlist.
    console.log("Pressed second button");
    const randomSongs = document.getElementById('randomSongs');
    var URLS = [];
    var e = document.getElementById('playlists'); //dropdown with all the playlists
    var selectedPlaylist = e.selectedIndex;
    console.log("Selected this index for random song", selectedPlaylist);
    fetch('/get_playlist_URLS', { method: 'POST' }) // get Playlists URLS, and put them in a array, then from the array, get the said URL and feed it into getRandomSong, then pring out the random song.
        .then(response => response.json())
        .then(data => {
            data.forEach(URL => {
                URLS.push(URL); // get all the URLS
            });
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
                })
            
        });
});

document.getElementById('selectedPlaylistCover').addEventListener('click', function () { // when the button is pressed, present the selected playlist cover on the website.
    var e = document.getElementById('playlists'); //dropdown with all the playlists
    var selectedPlaylist = e.selectedIndex; // selected playlist
    const coverHTML = document.getElementById('playlistCover');
    var URLS = [];
    console.log("pressed show cover")
    fetch('/get_playlist_URLS', { method: 'POST' }) // get Playlists URLS, and put them in a array, then go through the array and find the right link.
    .then(response => response.json())
    .then(data => {
        data.forEach(URL => {
            URLS.push(URL);
        });
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

function PrintOutSelected() { // whenever a new playlist is selected in the dropdown, 
    var e = document.getElementById('playlists'); //dropdown with all the playlists
    console.log("SELECTED INDEX", e.selectedIndex);
    var selectedPlaylist = e.options[e.selectedIndex].textContent;
    console.log("Selected playlist", selectedPlaylist);

}
