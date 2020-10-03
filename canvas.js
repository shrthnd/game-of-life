const canvas = () => {
  const canvas = document.getElementById('canvas')
  const context = canvas.getContext("2d")
  const space = 12
  const gutter = 2 * space
  const probabilityOfLife = .2
  
  let start 
  let paused
  let width
  let height
  let columns
  let rows
  let grid = []
  
  const coord = (x, y) => { return { x, y } }

  const coinFlip = () => {
    return Math.floor(Math.random()*2)
  }

  const schroedingersBox = () => {
    return Math.random() < probabilityOfLife
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
  
  const handleKeypress = () => {
    paused = !paused
  }

  const matrix = (rows, columns) => {
    let matrix = grid.length ? grid.slice(0,rows).map(col => col.slice(0,columns)) : [] // preserve existing elements?
    for (r=0; r<=rows+1; r++) {
      for (c=0; c<=columns+1; c++) {
        if (typeof matrix[r] === "undefined")
          matrix[r] = []
        if (typeof matrix[r][c] === "undefined")
          matrix[r][c] = { 
            state: schroedingersBox(),
            nextState: false
          }
      }
    }
    return matrix
  }

  const cellState = (r,c) => {
    const gridLength = grid.length
    const row = grid[r]
    const rowPrev = r > 0 ? grid[r-1] : grid[gridLength-1]
    const rowNext = r < gridLength-1 ? grid[r+1] : grid[0]

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
    if (!paused && typeof currentCell !== "undefined" ) {
      // cell is living...
      if (currentCell.state) {
        // keep cell alive
        neighborCells == 2 || neighborCells == 3 ? currentCell.nextState = true : null

        // die by underpopulation
        neighborCells < 2 ? currentCell.nextState = false : null

        // death by overpopulation
        neighborCells > 3 ? currentCell.nextState = false : null
        
      } else if (neighborCells == 3) {
        // life!
        currentCell.nextState = true
      }
    }
    
    // highlight living cells
    if (typeof currentCell !== "undefined" && currentCell.state) {
      neighborCells == 2 ? context.fillStyle = 'violet' : context.fillStyle = 'purple'
    } else {
      context.fillStyle = coinFlip() ? '#000' : '#222'
    }

    // assign border color (border cells retain state)
    if (r == 0 || r == grid.length-1 || c == 0 || c == grid[0].length-1) 
      context.fillStyle = 'lightgreen'  
      
    context.fillRect(c*space, r*space, space, space)
  }

  const paintBrush = () => {
    const brushPos = coord(brush.position.x*space, brush.position.y*space)
    if (brush.state.mousedown) {
      context.fillStyle = 'lime'
    } else {
      context.fillStyle = 'yellow'
    }
    if (brush.position.y < grid.length && brush.position.x < grid[0].length) {
      context.fillRect(
        brushPos.x,
        brushPos.y,
        space, 
        space
      )
    }
  }
  
  const draw = (timestamp) => {
    if (typeof start === "undefined") 
      start = timestamp
    
    if (timestamp-start >= 100/60) {
      // clear screen
      context.clearRect(0,0, width, height)
      
      // loop through rows in the matrix (between first and last)   
      for (r=0; r<grid.length; r++) {
        const row = grid[r]

        // loop through columns in row (between first and last)
        for (c=0; c<row.length; c++) {
          const currentCell = row[c]; 
          const neighborCells = cellState(r,c)

          // calculate state of cell in next iteration
          updateCell(currentCell, neighborCells)
        }
      }

      // update cell state
      for (r=0; r<grid.length; r++) {
        const row = grid[r]
        for (c=0; c<row.length; c++) {
          const currentCell = row[c]; 
          currentCell.state = currentCell.nextState
        }
      }

      // handle mouse activity
      brush.state.mousedown && 
        ( brush.position.y > 0 && brush.position.y < grid.length ) && 
        ( brush.position.x > 0 && brush.position.x < grid[0].length ) &&
        ( grid[brush.position.y][brush.position.x].nextState = true )
      
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
    window.addEventListener('keydown', handleKeypress)
    canvas.addEventListener('mousemove', handleMouseOver)
  }

  run() 
}

module.exports = canvas