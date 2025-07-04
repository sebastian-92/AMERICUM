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

// const frame = scramjet.createFrame(document.getElementById("iframeWindow"));
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
  newTab(url);
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
function toggleDisplay(id) {
  let element = document.getElementById(id);
  if (element.style.display === "none" || element.style.display === "") {
    element.style.display = "block";
  } else {
    element.style.display = "none";
  }
}
function randintrange(min, max) {
  min = Math.ceil(min); // Ensure min is an integer
  max = Math.floor(max); // Ensure max is an integer
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
var tabIds = 0;
function newTab(url) {
  var frameID = tabIds++;
  let newTab = document.createElement("iframe");
  newTab.className = "iframeWindow";
  newTab.id = "frame-" + frameID;
  newTab.style.display = "none";

  document.getElementById("center").appendChild(newTab);
  scramjet.createFrame(newTab);

  let eagleDiv = document.createElement("div");
  eagleDiv.className = "eagle";
  eagleDiv.id = frameID;
  eagleDiv.onclick = () => changeTab(frameID);
  eagleDiv.style.top = randintrange(0, 70) + "%";
  eagleDiv.innerHTML = '<img src="images/EAGLE.png" />';
  document.body.appendChild(eagleDiv);

  switch (document.getElementById("proxy").value) {
    case "uv":
      newTab.src = __uv$config.prefix + __uv$config.encodeUrl(url);
      break;
    case "scram":
      newTab.src = scramjet.encodeUrl(url);
      break;
  }
  changeTab(frameID);
}
function changeTab(id) {
  document.querySelectorAll(".iframeWindow").forEach((frame) => {
    frame.style.display = "none";
  });
  document.getElementById("frame-" + id).style.display = "block";
}
