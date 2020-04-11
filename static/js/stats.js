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
  console.log(attr)
  var style = getComputedStyle(document.body);
  var colors = [
    style.getPropertyValue('--primary'),
    style.getPropertyValue('--secondary'),
    style.getPropertyValue('--warning'),
    style.getPropertyValue('--danger'),
  ]

  // create datasets
  var datasets = []
  var labelLenght = 0
  game.players.forEach((player, i) => {
    var stat = game.stats[player.name]
    console.log(stat)
    var color = colors[i]
    datasets.push({
      label: player.name,
      data: stat[attr],
      showLine:true,
      fill: false,
      backgroundColor: color,
      borderColor: color,
    })
    labelLenght = Math.max(labelLenght, stat[attr].length)
  });

  var labels = Array.from(Array(labelLenght).keys(), x => (x + 1).toString())

  var config = {
    responsive: true,
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
        }]
      }
    }
  }

  var chart = new Chart(el, config);
}
