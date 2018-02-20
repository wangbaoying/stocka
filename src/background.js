function openIndex() {
    var scribefireUrl = chrome.extension.getURL('index.html');
    // Check for a tab already with this URL.
    chrome.tabs.getAllInWindow(null, function (tabs) {
        for (var i = 0; i < tabs.length; i++) {
            if (tabs[i].url == scribefireUrl) {
                chrome.tabs.update(tabs[i].id, { "selected" : true });
                return;
            }
        }
        chrome.tabs.create({"url": scribefireUrl});
    });
}

chrome.browserAction.onClicked.addListener(function() {
    openIndex();
});
