const fetch = require("node-fetch");

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

module.exports = {
  posts: async () => {
    var parentUrls = [];

    //Fetch all parent URLS
    fetch("https://www.reddit.com/r/Everton.json")
      .then(function (response) {
        return response.json();
      })
      .then(function (json) {
        var allParentDataObjects = Array.from(json.data.children);
        for (let i = 0; i < allParentDataObjects.length; i++) {
          const post = allParentDataObjects[i];

          parentUrls.push("http://reddit.com" + post.data.permalink);
        }

        for (let index = 0; index < parentUrls.length; index++) {
          const url = parentUrls[index];

          //Generate posts from the parent URL

          fetch(encodeURI(url + ".json"))
            .then(function (response) {
              //console.log(response);
              return response.json();
            })
            .then(function (json) {
              var parentData = json[0].data.children[0].data;
              var child_IDs = [];

              var date = new Date(parentData.created * 1000);

              var formattedDate =
                date.toLocaleString("en-US", { month: "long" }) +
                " " +
                date.toLocaleString("en-US", { day: "numeric" }) +
                " " +
                date.toLocaleString("en-US", { year: "numeric" });

              var formattedTime = date
                .toLocaleString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                })
                .toLocaleLowerCase();

              var parentPost = {
                source: "reddit",
                comments: parentData.num_comments,
                childIDs: child_IDs,
                date: formattedDate, //this is a UNIX time stamp
                description: parentData.selftext,
                id: parentData.id,
                parrentID: "",
                time: formattedTime, //this is a UNIX time stamp
                title: parentData.title,
                user: parentData.author,
                media: parentData.is_reddit_media_domain,
                link: parentData.hasOwnProperty("url_overridden_by_dest")
                  ? parentData.url_overridden_by_dest
                  : "",
              };

              var childPosts = json[1].data.children;
              var childObjects = [];

              for (let i = 0; i < childPosts.length; i++) {
                const childPost = childPosts[i];
                child_IDs.push(childPost.data.id);
                generateChildPost(childPost.data, parentData.id);
              }

              //console.log(parentPost);
              if (isNotUndefinedObject(parentPost)) {
                database.ref("posts/" + parentPost.id).set(parentPost);
              }
            });
        }
      });

    return "finished GET";
  },
};

/**
 * Generates a child post from data
 */
function generateChildPost(data, parrent_id) {
  var childRepliesIDs = [];
  var childReplies = [];

  if (
    data.replies != "" &&
    typeof data.replies === "object" &&
    data.replies !== null
  ) {
    //console.log("parrent: " + parrent_id);
    var childRepliesTemp = data.replies.data.children;
    childReplies = childRepliesTemp;
    for (let i = 0; i < childRepliesTemp.length; i++) {
      const childReply = childRepliesTemp[i].data;
      childRepliesIDs.push(childReply.id);
    }
  }

  if (childReplies != []) {
    for (let i = 0; i < childReplies.length; i++) {
      const childReply = childReplies[i].data;
      generateChildPost(childReply, data.id);
    }
  }

  var date = new Date(data.created * 1000);

  var formattedDate =
    date.toLocaleString("en-US", { month: "long" }) +
    " " +
    date.toLocaleString("en-US", { day: "numeric" }) +
    " " +
    date.toLocaleString("en-US", { year: "numeric" });

  var formattedTime = date
    .toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
    })
    .toLocaleLowerCase();

  var childPost = {
    source: "reddit",
    comments: 0,
    childIDs: childRepliesIDs,
    date: formattedDate,
    description: data.body,
    id: data.id,
    parrentID: parrent_id,
    time: formattedTime,
    title: "",
    user: data.author,
  };

  //console.log(childPost);
  if (isNotUndefinedObject(childPost)) {
    database.ref("posts/" + childPost.id).set(childPost);
  }

  return childPost;
}

/**
 * A quick temp method that checks each value is filled out.
 * @param {data being checked} data
 */
function isNotUndefinedObject(data) {
  if (typeof data.source === "undefined") {
    return false;
  } else if (typeof data.comments === "undefined") {
    return false;
  } else if (typeof data.childIDs === "undefined") {
    return false;
  } else if (typeof data.date === "undefined") {
    return false;
  } else if (typeof data.description === "undefined") {
    return false;
  } else if (typeof data.id === "undefined") {
    return false;
  } else if (typeof data.parrentID === "undefined") {
    return false;
  } else if (typeof data.time === "undefined") {
    return false;
  } else if (typeof data.title === "undefined") {
    return false;
  } else if (typeof data.user === "undefined") {
    return false;
  } else {
    return true;
  }
}
