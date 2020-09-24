const scraperModule = require("./services/scraper.js");

const express = require("express");

const app = express();

//Middlewares
// app.use("/", () => {
//   console.log("hello");
// });

//Rotes
app.get("/", async (req, res) => {
  await scraperModule
    .posts()
    .then((data) => res.send(data))
    .catch((error) => console.log("Error: " + error));
  //res.send(scraperModule.posts());
});

app.listen(3000);
