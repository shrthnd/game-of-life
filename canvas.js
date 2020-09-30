const canvas = () => {
  const canvas = document.getElementById('canvas')
  const context = canvas.getContext("2d")
  const space = 10
  const gutter = 2 * space
  const probabilityOfLife = .15
  
  let start 
  let width
  let height
  let columns
  let rows
  let grid = []
  
  const coord = (x, y) => { return { x, y } }

  const coinFlip = () => {
    return Math.floor(Math.random()*2) - 1
  }

  const schroedingersBox = () => {
    return Math.random() < probabilityOfLife ? true : false
  }

  const brush = {
    size: coord(space,space),
    position: false,
    state: {
      mousedown: false
    }
  }

  const handleMouseDown = () => {
    brush.state.mousedown = true
  }
  
  const handleMouseUp = () => {
    brush.state.mousedown = false
  }

  const handleMouseOver = (e) => {
    // convert to cell position 
    brush.position = coord(Math.floor(e.clientX/space)-1, Math.floor(e.clientY/space)-2) 
  }

  const handleMouseLeave = () => {
    brush.position = false
  }

  const handleMouseEnter = (e) => {
    brush.position = coord(Math.floor(e.clientX/space)-1, Math.floor(e.clientY/space)-2) 
  }
  
  const matrix = (rows, columns) => {
    let matrix = grid.length ? grid.slice(0,rows).map(col => col.slice(0,columns)) : [] // preserve existing elements?
    for (r=0; r<=rows+1; r++) {
      for (c=0; c<=columns+1; c++) {
        if (typeof matrix[r] === "undefined")
          matrix[r] = []
        if (typeof matrix[r][c] === "undefined")
          matrix[r][c] = { state: schroedingersBox() }
      }
    }
    return matrix
  }

  const cellState = (r,c) => {
    const gridLength = grid.length
    const row = grid[r]
    const rowPrev = r > 0 ? grid[r-1] : grid[gridLength-1]
    const rowNext = r < gridLength-1 ? grid[r+1] : grid[0]
    // todo: add logic for wrapping bottom-left to top-right cell, etc...
    const neighbors = {
      cellMiddleLeft: c == 0 ? row[row.length-1].state : row[c-1].state,
      cellMiddleRight: c >= gridLength ? row[0].state : typeof row[c+1] !== "undefined" ? row[c+1].state : false,
      cellTopLeft: c > 0 ? rowPrev[c-1].state : rowPrev[rowPrev.length-1].state,
      cellTopRight: c < rowPrev.length-1 ? rowPrev[c+1].state : rowPrev[0].state,
      cellTopCenter: typeof rowPrev[c] !== "undefined" ? rowPrev[c].state : false,
      cellBottomLeft: c > 0 ? rowNext[c-1].state : rowNext[rowNext.length-1].state,
      cellBottomRight: c < rowNext.length-1 ? rowNext[c+1].state : rowNext[0].state,
      cellBottomCenter: typeof rowNext[c] !== "undefined" ? rowNext[c].state : false
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
    if (typeof currentCell !== "undefined" ) {
      // cell is living...
      if (currentCell.state) {
        // keep cell alive
        neighborCells == 2 || neighborCells == 3 && ( currentCell.state = currentCell.state )

        // die by underpopulation
        neighborCells < 2 && ( currentCell.state = false )

        // death by overpopulation
        neighborCells > 3 && ( currentCell.state = false )
        
      } else if (neighborCells == 3) {
        // migration!
        currentCell.state = true
      }
    }
  }

  const paintBrush = () => {
    const brushPos = coord(brush.position.x*space, brush.position.y*space)
    if (brush.state.mousedown) {
      context.fillStyle = 'lime'
    } else {
      context.fillStyle = 'yellow'
    }
    context.fillRect(
      brushPos.x,
      brushPos.y,
      space, 
      space
    )
  }
  
  const draw = (timestamp) => {
    if (typeof start === "undefined")
      start = timestamp
    
    if (timestamp-start >= 150) {
      // clear screen
      context.clearRect(0,0, width, height)
      // loop through rows in the matrix (between first and last)
      for (r=0; r<grid.length; r++) {
        const row = grid[r]
        const rowLength = row.length

        // loop through columns in row (between first and last)
        for (c=0; c<rowLength; c++) {
          const currentCell = row[c]; 
          // flip state on mousedown
          if (brush.state.mousedown) {
            grid[brush.position.y][brush.position.x].state = !grid[brush.position.y][brush.position.x].state
            // grid[brush.position.y-2][brush.position.x-2].state = true
          }
          const neighborCells = cellState(r,c)
          updateCell(currentCell, neighborCells)

          if (typeof currentCell !== "undefined" && currentCell.state) {
            neighborCells == 2 ? context.fillStyle = 'purple' : context.fillStyle = 'violet'
          } else {
            // context.fillStyle = 'black'
            context.fillStyle = coinFlip() ? '#000' : '#111'
          }

          if (r == 0 || r == grid.length-1 || c == 0 || c == rowLength-1) 
            context.fillStyle = 'lightgreen'  

          context.fillRect(c*space, r*space, space, space)
        }
      }
      paintBrush()
      start = timestamp
    }
    render()
  }
  
  const render = () => {
    window.requestAnimationFrame(draw)
  }
  
  const updateWindowDimensions = () => {
    canvas.setAttribute('width', window.innerWidth - gutter)
    canvas.setAttribute('height', window.innerHeight - gutter)
    width = canvas.width
    height = canvas.height 
    columns = Math.floor((width-2*space) / space)
    rows = Math.floor((height-2*space) / space)
    grid = matrix(rows, columns)
    render()
  }

  const run = () => {
    window.addEventListener('load', updateWindowDimensions)
    window.addEventListener('resize', updateWindowDimensions)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mousemove', handleMouseOver)
  }

  run() 
}

module.exports = canvas