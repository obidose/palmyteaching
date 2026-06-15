(function () {
  "use strict";

  function showError(message) {
    var errorEl = document.getElementById("attend-error");
    var formEl = document.getElementById("attend-form");
    var detailEl = document.getElementById("attend-error-detail");

    if (detailEl) detailEl.textContent = message;
    if (formEl) formEl.hidden = true;
    if (errorEl) errorEl.hidden = false;
  }

  function redirectToForm(code) {
    window.location.replace(window.TeachingForm.buildUrl(code));
  }

  function tryAutoRedirect() {
    var params = new URLSearchParams(window.location.search);
    var code = window.TeachingForm.normalizeCode(params.get("s"));

    if (!code) {
      return false;
    }

    if (!window.TeachingForm.isConfigured()) {
      showError(
        "Attendance form is not configured yet. Contact the teaching coordinator."
      );
      return true;
    }

    if (!window.TeachingForm.isValidCode(code)) {
      showError(
        "Invalid session code in link. Use four characters from A–H, J–N, P–Z, and 2–9."
      );
      return true;
    }

    redirectToForm(code);
    return true;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!window.TeachingForm.isConfigured()) {
      showError(
        "Attendance form is not configured yet. Contact the teaching coordinator."
      );
      return;
    }

    var input = document.getElementById("attend-code");
    var code = window.TeachingForm.normalizeCode(input ? input.value : "");

    if (!window.TeachingForm.isValidCode(code)) {
      showError(
        "Enter the 4-character code from the screen (A–H, J–N, P–Z, 2–9)."
      );
      return;
    }

    redirectToForm(code);
  }

  function init() {
    if (tryAutoRedirect()) {
      return;
    }

    var form = document.getElementById("attend-form");
    if (form) {
      form.addEventListener("submit", handleSubmit);
    }

    if (!window.TeachingForm.isConfigured()) {
      showError(
        "Attendance form is not configured yet. Contact the teaching coordinator."
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
