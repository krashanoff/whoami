/* expanded js */

$(document).ready(function(){
  $('#fronttitle').delay(100).typewrite({
    'delay': 100,
    'extra_char': '_',
    'trim': false,
    'callback': null
  });
});

$("#contactbutton").click(function(){
  $("#frontpage").fadeOut(500);
  $("#contact").delay(500).fadeIn(1500);
});

$("#textlink").click(function(){
  $("#contact").fadeOut(500);
  $("#frontpage").delay(500).fadeIn(1500);
});
