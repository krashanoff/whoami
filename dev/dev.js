/* expanded js */

$(document).ready(function(){
  var rand = Math.random()*10;
  var fadeTime = 2000;

  if(rand < 2.5) {
    $(".first").fadeIn(fadeTime);
  } else if (rand < 5) {
    $(".second").fadeIn(fadeTime);
  } else if (rand < 7.5) {
    $(".third").fadeIn(fadeTime);
  } else {
    $(".fourth").fadeIn(fadeTime);
  }

  particlesJS("particles-js", {
    "particles": {
      "number": {
        "value": 20,
        "density": {
          "enable": true,
          "value_area": 800
        }
      },
      "color": {
        "value": "#fff"
      },
      "shape": {
        "type": "circle",
        "stroke": {
          "width": 0,
          "color": "#000"
        },
        "polygon": {
          "nb_sides": 5
        },
      },
      "opacity": {
        "value": 0.75,
        "random": false,
        "anim": {
          "enable": false
        }
      },
      "size": {
        "value": 3,
        "random": true,
        "anim": {
          "enable": false
        }
      },
      "line_linked": {
        "enable": true,
        "distance": 150,
        "color": "#fff",
        "opacity": 0.4,
        "width": 1
      },
      "move": {
        "enable": true,
        "speed": 1.5,
        "direction": "none",
        "random": false,
        "straight": false,
        "out_mode": "out",
        "bounce": false,
        "attract": {
          "enable": false
        }
      }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": {
          "enable": false
        },
        "onclick": {
          "enable": false
        },
        "resize": true
      },
      "modes": {
      }
    },
    "retina_detect": true
  });
});

$("#contactbutton").click(function(){
  $("#frontpage, #buttons").fadeOut(500);
  $("#contact").delay(500).fadeIn(1500);
});

$("#backlink").click(function(){
  $("#contact").fadeOut(500);
  $("#frontpage, #buttons").delay(500).fadeIn(1500);
});
