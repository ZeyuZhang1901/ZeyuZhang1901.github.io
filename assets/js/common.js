$(document).ready(function () {
  // Re-typeset math when a previously-hidden abstract becomes visible.
  function typesetAbstract($block) {
    if (!$block.length || typeof window.MathJax === "undefined") return;
    const node = $block.get(0);
    if (window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([node]).catch(function (err) {
        console.warn("MathJax typeset failed:", err);
      });
    } else if (window.MathJax.Hub) {
      window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, node]);
    }
  }

  // add toggle functionality to abstract, award and bibtex buttons
  $("a.abstract").click(function () {
    const $parent = $(this).parent().parent();
    const $abstract = $parent.find(".abstract.hidden");
    $abstract.toggleClass("open");
    $parent.find(".award.hidden.open").toggleClass("open");
    $parent.find(".bibtex.hidden.open").toggleClass("open");
    if ($abstract.hasClass("open")) {
      typesetAbstract($abstract);
    }
  });
  $("a.award").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.bibtex").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden").toggleClass("open");
  });
  $("a").removeClass("waves-effect waves-light");

  // bootstrap-toc
  if ($("#toc-sidebar").length) {
    // remove related publications years from the TOC
    $(".publications h2").each(function () {
      $(this).attr("data-toc-skip", "");
    });
    var navSelector = "#toc-sidebar";
    var $myNav = $(navSelector);
    Toc.init($myNav);
    $("body").scrollspy({
      target: navSelector,
      offset: 100,
    });
  }

  // add css to jupyter notebooks
  const cssLink = document.createElement("link");
  cssLink.href = "../css/jupyter.css";
  cssLink.rel = "stylesheet";
  cssLink.type = "text/css";

  let jupyterTheme = determineComputedTheme();

  $(".jupyter-notebook-iframe-container iframe").each(function () {
    $(this).contents().find("head").append(cssLink);

    if (jupyterTheme == "dark") {
      $(this).bind("load", function () {
        $(this).contents().find("body").attr({
          "data-jp-theme-light": "false",
          "data-jp-theme-name": "JupyterLab Dark",
        });
      });
    }
  });

  // trigger popovers
  $('[data-toggle="popover"]').popover({
    trigger: "hover",
  });
});
