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

    //got through all links and create objects that follow
    //"all-posts-structure.json" for a single post
    var mainPostObjects = [];
    for (i = 0; i < mainPosts.length; i++) {
      await page.goto(mainPosts[i]);

      const post = await page.evaluate(() => {
        //build template structure
        return (postData = {
          title: document.querySelector("ul font b").innerText,
          user: document.querySelector("ul div font").innerText.split(" ")[2],
          date:
            document.querySelector("ul div font").innerText.split(" ")[4] +
            " " + //Month eg: September
            document.querySelector("ul div font").innerText.split(" ")[5] +
            " " + //Date eg: 23
            document.querySelector("ul div font").innerText.split(" ")[6], //Year eg: 2020
          time:
            document.querySelector("ul div font").innerText.split(" ")[7] +
            " " +
            document.querySelector("ul div font").innerText.split(" ")[8],
          description: document.querySelector("ul table tbody tr td font div")
            .innerText,
          numComments:
            Array.from(
              document.querySelectorAll("ul font table tbody tr td ul li")
            ).length -
              1 ==
            1
              ? 0
              : Array.from(
                  document.querySelectorAll("ul font table tbody tr td ul li")
                ).length - 1,
        });
      });

      mainPostObjects[i] = post;
    }

    await browser.close();

    //return all main post links
    return mainPostObjects;
  },

  /**
   * Generates a structured peice of data that follows
   * "all-posts-structure.json" for a single post
   */
  generatePost: async (url) => {
    //init browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const post = await page.evaluate(() => {
      //build template structure
      return (postData = {
        title: document.querySelector("ul font b").innerText,
        user: document.querySelector("ul div font").innerText.split(" ")[2],
        date:
          document.querySelector("ul div font").innerText.split(" ")[4] +
          " " + //Month eg: September
          document.querySelector("ul div font").innerText.split(" ")[5] +
          " " + //Date eg: 23
          document.querySelector("ul div font").innerText.split(" ")[6], //Year eg: 2020
        time:
          document.querySelector("ul div font").innerText.split(" ")[7] +
          " " +
          document.querySelector("ul div font").innerText.split(" ")[8],
        description: document.querySelector("ul table tbody tr td font div")
          .innerText,
        numComments:
          Array.from(
            document.querySelectorAll("ul font table tbody tr td ul li")
          ).length -
            1 ==
          1
            ? 0
            : Array.from(
                document.querySelectorAll("ul font table tbody tr td ul li")
              ).length - 1,
      });
    });

    return post;
  },
};
