function determineGiscusTheme() {
  
    let theme =
      localStorage.getItem("theme") ||
      document.documentElement.getAttribute("data-theme") ||
      "system";

    if (theme === "dark") return "preferred_color_scheme";
    if (theme === "light") return "preferred_color_scheme";

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "preferred_color_scheme" : "preferred_color_scheme";
  
}

(function setupGiscus() {
  let giscusTheme = determineGiscusTheme();

  let giscusAttributes = {
    src: "https://giscus.app/client.js",
    "data-repo": "ZeyuZhang1901/ZeyuZhang1901.github.io",
    "data-repo-id": "R_kgDOQ_P-EA",
    "data-category": "Announcements",
    "data-category-id": "DIC_kwDOQ_P-EM4C1Ygg",
    "data-mapping": "pathname",
    "data-strict": "0",
    "data-reactions-enabled": "1",
    "data-emit-metadata": "0",
    "data-input-position": "bottom",
    "data-theme": giscusTheme,
    "data-lang": "en",
    crossorigin: "anonymous",
    async: true,
  };

  let giscusScript = document.createElement("script");
  Object.entries(giscusAttributes).forEach(([key, value]) =>
    giscusScript.setAttribute(key, value)
  );
  document.getElementById("giscus_thread").appendChild(giscusScript);
})();

