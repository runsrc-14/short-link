import express, { json } from "express";
import { nanoid } from "nanoid";
import dotenv from "dotenv";
import admin from "firebase-admin";
import serviceAccount from "./short-url-b901c-firebase-adminsdk-xmrz0-4628dafa1d.js";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

db.collection("short-link").get().then((snapshot) => {
  snapshot.forEach((doc) => {
    var data = doc.data();
    console.log(data);
  });
});

dotenv.config();
const app = express();

const urlDatabase = {};

app.use(json());

// Endpoint to create short URLs
app.post("/shorten", (req, res) => {
  const { originalUrl, metaImg, metaTitle } = req.body;
  const shortId = nanoid(8);

  urlDatabase[shortId] = { originalUrl, metaImg, metaTitle };
  // develop
  const shortUrl = `http://localhost:3000/${shortId}`;
  // production
  // const shortUrl = `https://friday-share-fb955bc29bef.herokuapp.com/${shortId}`;

  res.json({
    original_url: originalUrl,
    short_url: shortUrl,
  });
});
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Redirect to original URL when using short URL
app.get("/:shortId", (req, res) => {
  const { shortId } = req.params;

  try {
    const { originalUrl, metaImg, metaTitle } = urlDatabase[shortId];
    if (originalUrl) {
      // res.redirect(originalUrl);
      res.send(`
      <html>
        <head>
          <meta property="og:url" content="${originalUrl}" />
          <meta property="og:title" content="${
            metaTitle || "Your Default Title"
          }" />
          <meta property="og:image" content="${
            metaImg || "Default Image URL"
          }" />
          <!-- Other meta tags -->
        </head>
        <body>
          <p>Redirecting to ${originalUrl}...</p>
          <script>
            window.location.href = "${originalUrl}";
          </script>
        </body>
      </html>
          `);
    } else {
      res.status(404).send("URL not found");
    }
  } catch (error) {
    res.status(400).send("Invalid URL");
  }
});

app.listen(
  process.env.PORT || 5000,
  console.log(`Server running on port ${process.env.PORT}`)
);
