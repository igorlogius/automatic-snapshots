/* global browser */

let autosnaptimerId = null;

function getTimeStampStr() {
  const d = new Date();
  let ts = "";
  [
    d.getFullYear(),
    d.getMonth() + 1,
    d.getDate() + 1,
    d.getHours(),
    d.getMinutes(),
    d.getSeconds(),
  ].forEach((t, i) => {
    ts = ts + (i !== 3 ? "-" : "_") + (t < 10 ? "0" : "") + t;
  });
  return ts.substring(1);
}

async function getFromStorage(type, id, fallback) {
  let tmp = await browser.storage.local.get(id);
  return typeof tmp[id] === type ? tmp[id] : fallback;
}

browser.browserAction.onClicked.addListener(async () => {
  if (autosnaptimerId === null) {
    const autosnapdelay = parseInt(
      await getFromStorage("number", "autosnapdelay", 30000),
    );
    browser.browserAction.setBadgeText({ text: "on" });
    autosnaptimerId = setInterval(async () => {
      await autoSnap();
    }, autosnapdelay);
  } else {
    clearInterval(autosnaptimerId);
    autosnaptimerId = null;
    browser.browserAction.setBadgeText({ text: "" });
  }
});

async function autoSnap() {
    browser.browserAction.disable();

  const tabs = await browser.tabs.query({ active: true, currentWindow: true });

  if (tabs.length !== 1) {
    return;
  }

  const tab = tabs[0];

  if (!/^https?:/.test(tab.url)) {
    return;
  }

  let tmp = "";

  try {
    let dataURI = "";

    dataURI = await browser.tabs.captureTab(tab.id, {
      format: "jpeg",
      quality: 90,
    });

    const link = document.createElement("a");
    link.setAttribute(
      "download",
      getTimeStampStr() +
        " " +
        tab.url.replaceAll(".", "_") +
        " " +
        tab.title.replaceAll(".", "_"),
    );
    link.setAttribute("href", dataURI);
    link.click();
    link.remove();
  } catch (e) {
    console.error(e);
  }

  setTimeout( () => {
      browser.browserAction.enable();
  },1000);
}

async function handleStartup() {
  const autostart = await getFromStorage("boolean", "autostart", false);

  if (autostart) {
    const autosnapdelay = parseInt(
      await getFromStorage("number", "autosnapdelay", 30000),
    );
    browser.browserAction.setBadgeText({ text: "on" });
    autosnaptimerId = setInterval(async () => {
      await autoSnap();
    }, autosnapdelay);
  }
}

browser.runtime.onStartup.addListener(handleStartup);
