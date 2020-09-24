const puppeteer = require("puppeteer");

const HOME_URL = "https://members.boardhost.com/peoplesforum/";

module.exports = {
  /**
   * Generates an array of links to all the main post threads.
   */
  posts: async () => {
    //init browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(HOME_URL);

    //fetch all links for messages
    const postLinks = await page.evaluate(() =>
      Array.from(document.querySelectorAll("li a")).map((entry) => entry.href)
    );

    var mainPosts = [];
    var mainPostsIndex = 0;
    //sort through all links and remove the first of each section
    //this is to remove the comment links that arn't needed
    //we just need the main post link.
    var i;
    for (i = 0; i < postLinks.length; i++) {
      //if the first link add to posts
      if (i == 0) {
        mainPosts[mainPostsIndex++] = postLinks[i];
      }
      //if previous link is blank then add this link as
      //it is start of new thread
      if (postLinks[i - 1] == "") {
        mainPosts[mainPostsIndex++] = postLinks[i];
      }
    }

    await browser.close();

    //return all main post links
    return mainPosts;
  },

  /**
   * Generates a structured peice of data that follows
   * "data-structure-example.json" for a single post
   */
  generatePost: async (url) => {
    console.log(url);
  },
};
