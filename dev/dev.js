/* expanded js */

$("#contactbutton").click(function(){
  $("#frontpage").fadeOut(500);
  $("#contact").delay(500).fadeIn(1500);
});

$("#textlink").click(function(){
  $("#contact").fadeOut(500);
  $("#frontpage").delay(500).fadeIn(1500);
});

/* Chart stuff
var ctx = $("#myChart");

var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3]
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});
*/
