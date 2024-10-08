/* global browser */

function onChange(evt) {
  let id = evt.target.id;
  let el = document.getElementById(id);

  let value = el.type === "checkbox" ? el.checked : el.value;
  let obj = {};

  if (value === "") {
    return;
  }
  if (el.type === "number") {
    try {
      value = parseInt(value);
      if (isNaN(value)) {
        value = el.min;
      }
      if (value < el.min) {
        value = el.min;
      }
    } catch (e) {
      value = el.min;
    }
  }

  obj[id] = value;

  browser.storage.local.set(obj).catch(console.error);
}

function onLoad() {
  ["autosnapdelay"].map((id) => {
    browser.storage.local
      .get(id)
      .then((obj) => {
        let el = document.getElementById(id);
        let val = obj[id];

        if (typeof val !== "undefined") {
          if (el.type === "checkbox") {
            el.checked = val;
          } else {
            el.value = val;
          }
        } else {
          el.value = (() => {
            switch (id) {
              case "autosnapdelay":
                return 30000;
              default:
                return 0;
            }
          })();
        }
      })
      .catch(console.error);

    let el = document.getElementById(id);
    el.addEventListener("input", onChange);
  });
}

document.addEventListener("DOMContentLoaded", onLoad);
