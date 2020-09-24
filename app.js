const scraperModule = require("./services/scraper.js");

const express = require("express");

const app = express();

//Middlewares
// app.use("/", () => {
//   console.log("hello");
// });

//Rotes
app.get("/posts", async (req, res) => {
  await scraperModule
    .posts()
    .then((data) => res.send(data))
    .catch((error) => console.log("Error: " + error));
});

app.get("/post", async (req, res) => {
  await scraperModule
    .generatePost(req.query.messageUrl)
    .then((data) => res.send(data))
    .catch((error) => console.log("Error: " + error));
});

app.listen(3000);
