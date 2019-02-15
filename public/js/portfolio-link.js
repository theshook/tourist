$(document).ready(function () {
  $(".portfolio-link").mouseover(function () {
    var val = 1.1;
    $("#ef1").css({
      '-webkit-transform': 'scale(' + val + ')',
      '-moz-transform': 'scale(' + val + ')',
      '-ms-transform': 'scale(' + val + ')',
      '-o-transform': 'scale(' + val + ')',
      'transform': 'scale(' + val + ')'
    });
  });

  $(".portfolio-link").mouseleave(function () {
    var val = 1;
    $("#ef1").css({
      '-webkit-transform': 'scale(' + val + ')',
      '-moz-transform': 'scale(' + val + ')',
      '-ms-transform': 'scale(' + val + ')',
      '-o-transform': 'scale(' + val + ')',
      'transform': 'scale(' + val + ')'
    });
  });
});