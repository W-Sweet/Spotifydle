#run with python test.py

#web framework imports
from flask import Flask, session, url_for, redirect, request, render_template 
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

#first user logs in with spotify account
@app.route('/') #root for web application
def home():
    if not sp_oauth.validate_token(cache_handler.get_cached_token()): #if they haven't logged in
        auth_url = sp_oauth.get_authorize_url() #push user back into attempting to log in.
        return redirect(auth_url)
    return redirect(url_for('get_playlist_URLS')) #if logged in, get playlists

@app.route('/callback') #for getting user login code, and prevent logging in every time.
def callback():
    sp_oauth.get_access_token(request.args['code'])
    return redirect(url_for('get_playlist_URLS'))

@app.route('/get_playlist_URLS')
def get_playlist_URLS():
    #first check they are logged inhttps://stackoverflow.com/beta/discussions
    if not sp_oauth.validate_token(cache_handler.get_cached_token()): #if they haven't logged in
        auth_url = sp_oauth.get_authorize_url() #push user back into attempting to log in.
        return redirect(auth_url)
    playlists = sp.current_user_playlists()
    playlistURLS = []
    for pl in playlists['items']: # for every playlist, print the Name and URL.
        currPlayLink = pl['external_urls']['spotify'] # URL of current playlist.
        playlistURLS.append(currPlayLink)
        playlistURLS.append("In the Body Like A Gave")
    return playlistURLS

@app.route('/testing')
def testing():
    print(get_playlist_URLS())          #pickup here
    #return redirect_uri(url_for('logout'))
    #return render_template('index.html', content=())

@app.route('/logout')
def logout():
    session.clear() #log them out
    return redirect(url_for('home')) #kick them back to home

def getRandomSongs(PlaylistURL):
    AllSongs = []
    for song in sp.playlist_tracks(PlaylistURL)["items"]: # go through every song in said playlist.
        Data = [song["track"]["name"]] # name of song
        AllSongs.append(Data)
    random_song = random.choice(AllSongs)
    return random_song




if __name__ == '__main__' :
    app.run(debug=True) #run flask








