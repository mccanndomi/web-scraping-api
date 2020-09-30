const scraperModule = require("./services/scraper.js");

const express = require("express");

const app = express();

//Routes
app.get("/posts", async (req, res) => {
  await scraperModule
    .posts()
    .then((data) => res.send(data))
    .catch((error) => console.log("Error: " + error));
});

app.listen(3000);
