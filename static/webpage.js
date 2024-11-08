function buttonPressed(){
    console.log("Button was pressed")
    alert('Button was pressed')
}

function change(){
    document.getElementById('here').innerHTML = "Changed Value"
}

document.getElementById('dataButton').addEventListener('click', function () {
    console.log("HERE")
    fetch('/getPlaylistNames', { method: 'POST'}) // run all playlist names. 
        .then(response => response.json())
        .then(data => {
            console.log("PLAYLIST NAMES:", data);
            const playlistContainer = document.getElementById('playlistContainer');
            var select = document.getElementById("playlists")
            playlistContainer.innerHTML = '';
            data.forEach(name => { // going through and for each playlist adding it as a list object onto the webpage
                var iter = 0;
                const listItem = document.createElement('li');
                listItem.textContent = name;
                playlistContainer.appendChild(listItem);
                select.options[select.options.length] = new Option(listItem.textContent, iter); // add to dropdown menu all possible playlists. 
                iter+=1;
            });
        })
    .catch(error => console.error('Error:', error));
});

document.getElementById('selectPlaylist').addEventListener('click', function () {
    //before we get a random song from a playlist, we need the url for the playlist.
    console.log("Pressed second button");
    var URLS = [];
    const randomSongs = document.getElementById('randomSongs');
    console.log("PRINTING URLS")
    fetch('/get_playlist_URLS', {method: 'POST'})
        .then(response => response.json())
        .then(data => {
            console.log("GOT URLS")
            data.forEach(URL => {
                URLS.push(URL);
            });
        
    console.log("IM OUTSIDE IM OUTSIDE")
    console.log(URLS.length)
    URLS.forEach(URL => { // for each url, get a random song. 
        fetch('/getPlaylistSong', {
            method: 'POST', 
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({playlistURL: URL})
        })
        .then(response => response.json())
        .then(songData => {
            const listItem = document.createElement('li');
            listItem.textContent = songData;
            randomSongs.appendChild(listItem);
            console.log("Random song from playlist:", songData);
        })
    })
    // FOR NEXT TIME
    // need to specify which playlist to get the random song from, ie look at the dropdown and get that said playlist info.
    });
});
