$(document).ready(function () {
  // Init Masonry
  var $grid = $(".grid").masonry({
    gutter: 10,
    horizontalOrder: true,
    itemSelector: ".grid-item",
  });
  // Layout Masonry after each image loads
  $grid.imagesLoaded().progress(function () {
    $grid.masonry("layout");
  });

  // Photo walls on the Beyond Research page
  $(".beyond-wall").each(function () {
    var $wall = $(this).masonry({
      itemSelector: ".beyond-photo",
      percentPosition: true,
      gutter: ".beyond-gutter-sizer",
      horizontalOrder: true, // keep source order left-to-right so themed clusters stay together
    });
    $wall.imagesLoaded().progress(function () {
      $wall.masonry("layout");
    });
  });
});
