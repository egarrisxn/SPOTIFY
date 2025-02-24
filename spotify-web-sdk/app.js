import dotenv from "dotenv";
import http from "http";
import https from "https";
import querystring from "querystring";

dotenv.config();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

const server = http.createServer((req, res) => {
  // Allow CORS for your frontend
  res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.url.startsWith("/callback")) {
    const urlParams = new URLSearchParams(req.url.split("?")[1]);
    const code = urlParams.get("code");

    if (!code) {
      res.statusCode = 400;
      res.end("Authorization code is missing");
      return;
    }

    // Step 2: Exchange the authorization code for an access token
    const postData = querystring.stringify({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const options = {
      hostname: "accounts.spotify.com",
      path: "/api/token",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const tokenReq = https.request(options, (tokenRes) => {
      let data = "";

      tokenRes.on("data", (chunk) => {
        data += chunk;
      });

      tokenRes.on("end", () => {
        const tokenData = JSON.parse(data);
        const accessToken = tokenData.access_token;

        if (!accessToken) {
          res.statusCode = 400;
          res.end("Access token missing");
          return;
        }

        // Return the access token to the frontend
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ access_token: accessToken }));
      });
    });

    tokenReq.on("error", (e) => {
      console.error("Error making request to Spotify API:", e);
      res.statusCode = 500;
      res.end("Error exchanging code for token");
    });

    // Send the post data
    tokenReq.write(postData);
    tokenReq.end();
  } else {
    res.statusCode = 404;
    res.end("Not Found");
  }
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
