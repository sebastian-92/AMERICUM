const scramjet = new ScramjetController({
  files: {
    wasm: "/scram/scramjet.wasm.wasm",
    worker: "/scram/scramjet.worker.js",
    client: "/scram/scramjet.client.js",
    shared: "/scram/scramjet.shared.js",
    sync: "/scram/scramjet.sync.js",
  },
  flags: {
    rewriterLogs: true,
  },
});
navigator.serviceWorker.register("/scramjet/sw.js");
scramjet.init();

const frame = scramjet.createFrame(document.getElementById("iframeWindow"));
const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
const wispUrl =
  (location.protocol === "https:" ? "wss" : "ws") +
  "://" +
  location.host +
  "/wisp/";
const bareUrl =
  (location.protocol === "https:" ? "https" : "http") +
  "://" +
  location.host +
  "/bare/";
document
  .getElementById("urlInput")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("searchButton").click();
    }
  });

document.getElementById("searchButton").onclick = async function (event) {
  event.preventDefault();

  let url = document.getElementById("urlInput").value; // if no periods are detected in the input, search google instead
  let searchUrl = "https://duckduckgo.com/search?q=";

  if (!url.includes(".")) {
    url = searchUrl + encodeURIComponent(url);
  } else {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      // if no http or https is detected, add https automatically
      url = "https://" + url;
    }
  }
  if (!(await connection.getTransport())) {
    await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
  }
  switch (document.getElementById("proxy").value) {
    case "uv":
      document.getElementById("iframeWindow").src =
        __uv$config.prefix + __uv$config.encodeUrl(url);
      break;
    case "scram":
      frame.go(url);
      break;
  }
};

document.getElementById("switcher").onselect = async function (event) {
  switch (event.target.value) {
    case "epoxy":
      await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
      break;
    case "bare":
      await connection.setTransport("/baremod/index.mjs", [bareUrl]);
      break;
  }
};
// var tabIds = [];
// function newTab(url) {
//   let newTab = document.createElement("iframe");
//   newTab.className = "iframeWindow";
//   scramjet.createFrame(newTab);
//   newTab.src = scramjet.encodeUrl(url);
//   }
