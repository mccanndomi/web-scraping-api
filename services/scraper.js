const firebase = require("firebase/app");
require("firebase/database");
var firebaseConfig = {
  apiKey: "AIzaSyBjllX7M_p3lwZlTbrnz0HUtNQiWg_v_sc",
  authDomain: "web-scraping-api.firebaseapp.com",
  databaseURL: "https://web-scraping-api.firebaseio.com",
  projectId: "web-scraping-api",
  storageBucket: "web-scraping-api.appspot.com",
  messagingSenderId: "562655786141",
  appId: "1:562655786141:web:da6c23efde05ab23629074",
};
firebase.initializeApp(firebaseConfig);
var database = firebase.database();
const puppeteer = require("puppeteer");

const HOME_URL = "https://members.boardhost.com/peoplesforum/";
const testingPosts = [
  "https://members.boardhost.com/peoplesforum/msg/1608053554.html", //contains hidden link
  "https://members.boardhost.com/peoplesforum/msg/1608049910.html", //contains normal link
  "https://members.boardhost.com/peoplesforum/msg/1608149348.html", //contains no link
];

module.exports = {
  /**
   * Generates an array of links to all the main post threads.
   */
  posts: async () => {
    //init browser
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(HOME_URL);

    //fetch all links for messages
    const postLinks = await page.evaluate(() =>
      Array.from(document.querySelectorAll("li a")).map((entry) => entry.href)
    );

    var mainPosts = [];
    var mainPostsIndex = 0;
    var propperPostLinks = [];
    var propperPostIndex = 0;
    //sort through all links and remove the first of each section
    //this is to remove the comment links that arn't needed
    //we just need the main post link.
    var i;

    /* ---------------------------- GENERATING POST LINKS TESTING ------------------------------- */
    // for (i = 0; i < testingPosts.length; i++) {
    //   console.log(testingPosts[i]);
    //   //if the first link add to posts
    //   if (i == 0) {
    //     mainPosts[mainPostsIndex++] = testingPosts[i];
    //   }
    //   //if previous link is blank then add this link as
    //   //it is start of new thread
    //   if (testingPosts[i - 1] == "") {
    //     mainPosts[mainPostsIndex++] = testingPosts[i];
    //   }
    //   if (testingPosts[i] != "") {
    //     propperPostLinks[propperPostIndex++] = testingPosts[i];
    //   }
    // }

    /* -------------------------------- GENERATING POST LINKS ----------------------------------- */
    for (i = 0; i < postLinks.length - 1; i++) {
      //if the first link add to posts
      if (i == 0) {
        mainPosts[mainPostsIndex++] = postLinks[i];
      }
      //if previous link is blank then add this link as
      //it is start of new thread
      if (postLinks[i - 1] == "") {
        mainPosts[mainPostsIndex++] = postLinks[i];
      }

      if (postLinks[i] != "") {
        propperPostLinks[propperPostIndex++] = postLinks[i];
      }
    }

    var postObjects = [];
    for (i = 0; i < propperPostLinks.length; i++) {
      await page.goto(propperPostLinks[i]);

      const post = await page.evaluate(() => {
        //build template structure
        return (postData = {
          media: false,
          source: "TPF",
          id: getIDfromURL(document.baseURI),
          title: getTitle(document.querySelector("ul font b").innerText),
          user: getUsername(
            document.querySelector("ul div font").innerText.split(" ")
          ),
          date: getDate(
            document.querySelector("ul div font").innerText.split(" ")
          ),
          time: getTime(
            document.querySelector("ul div font").innerText.split(" ")
          ),
          description: getDiscription(
            document.querySelector("ul table tbody tr td font div").innerText
          ),
          comments:
            document.querySelector("li").innerText ==
            "There are no responses to this message."
              ? 0
              : Array.from(document.querySelectorAll("li")).length - 1,
          parrentID: document
            .querySelector("ul font a")
            .href.includes("https://members.boardhost.com/peoplesforum")
            ? getIDfromURL(document.querySelector("ul font a").href)
            : "",
          childIDs: Array.from(
            Array.from(document.querySelectorAll("ul"))[1].childNodes
          )
            .slice(1)
            .map((entry) => getIDfromURL(entry.firstChild.href)),
          link:
            Array.from(document.querySelectorAll("ul font p a")).length != 0
              ? document.querySelector("ul font p a").href
              : document.querySelector("ul font div a").href !=
                "https://secure.boardhost.com/mb/login/peoplesforum"
              ? document.querySelector("ul font div a").href
              : null,
        });

        //-------------------------------- HELPER FUNCTIONS -----------------------------
        /**
         * Helper function to get ID from URL
         * @param url
         */
        function getIDfromURL(url) {
          return url.slice(47).replace(".html", "");
        }

        /**
         * returns title well formated. returns nothing if "Re:"
         * @param {} params
         */
        function getTitle(text) {
          var body = "";
          body = text;
          //remove "nt"
          body = body.replace("(nt)", "");
          body = body.replace("(NT)", "");
          body = body.replace("(Nt)", "");
          body = body.replace("[nt]", "");
          body = body.replace("[NT]", "");
          body = body.replace("[Nt]", "");
          body = body.replace("nt", "");
          body = body.replace("NT", "");
          body = body.replace("Nt", "");

          if (body.includes("Re:")) {
            body = "";
          }

          return body;
        }

        /**
         * Returns a correct username from string. Used to handle multiple
         * word names
         * @param {} strings is all strings to sort through
         */
        function getUsername(strings) {
          var username = "";
          var sections = strings;

          sections.shift(); //remove "Posted"
          sections.shift(); //remove "by"

          for (let i = 0; i < sections.length; i++) {
            const element = sections[i];
            if (element == "on" || element === "on") {
              break;
            } else {
              username += element + " "; //add username word
            }
          }

          return username;
        }

        /**
         * Returns a correct date from string. Used to handle multiple
         * word names
         * @param {} strings is all strings to sort through
         */
        function getDate(strings) {
          var date = "";
          var sections = strings;

          sections.shift(); //remove "Posted"
          sections.shift(); //remove "by"

          for (let i = 0; i < sections.length; i++) {
            const element = sections[i];
            if (element == "on" || element === "on") {
              date =
                sections[i + 1] +
                " " +
                sections[i + 2].replace(",", "") +
                " " +
                sections[i + 3].replace(",", "");
              break;
            }
          }

          return date;
        }

        /**
         * Returns a correct time from strings. Used to handle multiple
         * word names
         * @param {} strings is all strings to sort through
         */
        function getTime(strings) {
          var time = "";
          var sections = strings;

          sections.shift(); //remove "Posted"
          sections.shift(); //remove "by"

          for (let i = 0; i < sections.length; i++) {
            const element = sections[i];
            if (element == "on" || element === "on") {
              time = sections[i + 4] + " " + sections[i + 5].replace(",", "");
              break;
            }
          }

          return time;
        }

        /**
         *  function that formats and handles the body text.
         * @param {} text
         */
        function getDiscription(text) {
          var body = "";
          body = text;

          //remove previous message info
          body = body.split("Previous Message")[0];
          //remove "nt"
          body = body.replace("(nt)", "");
          body = body.replace("(NT)", "");
          body = body.replace("(Nt)", "");
          body = body.replace("[nt]", "");
          body = body.replace("[NT]", "");
          body = body.replace("[Nt]", "");
          body = body.replace("nt", "");
          body = body.replace("NT", "");
          body = body.replace("Nt", "");

          return body;
        }
      });

      //add post structure to firebase.
      database.ref("posts/" + post.id).set(post);

      postObjects[i] = post;
    }

    await browser.close();

    //return all main post links
    return postObjects;
  },

  /**
   * Generates a structured peice of data that follows
   * "all-posts-structure.json" for a single post
   */
  generateChildPost: async (url, parrentId) => {
    //init browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const post = await page.evaluate(() => {
      //build template structure
      return (postData = {
        media: false,
        source: "TPF",
        id: "",
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
        comments:
          Array.from(
            document.querySelectorAll("ul font table tbody tr td ul li")
          ).length - 1,
        parrentID: parrentId,
        childIDs,
      });
    });

    return post;
  },
};
