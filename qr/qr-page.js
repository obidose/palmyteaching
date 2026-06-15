(function () {
  "use strict";

  var QR_SIZE = 400;
  var GENERATING_LABEL = "Saving…";
  var LABELS = {
    portrait: "Tall layout",
    landscape: "Wide layout"
  };

  function getParams() {
    var params = new URLSearchParams(window.location.search);
    return {
      s: params.get("s"),
      title: params.get("title"),
      date: params.get("date"),
      speaker: params.get("speaker"),
      helpText: params.get("helpText")
    };
  }

  function show(el) {
    if (el) el.hidden = false;
  }

  function hide(el) {
    if (el) el.hidden = true;
  }

  function setText(el, text) {
    if (el) el.textContent = text || "";
  }

  function showError(detail) {
    hide(document.getElementById("teaching-qr-content"));
    show(document.getElementById("teaching-qr-error"));
    setText(document.getElementById("teaching-qr-error-detail"), detail);
  }

  function renderQr(container, url) {
    container.innerHTML = "";
    /* global QRCode */
    new QRCode(container, {
      text: url,
      width: QR_SIZE,
      height: QR_SIZE,
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  function renderCode(container, code) {
    container.innerHTML = "";
    container.setAttribute("aria-label", "Session code " + code.split("").join(" "));

    for (var i = 0; i < code.length; i++) {
      var char = document.createElement("span");
      char.className = "slide__code-char";
      char.textContent = code.charAt(i);
      container.appendChild(char);
    }
  }

  function updateMeta(params) {
    var dateWrap = document.getElementById("teaching-qr-date-wrap");
    var speakerWrap = document.getElementById("teaching-qr-speaker-wrap");
    var sep = document.getElementById("teaching-qr-meta-sep");
    var hasDate = params.date && params.date.trim();
    var hasSpeaker = params.speaker && params.speaker.trim();

    setText(document.getElementById("teaching-qr-date"), params.date);
    setText(document.getElementById("teaching-qr-speaker"), params.speaker);

    hide(dateWrap);
    hide(speakerWrap);
    hide(sep);

    if (hasDate) show(dateWrap);
    if (hasSpeaker) show(speakerWrap);
    if (hasDate && hasSpeaker) show(sep);
  }

  function sanitizeFilename(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
  }

  function buildFilename(code, title, format) {
    var parts = ["palmyed-teaching", code];
    var slug = sanitizeFilename(title);

    if (slug) {
      parts.push(slug);
    }

    if (format === "landscape") {
      parts.push("landscape");
    }

    return parts.join("-") + ".png";
  }

  function downloadDataUrl(dataUrl, filename) {
    var link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }

  function shouldIncludeInCapture(node) {
    if (!node || !node.classList) {
      return true;
    }

    if (node.classList.contains("slide__download")) {
      return false;
    }

    if (node.classList.contains("slide__downloads")) {
      return false;
    }

    if (node.closest && node.closest(".slide__downloads")) {
      return false;
    }

    return true;
  }

  function captureCard(card, format) {
    var isLandscape = format === "landscape";

    if (isLandscape) {
      card.classList.add("slide__card--landscape");
    }

    return new Promise(function (resolve, reject) {
      window.requestAnimationFrame(function () {
        window.setTimeout(function () {
          /* global htmlToImage */
          htmlToImage
            .toPng(card, {
              pixelRatio: 2,
              cacheBust: true,
              filter: shouldIncludeInCapture
            })
            .then(resolve, reject);
        }, isLandscape ? 150 : 100);
      });
    }).finally(function () {
      card.classList.remove("slide__card--landscape");
    });
  }

  function setDownloadsDisabled(disabled, activeButton) {
    var buttons = document.querySelectorAll(".slide__download");

    for (var i = 0; i < buttons.length; i++) {
      var button = buttons[i];
      button.disabled = disabled;

      if (disabled && button === activeButton) {
        button.textContent = GENERATING_LABEL;
      } else if (!disabled) {
        button.textContent = LABELS[button.getAttribute("data-format")] || button.textContent;
      }
    }
  }

  function setupDownload(code, params) {
    var downloads = document.getElementById("teaching-qr-downloads");
    var card = document.querySelector("#teaching-qr-content .slide__card");

    if (!downloads || !card) {
      return;
    }

    show(downloads);

    downloads.addEventListener("click", function (event) {
      var button = event.target.closest(".slide__download");

      if (!button || button.disabled) {
        return;
      }

      var format = button.getAttribute("data-format") || "portrait";

      setDownloadsDisabled(true, button);

      captureCard(card, format)
        .then(function (dataUrl) {
          downloadDataUrl(dataUrl, buildFilename(code, params.title, format));
        })
        .catch(function () {
          window.alert("Could not generate image. Try again or take a screenshot.");
        })
        .finally(function () {
          setDownloadsDisabled(false);
        });
    });
  }

  function enableDownloadAfterRender(code, params) {
    window.requestAnimationFrame(function () {
      window.setTimeout(function () {
        setupDownload(code, params);
      }, 50);
    });
  }

  function init() {
    var params = getParams();
    var code = window.TeachingForm.normalizeCode(params.s);

    if (!window.TeachingForm.isConfigured()) {
      showError(
        "Attendance form is not configured yet. Contact the teaching coordinator."
      );
      return;
    }

    if (!code) {
      showError(
        "Missing session code. The link should include ?s= followed by a 4-character code."
      );
      return;
    }

    if (!window.TeachingForm.isValidCode(code)) {
      showError(
        "Invalid session code. Use four characters from A–H, J–N, P–Z, and 2–9 (not 0, O, 1, I, or L)."
      );
      return;
    }

    var formUrl = window.TeachingForm.buildUrl(code);
    var titleEl = document.getElementById("teaching-qr-title");
    var helpEl = document.getElementById("teaching-qr-help");

    setText(titleEl, params.title);
    if (!params.title || !params.title.trim()) {
      hide(titleEl);
    }

    updateMeta(params);
    renderCode(document.getElementById("teaching-qr-code-display"), code);

    hide(helpEl);
    if (params.helpText && params.helpText.trim()) {
      setText(helpEl, params.helpText);
      show(helpEl);
    }

    renderQr(document.getElementById("teaching-qr-code"), formUrl);

    show(document.getElementById("teaching-qr-content"));
    hide(document.getElementById("teaching-qr-error"));
    enableDownloadAfterRender(code, params);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
