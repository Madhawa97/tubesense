function updateIcon(tabId) {
  chrome.tabs.get(tabId, function (tab) {
    var url = tab.url;
		var videoId = getYouTubeVideoId(url);
		if (videoId) {
			chrome.action.setIcon({ path: "assets/happy-48.png", tabId: tabId });
      chrome.storage.local.set({videoId: videoId});
    } else {
			chrome.action.setIcon({ path: "assets/default-48.png", tabId: tabId });
			chrome.storage.local.set({videoId: null});
		}
  });
}

function getYouTubeVideoId(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length == 11 ? match[7] : false;
}

chrome.tabs.onActivated.addListener(function (info) {
  updateIcon(info.tabId);
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  updateIcon(tabId);
});




