import { pipe } from 'fp-ts/function'

console.log('Game of Life in TS + fp-ts!')

const winWidth = window.innerWidth
const winHeight = window.innerHeight

const canvas = document.querySelector<HTMLCanvasElement>("#game")
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

pipe(
  {x: 20, y: 20},
  ({x, y}) => drawCell(x, y),
  () => console.log('done drawing!')
)

