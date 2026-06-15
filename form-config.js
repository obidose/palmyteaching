/**
 * Pre-filled URL prefix from Microsoft Forms.
 * The site appends the 4-character session code from ?s= or manual entry.
 */
window.TeachingFormConfig = {
  urlPrefix: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=XdgHhCPtd0WRwpLiLa_o5cyML49IH9pGqy8W_OTRB4ZUQ01JU09SNkdBQjVTMVJaRURHMVVYVzA0MiQlQCN0PWcu&rc1b97cfb3ec644a987a4fb3c9274e47a="
};

window.TeachingForm = {
  buildUrl: function (code) {
    return TeachingFormConfig.urlPrefix + encodeURIComponent(code);
  },

  isValidCode: function (code) {
    return /^[A-HJ-NP-Z2-9]{4}$/.test(code);
  },

  normalizeCode: function (code) {
    return String(code || "").trim().toUpperCase();
  },

  isConfigured: function () {
    var prefix = TeachingFormConfig.urlPrefix || "";
    return (
      prefix.length > 0 &&
      prefix !== "PASTE_PREFILL_PREFIX_FROM_FORMS_SETUP" &&
      /^https?:\/\//i.test(prefix)
    );
  }
};
