console.log('Game of Life in TS + fp-ts!')

const canvas = document.querySelector<HTMLCanvasElement>("#game")

const winWidth = window.innerWidth
const winHeight = window.innerHeight
canvas.width = winWidth
canvas.height = winHeight

const ctx = canvas.getContext("2d")
ctx.fillStyle = "rgb(100, 240, 150)"

const cellSize = 10
const cellsY = winWidth / cellSize
const cellsX = winHeight / cellSize

function drawCell(x: number, y: number) {
  ctx.fillRect(x, y, cellSize, cellSize)
}

drawCell(20, 20)
