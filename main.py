#web framework imports
from flask import Flask, session, url_for, redirect, request, render_template, jsonify 
import os 

from spotipy import Spotify
from spotipy.oauth2 import  SpotifyOAuth
from spotipy.cache_handler import FlaskSessionCacheHandler

import random

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(64) # create a random key to get session information.

client_id = '1a15d168c5814a738c60fc39f634d8a2'
client_secret = 'e725f96b4cfd4482b2974f4c27cf92d0'
redirect_uri = 'http://localhost:5000/callback'
scope = 'playlist-read-private'

cache_handler = FlaskSessionCacheHandler(session) 
sp_oauth = SpotifyOAuth(
    client_id=client_id,
    client_secret=client_secret,
    redirect_uri=redirect_uri,
    scope=scope,
    cache_handler=cache_handler,
    show_dialog=True
)

sp = Spotify(auth_manager=sp_oauth) #where we get the spotify data from.
                                                                                # WORKING HERE https://github.com/spotipy-dev/spotipy/issues/593 WHY DOES IT SAY NEED SPOTIFY PREMIUM ???



#first user logs in with spotify account
@app.route('/') #root for web application
def home():
    if not sp_oauth.validate_token(cache_handler.get_cached_token()): #if they haven't logged in
        auth_url = sp_oauth.get_authorize_url() #push user back into attempting to log in.
        return redirect(auth_url)
    return render_template('webpage.html')

@app.route('/logout') #logout method
def logout():
    session.clear() #log them out
    return redirect(url_for('home')) #kick them back to home

@app.route('/getPlaylistNames', methods =['POST']) # method to get all playlist names
def getPlaylistNames():
    if not sp_oauth.validate_token(cache_handler.get_cached_token()): #if they haven't logged in
        auth_url = sp_oauth.get_authorize_url() #push user back into attempting to log in.
        return redirect(auth_url)
    playlists = sp.current_user_playlists()
    returnProduct = []
    for pl in playlists['items']:
        currName = pl['name']
        returnProduct.append(currName)
    return jsonify(returnProduct)

@app.route('/callback') #for getting user login code, and prevent logging in every time.
def callback():
    sp_oauth.get_access_token(request.args['code'])
    return redirect(url_for('home'))

@app.route('/get_playlist_URLS', methods = ['POST']) #method to get all playlist urls
def get_playlist_URLS():
    #first check they are logged in 
    if not sp_oauth.validate_token(cache_handler.get_cached_token()): #if they haven't logged in
        auth_url = sp_oauth.get_authorize_url() #push user back into attempting to log in.
        return redirect(auth_url)
    playlists = sp.current_user_playlists()
    returnProduct = [] # an array of playlist url's 
    for pl in playlists['items']: # for every playlist, append them to returnProduct
        currPlayLink = pl['external_urls']['spotify'] # URL of current playlist.
        returnProduct.append(currPlayLink)
    return jsonify(returnProduct)

@app.route('/get_playlist_URIS', methods= ['POST'])
def get_playlist_URIS():
    if not sp_oauth.validate_token(cache_handler.get_cached_token()): #if they haven't logged in
        auth_url = sp_oauth.get_authorize_url() #push user back into attempting to log in.
        return redirect(auth_url)
    playlists = sp.current_user_playlists()
    returnProduct = []
    for pl in playlists['items']:
        # print(pl)
        currPlayURI = pl['owner']['uri']
        returnProduct.append(currPlayURI)
    return jsonify(returnProduct)

@app.route('/getPlaylistCover', methods = ['POST']) #route for below method
def getPlaylistCover():
    data = request.get_json()
    playlist_url = data.get('playlistURL')
    if playlist_url:
        cover = getPlaylistCoverMethod(playlist_url)
        return jsonify(cover)
    return jsonify({"error": "Playlist URL not provided"}, 400)

def getPlaylistCoverMethod(playlistURL): # given a playlist URL, will return a html link to the cover of the playlist.
    playlists = sp.current_user_playlists()
    for pl in playlists['items']:
        if (pl['external_urls']['spotify'] == playlistURL):
            cover = (pl['images'][0]['url'])
            return cover
    return 0

@app.route('/select_playlist', methods = ['GET', 'POST']) #method to get selected playlist
def select_playlist(): 
    value = ""
    if request.method == 'POST':
        selectedPlaylist = request.form['pickAPlaylist']
    return render_template('index.html', playlists = getPlaylistNames())

@app.route('/getRandomSong', methods = ['POST']) #route for below method
def getRandomSongROUTE(): 
    data = request.get_json()
    playlist_url = data.get('playlistURL')
    if playlist_url:
        random_song = getRandomSongs(playlist_url)
        return jsonify(random_song)
    return jsonify({"error": "Playlist URL not provided"}), 400



@app.route('/start_playback', methods = ['POST'])
def playSong(): # upon being passed a song URI, begin playing a song. 
    data = request.get_json()
    playlistURI = data.get('playlistURI')
    offset = data.get('offset')
    position = data.get('position')
    print("DAMN IT WANT TO BE NUMB", playlistURI, "    ", offset, "    ", position)
    # sp.start_playback( context_uri = playlistURI, offset =  offset, position_ms =  position)       HAS OFFSET
    # sp.start_playback( context_uri = playlistURI, position_ms = position) HAS POSITION
    sp.start_playback(context_uri = playlistURI)
    print("RAN PLAYBACK")   



def getRandomSongs(playlistURL):  #method, given a URL, will return a random song from it.
    AllSongs = []
    for song in sp.playlist_tracks(playlistURL)["items"]:
        # TEMP CHANGING GET SONG TO GET IT's URL INSTEAD OF NAME
        Data = song["track"]["name"]
        # Data = song["track"]["URL"]  #LAST HERE
        AllSongs.append(Data)
    random_song = random.choice(AllSongs)
    return random_song



if __name__ == '__main__' :
    app.run(debug=True) #run flask








