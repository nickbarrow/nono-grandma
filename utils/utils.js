import ColorThief from 'colorthief'

// Returns pixelated HTML grid
var pxl8 = async (src, size, cellOver) => {
  // Make a new 2D canvas.
  var c = document.createElement("canvas")
  // Make new Image class and set image src and crossOrigin to anon or it freaks out.
  var img = new Image()
  img.src = src
  img.crossOrigin = 'Anonymous'
  // Use .decode() so we can await the img load.
  await img.decode()
  // Get palette
  var colorThief = new ColorThief()
  var palette = colorThief.getPalette(img)
  var color = `rgb(${palette[0][0]}, ${palette[0][1]}, ${palette[0][2]})`
  // Get image dimensions and set canvas size to match.
  var w = img.width
  var h = img.height
  c.width = w
  c.height = h
  // Draw the image on the canvas for processing.
  var ctx = c.getContext('2d')
  ctx.drawImage(img, 0, 0)
  
  // Get list of all pixel data.
  var pixelArr = ctx.getImageData(0, 0, w, h).data
  var pixelSize = Math.floor(w / size)
  var boardHTML = [], solution = [];
  
  // Loop over every pixel in image and sample one pixel every {pixelSize}.
  // There are other ways to go about this, but this method is easily read/understood.
  // Where y = rows, x = cols.
  for (let y = 0; y < h; y += pixelSize) {
    var row = [], solutionRow = [];
    for (let x = 0; x < w; x += pixelSize) {
      // Multiply row by original width to get correct "col" since this isnt a proper 2d array.
      // Multiply by 4 to account for 4 color channels.
      let p = (x + (y * w)) * 4;
      // Get channels for each pixel.
      let r = pixelArr[p], g = pixelArr[p + 1], b = pixelArr[p + 2];
      // Use formula to get lightness of each pixel.
      let luma = (r*0.299 + g*0.587 + b*0.114);

      let v = (0.2126*r + 0.7152*g + 0.0722*b)
      //  >= 90) ? 'transparent' : 'white';
      
      // Light color, so background.
      // if (luma > 85) solutionRow.push(0)
      if (v >= 90) solutionRow.push(0)
      // Foreground
      else solutionRow.push(1)

      // Push a cell element to this row.
      row.push(
        <div key={`r${y}c${x}`}
          className="cell"
          // Pass over and down so we can do fun press-and-hold action.
          onMouseOver={(e) => { cellOver(e, color) }}
          onMouseDown={(e) => { cellOver(e, color) }}
          v={solutionRow[solutionRow.length - 1]}
          x={x/pixelSize} y={y/pixelSize}
          style={{ backgroundColor: v }}
          ></div>
      );
    }

    // Push our sampled pixel onto final array.
    boardHTML.push(
      <div key={`r${y}`}
        className="row">
        {row}</div>
    );
    // Push this row of values onto solution.
    solution.push(solutionRow)
  }

  return { img, boardHTML, solution }
}

// Return array of grouped hits for hints.
var groupHits = (arr) => {
  var groupedHits = [], streak = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === 1) {
      streak++;
      // Check if this is last in row so we still push.
      if (i === arr.length-1) groupedHits.push(streak)
    }
    else
      if (streak > 0) {
        groupedHits.push(streak)
        streak = 0
      }
  }

  return groupedHits
}

// Thanks Michał Perłakowski (https://stackoverflow.com/questions/7848004/get-column-from-a-two-dimensional-array)
var arrayColumn = (arr, n) => arr.map(x => x[n])

// Check if 2 arrays are equal
var arraysEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

module.exports = {
  pxl8,
  groupHits,
  arrayColumn,
  arraysEqual,
}