function buttonPressed() {
    console.log("Button was pressed")
    alert('Button was pressed')
}

function change() {
    document.getElementById('here').innerHTML = "Changed Value"
}

document.getElementById('dataButton').addEventListener('click', function () {
    console.log("HERE")
    fetch('/getPlaylistNames', { method: 'POST' }) // run all playlist names. 
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
                console.log("Adding ", select.options.length, "  ", listItem.textContent)
                toAdd = new Option(name, iter);
                console.log("printing name again, ", toAdd.textContent)
                select.options[select.options.length] = toAdd; // add to dropdown menu all possible playlists. 
                iter += 1;
            });
        })
        .catch(error => console.error('Error:', error));
});

document.getElementById('getSongs').addEventListener('click', function () {
    //before we get a random song from a playlist, we need the url for the playlist.
    console.log("Pressed second button");
    const randomSongs = document.getElementById('randomSongs');
    var URLS = [];
    var e = document.getElementById('playlists'); //dropdown with all the playlists
    var selectedPlaylist = e.selectedIndex;
    console.log("Selected this index for random song", selectedPlaylist);


    fetch('/get_playlist_URLS', { method: 'POST' }) // get Playlists URLS, and put them in a array, then go through the array and find the right link.
        .then(response => response.json())
        .then(data => {
            data.forEach(URL => {
                //console.log("URL", URL)
                URLS.push(URL);
            });

            // console.log("URL LENGTH", URLS.length);

            for (let i = 0; i < URLS.length; i++) {
                //console.log("i, selectedPlaylist", i, selectedPlaylist);
                if (i == selectedPlaylist) {
                    console.log("IT'S THIS LINK");
                        fetch('/getPlaylistSong', {
                            method: 'POST', 
                            headers: {
                                'Content-Type' : 'application/json'
                            },
                            body: JSON.stringify({playlistURL: URLS[i]})
                        })
                        .then(response => response.json())
                        .then(songData => {
                            console.log("Random song from playlist:", songData);
                            // const listItem = document.createElement('li');
                            // listItem.textContent = songData;
                            // randomSongs.appendChild(listItem);

                        })


                }
            }
        });
});



function PrintOutSelected() {
    var e = document.getElementById('playlists'); //dropdown with all the playlists
    console.log("SELECTED INDEX", e.selectedIndex);
    var selectedPlaylist = e.options[e.selectedIndex].textContent;
    console.log("Selected playlist", selectedPlaylist);

}
