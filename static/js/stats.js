var chartFromGame = function(el, game, key){
  //create a chart into the el element showing the key
  // key would be batons
  // get bootstrap colors
  var attr = ''
  if (key == 'batons'){
    attr = 'listBatons'
  } else if (key == 'darts'){
    attr = 'listDarts'
  } else {
    return false
  }
  var style = getComputedStyle(document.body);
  var colors = [
    'rgb(0, 123, 255)',// primary blue
    'rgb(40, 167, 69)',// success green
    'rgb(255, 193, 7)',// warning yellow
    'rgb(220, 53, 69)',// danger red
  ]

  // create datasets
  var datasets = []
  var labelLenght = 0
  game.players.forEach((player, i) => {
    var stat = game.stats[player.name]
    var color = colors[i]
    // same color with opacity at 0.5 for background
    var backgroundColor = color.replace(')', ', 0.3)').replace('rgb', 'rgba')
    datasets.push({
      label: player.name,
      data: stat[attr],
      showLine:true,
      fill: true,
      backgroundColor: backgroundColor,
      borderColor: color,
    })
    labelLenght = Math.max(labelLenght, stat[attr].length)
  });

  var labels = Array.from(Array(labelLenght).keys(), x => (x + 1).toString())

  var config = {
    responsive: true,
    maintainAspectRatio: false,
    type: 'line',
    data:{
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: false,
      title: {
        display: true,
        text: key + ' par volée'
      },
      scales: {
        xAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Volée'
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: key
          },
          ticks:{
            stepSize:1,
            beginAtZero: true
          }
        }],
      },
      tooltips: {
        mode: 'index',
        position:'nearest',
        callbacks: {
          title: function(tooltipItems, data){
            return  key + " volée " + tooltipItems[0].label
          }
        }//callbacks
      }// tooltips
    }//options
  }//config

  var chart = new Chart(el, config);
}
