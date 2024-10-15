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
    return render_template('index.html', playlists = getPlaylistNames()) #if logged in, go to main page.
    #return redirect(url_for('select_playlist')) 

@app.route('/callback') #for getting user login code, and prevent logging in every time.
def callback():
    sp_oauth.get_access_token(request.args['code'])
    return render_template('index.html', playlists = getPlaylistNames())
    #return redirect(url_for('select_playlist')) 

@app.route('/get_playlist_URLS') 
def get_playlist_URLS():
    #first check they are logged in 
    if not sp_oauth.validate_token(cache_handler.get_cached_token()): #if they haven't logged in
        auth_url = sp_oauth.get_authorize_url() #push user back into attempting to log in.
        return redirect(auth_url)
    playlists = sp.current_user_playlists()
    returnProduct = [] # an array of playlist url's 
    for pl in playlists['items']: # for every playlist, print the Name and URL.
        currPlayLink = pl['external_urls']['spotify'] # URL of current playlist.
        currName = pl['name']
        returnProduct.append(currPlayLink)
    return returnProduct

@app.route('/select_playlist', methods = ['GET', 'POST']) #method to get selected playlist
def select_playlist(): 
    print("HERE AT ALL")
    value = ""
    if request.method == 'POST':
        selectedPlaylist = request.form['pickAPlaylist']
    return render_template('index.html', playlists = getPlaylistNames())
    #     selectedPlaylist = request.form.get('pickAPlaylist')
    #     if selectedPlaylist:
    #         print("HELPLESS CHILD", selectedPlaylist)
    #     else:
    #         print("No playlist selected")
    #     return("PLAYLIST IS PRINTED")
    
    # return("Playlist unselected")


@app.route('/logout')
def logout():
    session.clear() #log them out
    return redirect(url_for('home')) #kick them back to home

def getRandomSongs(PlaylistURL): #given a playlist url, returns a random song name from it.
    AllSongs = []
    print(PlaylistURL)
    for song in sp.playlist_tracks(PlaylistURL)["items"]: # go through every song in said playlist.
        Data = [song["track"]["name"]] # name of song
        AllSongs.append(Data)
    random_song = random.choice(AllSongs)
    return random_song

def getPlaylistNames():
    if not sp_oauth.validate_token(cache_handler.get_cached_token()): #if they haven't logged in
        auth_url = sp_oauth.get_authorize_url() #push user back into attempting to log in.
        return redirect(auth_url)
    playlists = sp.current_user_playlists()
    returnProduct = []
    for pl in playlists['items']:
        currName = pl['name']
        returnProduct.append(currName)
    return returnProduct



if __name__ == '__main__' :
    app.run(debug=True) #run flask








