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
                console.log("Adding ", select.options.length, "  ", listItem.textContent)
                toAdd = new Option(name, iter);
                console.log("printing name again, ", toAdd.textContent)
                select.options[select.options.length] = toAdd; // add to dropdown menu all possible playlists. 
                iter+=1;
            });
        })
    .catch(error => console.error('Error:', error));
});

document.getElementById('getSongs').addEventListener('click', function () {
    //before we get a random song from a playlist, we need the url for the playlist.
    console.log("Pressed second button");
    var URLS = [];
    const randomSongs = document.getElementById('randomSongs');
    

    fetch('/get_playlist_URLS', {method: 'POST'}) // get Playlists URLS, and put them in a array.
        .then(response => response.json())
        .then(data => {
            data.forEach(URL => {
                URLS.push(URL);
            });
        
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
    });
});


function PrintOutSelected(){
    console.log("sonOfABanker")
    var e = document.getElementById('selectPlaylist'); //dropdown with all the playlists
    var selectedPlaylist = e.selectedIndex;
    var test = e[1].textContent;
    console.log("Should be running ", test)
    alert("Selected playist changed to", selectedPlaylist);
    // console.log("you selected this playlist ", selectedPlaylist);
    // https://stackoverflow.com/questions/15647295/javascript-seeting-selectedindex-to-be-blank-for-select-do-not-work
}
