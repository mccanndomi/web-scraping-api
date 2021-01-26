const scraperModule = require("./services/scraper.js");
const redditModule = require("./services/reddit.js");

const express = require("express");

const app = express();

//Routes
app.get("/tpf", async (req, res) => {
  await scraperModule
    .posts()
    .then((data) => res.send(data))
    .catch((error) => console.log("Error: " + error));
});

app.get("/reddit", async (req, res) => {
  await redditModule
    .posts()
    .then((data) => res.send(data))
    .catch((error) => console.log("Error: " + error));
});

app.listen(3000);
