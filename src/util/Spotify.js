const client_id = "91723b3e7835437194f0770614bfab8e";
const redirect_uri = "http://localhost:3000";
let accessToken;

const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken
        } 
        // check for access token

        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if (accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);
            // this clears  the parameters, allowing us to grab a new access token when it expires.
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        } else {
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirect_uri}`;
            window.location = accessUrl;
        }
    },

    search(term) {
        const accessToken = Spotify.getAccessToken();
        console.log(`access token is ${accessToken}, searching term '${term}'`);
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, { 
            headers: {
            Authorization: `Bearer ${accessToken}`
            }
        }).then(response => {
            return response.json();
        }).then(jsonResponse => {
            if (!jsonResponse.tracks) {
                return [];
            }
            return jsonResponse.tracks.items.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artist,
                album: track.album,
                uri: track.uri
            }));
        })
    },

    savePlaylist(name, trackUris) {
        if (!name || !trackUris) {
            return;
        }

        const accessToken = Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${accessToken}`};
        let userId; 

        return fetch('https://api.spotify.com/v1/me', { 
            headers: headers}
        ).then(response => response.json()
        ).then(jsonResponse => {
            userId = jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({ name: name })
            }).then(response => response.json()
            ).then(jsonResponse => {
                const playlistId = jsonResponse.id;
                return fetch(`https://api.spotify.com//v1/users/${userId}/playlists/${playlistId}/tracks`, { 
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({ uris: trackUris })
                })
            })
        })
    }
}

export default Spotify;
//GET https://accounts.spotify.com/authorize
// https://accounts.spotify.com/authorize?
// client_id=fe01282e94241328a84e7c5cc169164&
// redirect_uri=http:%2F%2Fexample.com%2Fcallback&
// scope=user-read-private%20user-read-email&
// response_type=token&
// state=123