const rawTimesLines = rawTimes.split('\n').reverse();

const times = rawTimes.split(";").filter((str, index) => (index - 1) % 7 == 0).reverse().map(time => {
  let newTime = Number(time.slice(0, 2) + time.slice(3, 5) + time.slice(6)); // now in ms
  if (newTime > 100000) newTime -= 40000; // fix over a minute
  return newTime;
});

let index = 0;
let solveCount = 0;
const maxSeconds = 30
const divisionsPerSec = 10;
const pbElement = document.getElementById('pb');
let pb = 999999;
const ao100Element = document.getElementById('ao100');
let ao100 = 0;
const dateElement = document.getElementById('date');
let date = '';
let x = [0];
let y = Array(maxSeconds * divisionsPerSec).fill(0)
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

while (x[x.length - 1] < maxSeconds * divisionsPerSec) {
  x.push(x[x.length - 1] + 1);
}
x = x.map(n => n / divisionsPerSec);

Plotly.newPlot("graph", [
  {
    x: x,
    y: y,
    type: "bar",
  },
], {
  xaxis: {
    title: {
      text: 'time (s)',
      font: {
        family: 'Times New Roman, Times, serif',
        size: 18
      }
    },
    type: 'linear',
    range: [0, maxSeconds]
  },
  yaxis: {
    title: {
      text: 'number of solves',
      font: {
        family: 'Times New Roman, Times, serif',
        size: 18
      }
    },
    type: 'linear',
    range: [0, 650]
  }
});

function updateSidebar(newTimes) {
  minOfTimes = Math.min(...newTimes);
  if (minOfTimes < pb) {
    pb = minOfTimes;
    pbElement.textContent = msToDecimal(pb);
  }

  meanOfTimes = Math.round((newTimes.reduce((a, b) => a + b)) / newTimes.length);
  ao100Element.textContent = msToDecimal(meanOfTimes);

  rawDate = rawTimesLines[solveCount].split(';')[3];
  year = rawDate.slice(0, 4);
  month = monthNames[rawDate.slice(5, 7) - 1];
  dateElement.textContent = `${month} ${year}`;
}

// ex 10359 to '10.359'
function msToDecimal(time) {
  str = time.toString();
  const decimalIndex = str.length - 3;
  str = str.slice(0, decimalIndex) + '.' + str.slice(decimalIndex);
  return str;
}

// adds num many new times to the data set
function newData(num) {
  solveCount += num;
  const newTimes = times.slice(index, index + num)
  updateSidebar(newTimes);
  newTimes.map(time => {
    const newTime = parseInt(time / (1000 / divisionsPerSec)) / divisionsPerSec; // rounds it to every 0.2
    return newTime;
  }).forEach(time => {
    if (x.indexOf(time) != -1) y[x.indexOf(time)] += 1;
  });
  return [{ x: x, y: y }];
}

function update() {
  console.log(solveCount);
  const data = newData(100);

  Plotly.animate(
    "graph",
    {
      data: data, // add 100 new times next frame
    },
    {
      transition: {
        duration: 100, // update 10 times a second
      },
      frame: {
        duration: 100,
        redraw: false,
      },
    }
  );

  index += 100;
  if (index > times.length) return;
  setTimeout(update, 100);
}

update();
