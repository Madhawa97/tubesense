const updateIcon = (tabId) => {
  chrome.tabs.get(tabId, async (tab) => {
    const url = tab.url;
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      chrome.storage.local.set({ videoId: videoId });
      chrome.action.setIcon({ path: "assets/neutral-48.png", tabId: tabId });

      // get comments for video id
      const comments = await getCommentsForVideo(videoId);
      console.log(comments);
      // get preception for the video

      // update icon accordingly
      // chrome.action.setIcon({ path: "assets/neutral-48.png", tabId: tabId });
    } else {
      chrome.action.setIcon({ path: "assets/default-48.png", tabId: tabId });
      chrome.storage.local.set({ videoId: null });
    }
  });
}

const getCommentsForVideo = async (videoId) => {
  const apiKey = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
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
}

chrome.tabs.onActivated.addListener((info) => {
  updateIcon(info.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  updateIcon(tabId);
});
