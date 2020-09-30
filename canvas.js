module.exports = canvas = () => {
  const canvas = document.getElementById('canvas')
  const context = canvas.getContext("2d")
  const space = 8
  const gutter = 4*space

  let start 
  let width
  let height
  let columns
  let rows
  let grid = []

  const newMatrix = (rows, columns) => {
    let matrix = typeof grid !== "undefined" ? grid.slice(0,rows).map(col => col.slice(0,columns)) : [] // preserve existing elements?
    for (r=0; r<=rows; r++) {
      for (c=0; c<=columns; c++) {
        if (typeof matrix[r] === "undefined")
          matrix[r] = []
        if (typeof matrix[r][c] === "undefined")
          matrix[r][c] = { state: Math.floor(100 * Math.random()) > 90 ? true : false }
      }
    }
    return matrix
  }

  const updateWindowDimensions = () => {
    canvas.setAttribute('width', window.innerWidth - gutter)
    canvas.setAttribute('height', window.innerHeight - gutter)
    width = canvas.width
    height = canvas.height 
    columns = Math.floor((width-2*space) / space) + 1
    rows = Math.floor((height-2*space) / space) + 1
    grid = newMatrix(rows, columns)
    render()
  }

  const cellState = (r,c) => {
    const gridLength = grid.length
    const row = grid[r]
    const rowPrev = r > 0 ? grid[r-1] : grid[gridLength-1]
    const rowNext = r < gridLength ? grid[r+1] : grid[0]
    const neighbors = {
      cellMiddleLeft: c == 0 ? row[row.length-1].state : row[c-1].state,
      cellMiddleRight: c == gridLength ? row[0].state : row[c+1].state,
      cellTopLeft: c > 0 ? rowPrev[c-1].state : rowPrev[rowPrev.length-1].state,
      cellTopRight: c < rowPrev.length ? rowPrev[c+1].state : rowPrev[0].state,
      cellTopCenter: rowPrev[c].state,
      cellBottomLeft: c > 0 ? rowNext[c-1].state : rowNext[rowNext.length-1].state,
      cellBottomRight: c < rowNext.length ? rowNext[c+1].state : rowNext[0].state,
      cellBottomCenter: rowNext[c].state
    }

    let livingNeighbors = 0
    neighbors.cellMiddleLeft && livingNeighbors++
    neighbors.cellMiddleRight && livingNeighbors++
    neighbors.cellTopLeft && livingNeighbors++
    neighbors.cellTopRight && livingNeighbors++
    neighbors.cellTopCenter && livingNeighbors++  
    neighbors.cellBottomLeft && livingNeighbors++
    neighbors.cellBottomRight && livingNeighbors++
    neighbors.cellBottomCenter && livingNeighbors++
    return livingNeighbors
  }

  const updateCell = (currentCell, neighborCells) => {
    if (currentCell.state) {
      // cell is living...

      // keep cell alive
      neighborCells == 2 || neighborCells == 3 && ( currentCell.state = currentCell.state )

      // die by underpopulation
      neighborCells < 2 && ( currentCell.state = false )

      // death by overpopulation
      neighborCells > 3 && ( currentCell.state = false )
    } else {
      // cell is not not living...
      if (neighborCells == 3) {
        // life!
        currentCell.state = true
      }
    }
  }

  const draw = function(timestamp) {
    if (typeof start === "undefined")
      start = timestamp
    
    if (timestamp-start >= 120) {
      // clear screen
      context.clearRect(0,0, width, height)
      // loop through rows in the matrix (between first and last)
      for (r=1; r<grid.length; r++) {
        const row = grid[r]
        const rowLength = row.length
        // loop through columns in row (between first and last)
        for (c=1; c<rowLength; c++) {
          const currentCell = row[c]; 
          // paint first+last rows+columns black 
          if (r == 1 || r == grid.length-1 || c == 1 || c == rowLength-1) { 
            context.fillStyle = 'black'
          } else {
            const neighborCells = cellState(r,c)
            updateCell(currentCell, neighborCells)
            if (currentCell.state) {
              neighborCells == 2 ? context.fillStyle = 'green' : context.fillStyle = 'lightgreen'
            } else {
              context.fillStyle = 'black'
            }
          }
          context.fillRect(c*space, r*space, space, space)
        }
      }
      start = timestamp
    }
    render()
  }
  
  const render = () => {
    window.requestAnimationFrame(draw)
  }
  window.addEventListener('load', updateWindowDimensions)
  window.addEventListener('resize', updateWindowDimensions)
}