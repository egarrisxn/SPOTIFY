const clientId = "7e1896ac6948424b9a17826b3bb3b92b";
const redirectUri = "http://127.0.0.1:5500/spotify-web-sdk/index.html";
const scope =
  "user-read-private user-read-email streaming user-read-playback-state user-modify-playback-state";

// Check for 'code' parameter in the URL
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get("code");

if (!code) {
  redirectToSpotifyAuth();
} else {
  getAccessToken(code); // Send code to backend to get access token
}

function redirectToSpotifyAuth() {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: scope,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

async function getAccessToken(code) {
  const response = await fetch(`http://localhost:3000/callback?code=${code}`);
  const data = await response.json();
  const accessToken = data.access_token;
  console.log("Access Token:", accessToken);

  // Initialize Spotify Player with the access token
  initializeSpotifyPlayer(accessToken);
}

async function initializeSpotifyPlayer(accessToken) {
  window.onSpotifyWebPlaybackSDKReady = () => {
    const player = new Spotify.Player({
      name: "Web Playback SDK Player",
      getOAuthToken: (cb) => {
        cb(accessToken);
      },
      volume: 0.5,
      // enableMediaSession: true,
    });

    player.addListener("ready", ({ device_id }) => {
      console.log("Player ready with device ID:", device_id);
    });

    player.addListener("not_ready", ({ device_id }) => {
      console.log("Device ID has gone offline", device_id);
    });

    player.addListener("initialization_error", ({ message }) => {
      console.error("Initialization error:", message);
    });

    player.addListener("authentication_error", ({ message }) => {
      console.error("Authentication error:", message);
    });

    player.addListener("account_error", ({ message }) => {
      console.error("Account error:", message);
    });

    player.addListener("playback_error", ({ message }) => {
      console.error("Playback error:", message);
    });

    player.addListener("autoplay_failed", ({ message }) => {
      console.log(
        "Autoplay is not allowed by the browser autoplay rules.",
        message
      );
    });

    player.addListener(
      "player_state_changed",
      ({ position, duration, track_window: { current_track } }) => {
        console.log("Currently Playing", current_track);
        console.log("Position in Song", position);
        console.log("Duration of Song", duration);
      }
    );

    document.getElementById("togglePlay").onclick = () => {
      player.togglePlay().then(() => {
        console.log("Toggled playback!");
      });
    };

    player.connect().then((success) => {
      if (success) {
        console.log("The Web Playback SDK successfully connected to Spotify!");
      }
    });
  };

  // Load the Spotify Web Playback SDK script dynamically
  const script = document.createElement("script");
  script.src = "https://sdk.scdn.co/spotify-player.js";
  script.async = true;
  document.body.appendChild(script);
}

//---Get current state--//

// player.getCurrentState().then((state) => {
//   if (!state) {
//     console.error("User is not playing music through the Web Playback SDK");
//     return;
//   }

//   const current_track = state.track_window.current_track;
//   const next_track = state.track_window.next_tracks[0];

//   console.log("Currently Playing", current_track);
//   console.log("Playing Next", next_track);
// });

//---Get current volume--//

// player.getVolume().then((volume) => {
//   let volume_percentage = volume * 100;
//   console.log(`The volume of the player is ${volume_percentage}%`);
// });

//---Set current volume--//

// player.setVolume(0.5).then(() => {
//   console.log("Volume updated!");
// });

//---Pause playback---//

// player.pause().then(() => {
//   console.log("Paused!");
// });

//---Resume playback---//

// player.resume().then(() => {
//   console.log("Resumed!");
// });

//---Seek to a minute into the track---//

// player.seek(60 * 1000).then(() => {
//   console.log("Changed position!");
// });

//---Play previous track---//

// player.previousTrack().then(() => {
//   console.log("Set to previous track!");
// });

//---Play next track---//

// player.nextTrack().then(() => {
//   console.log("Skipped to next track!");
// });

//---Rename the player device---//

// player.setName("My New Player Name").then(() => {
//   console.log("Player name updated!");
// });

//---Disconnects current session---//

// player.disconnect();

//---Removes all "ready" events---//

// player.removeListener("ready");

//---Remove a specific "ready" listener---//

// player.removeListener("ready", yourCallback);

//---The player is activated. The player will keep the playing state once the state is transferred from other applications. Transfer your currently playing track into your application through device picker in Spotify APP---//

// myActivateElementButton.addEventListener("click", () => {
//   player.activateElement();
// });
