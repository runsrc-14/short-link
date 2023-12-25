import express, { json } from "express";
import { nanoid } from "nanoid";
import dotenv from 'dotenv';

dotenv.config();
const app = express();

const urlDatabase = {};

app.use(json());

// Endpoint to create short URLs
app.post("/shorten", (req, res) => {
  const { originalUrl, metaImg, metaTitle } = req.body;
  const shortId = nanoid(8);

  urlDatabase[shortId] = { originalUrl, metaImg, metaTitle };
  const shortUrl = `http://localhost:${port}/${shortId}`;

  res.json({
    original_url: originalUrl,
    short_url: shortUrl,
  });
});

// Redirect to original URL when using short URL
app.get("/:shortId", (req, res) => {
  const { shortId } = req.params;

  try {
    const { originalUrl, metaImg, metaTitle } = urlDatabase[shortId];
    if (originalUrl) {
      // res.redirect(url);
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
    res.status(404).send("URL not found");
  }
});

app.listen(
  process.env.PORT || 5000,
  console.log(`Server running on port ${process.env.PORT}`)
);
