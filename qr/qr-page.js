(function () {
  "use strict";

  var QR_SIZE = 400;

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
    setText(document.getElementById("teaching-qr-code-display"), code);

    hide(helpEl);
    if (params.helpText && params.helpText.trim()) {
      setText(helpEl, params.helpText);
      show(helpEl);
    }

    renderQr(document.getElementById("teaching-qr-code"), formUrl);

    show(document.getElementById("teaching-qr-content"));
    hide(document.getElementById("teaching-qr-error"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
