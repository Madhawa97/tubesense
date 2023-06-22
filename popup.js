function displayVideoId() {
  chrome.storage.local.get("videoId", function (result) {
    var element = document.getElementById("video-id");
    if (result.videoId) {
        element.innerText = "Monitoring...";
    } else {
        element.innerText = "Watch a video to analyze preception."
    }
  });
}

displayVideoId();
