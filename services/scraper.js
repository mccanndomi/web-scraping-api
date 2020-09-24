const puppeteer = require("puppeteer");

const HOME_URL = "https://members.boardhost.com/peoplesforum/";

exports.uppercase = (str) => str.toUpperCase();

exports.posts = async () => {
  //init browser
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(HOME_URL);

  //fetch all links for messages
  const pages = await page.evaluate(() =>
    Array.from(document.querySelectorAll("li a")).map((entry) => entry.href)
  );

  await browser.close();

  return pages;
};
