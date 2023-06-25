const updateIcon = (tabId) => {
  chrome.tabs.get(tabId, async (tab) => {
    const url = tab.url;
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      chrome.storage.local.set({ videoId: videoId });
      chrome.storage.local.set({ "isPerceptionLoading": true });
      chrome.action.setIcon({ path: "assets/loading-48.png", tabId: tabId });

      try {
        // get comments for video id
        const comments = await getCommentsForVideo(videoId);

        // get perception for the video
        const perception = await getPerceptionForComments(`[${comments}]`);

        // update icon accordingly
        if (perception.result == 3) {
          chrome.action.setIcon({ path: "assets/neutral-48.png", tabId: tabId });
        } else if (perception.result < 3) {
          chrome.action.setIcon({ path: "assets/sad-48.png", tabId: tabId });
        } else if (perception.result > 3) {
          chrome.action.setIcon({ path: "assets/happy-48.png", tabId: tabId });
        }
        chrome.storage.local.set({ "isPerceptionLoading": false });
        console.log(perception);
      } catch (error) {
        console.log(error)
        chrome.action.setIcon({ path: "assets/error-48.png", tabId: tabId });
        chrome.storage.local.set({ "isPerceptionLoading": false });
      }
    } else {
      chrome.action.setIcon({ path: "assets/default-48.png", tabId: tabId });
      chrome.storage.local.set({ videoId: null });
    }
  });
};

const getCommentsForVideo = async (videoId) => {
  const apiKey = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
  const url = "https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=" +
              videoId +
              "&order=relevance&maxResults=20&key=" +
              apiKey;

  try {
    const response = await fetch(url);
    const commentDetails = await response.json();
    let comments = [];

    for (const item of commentDetails.items) {
      const comment = item.snippet.topLevelComment.snippet.textDisplay;
      comments.push(comment);
    }
    return comments;

  } catch (error) {
    throw error;
  }
};

const getYouTubeVideoId = (url) => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length == 11 ? match[7] : false;
};

const getPerceptionForComments = async (comments) => {
  const url = "http://127.0.0.1:8000/";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ comments: comments })
  };
  try {
    const response = await fetch(url, options);
    console.log(response)
    if (response.error) {
      throw new Error(response.error);
    } else {
      const result = await response.json();
      return result;
    }
  } catch (error) {
    throw error;
  }
  
};

// chrome.tabs.onActivated.addListener((info) => {
//   updateIcon(info.tabId);
// });

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if(changeInfo.url){
    updateIcon(tabId);
  }
});
