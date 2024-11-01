console.log("Started Website")
function buttonPressed(){
    console.log("Button was pressed")
    alert('Button was pressed')
}

function change(){
    document.getElementById('here').innerHTML = "Changed Value"
}

document.getElementById('dataButton').addEventListener('click', function () {
    console.log("HERE")
    fetch('/getPlaylistNames') // run all playlist names. 
        .then(response => response.json())
        .then(data => {
            console.log("PLAYLIST NAMES:", data);
            const playlistContainer = document.getElementById('playlistContainer');
            playlistContainer.innerHTML = '';
            data.forEach(name => { // going through and for each playlist adding it as a list object onto the webpage
                const listItem = document.createElement('li');
                listItem.textContent = name;
                playlistContainer.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error:', error));
});