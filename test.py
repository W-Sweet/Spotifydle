# https://www.youtube.com/watch?v=2if5xSaZJlg&list=PL1TBkFFBtagorhLzvm5dCA1cOqJKxnWNz&index=1
#run with python test.py

from flask import Flask, session, url_for, redirect, request #web framework
import os 

from spotipy import Spotify
from spotipy.oauth2 import  SpotifyOAuth
from spotipy.cache_handler import FlaskSessionCacheHandler

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
    return redirect(url_for('get_playlists')) #if logged in, get playlists

@app.route('/callback') #for getting user login code, and prevent logging in every time.
def callback():
    sp_oauth.get_access_token(request.args['code'])
    return redirect(url_for('get_playlists'))

@app.route('/get_playlists')
def get_playlists():
    #first check they are logged inhttps://stackoverflow.com/beta/discussions
    if not sp_oauth.validate_token(cache_handler.get_cached_token()): #if they haven't logged in
        auth_url = sp_oauth.get_authorize_url() #push user back into attempting to log in.
        return redirect(auth_url)
    playlists = sp.current_user_playlists()
    playlists_info = [(pl['name'], pl['external']['spotify']) for pl in playlists['items']] # for every item in playlists, get name of playlist, the spotify url and store it in playlist_info.
    playlists_html = '<br> '.join([f'{name}: {url}' for name, url in playlists_info]) #on the website following a linebreak, print the playlist_info.

    return playlists_html

@app.route('/logout')
def logout():
    session.clear() #log them out
    return redirect(url_for('home')) #kick them back to home

if __name__ == '__main__' :
    app.run(debug=True) #run flask








