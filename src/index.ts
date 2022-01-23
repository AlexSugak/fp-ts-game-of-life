import { pipe } from 'fp-ts/function'
import * as A from 'fp-ts/Array'
import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/Either'
import * as R from 'fp-ts/Random'

console.log('Game of Life in TS + fp-ts!')

const winWidth = window.innerWidth
const winHeight = window.innerHeight

const canvas = document.querySelector<HTMLCanvasElement>("#game")
canvas.width = winWidth
canvas.height = winHeight

const ctx = canvas.getContext("2d")
ctx.fillStyle = "rgb(100, 240, 150)"

const cellSize = 10
const cellsY = Math.floor(winWidth / cellSize)
const cellsX = Math.floor(winHeight / cellSize)

type Cell = E.Either<'dead', 'alive'>
const dead: Cell = E.left('dead')
const alive: Cell = E.right('alive')
type Coordinates = {x: number, y: number}
type World = Cell[][]

function generateWorld(sizeX: number, sizeY: number, random: boolean = false): World {
  let world: World = []

  for(let i=0;i<sizeX;i++) {
    const col = []
    for(let j=0; j<sizeY; j++) {
      const cell = random 
      ? pipe(
          R.randomBool(),
          r => r ? alive : dead
        ) 
      : dead

      col.push(cell)
    }
    world.push(col)
  }

  return world
}

const getCellAt = (world: World) => ({x, y}: Coordinates): O.Option<Cell> => {
  return pipe(
    world,
    A.lookup(x),
    O.chain(A.lookup(y))
  )
}

const findNeighbors = (world: World) => ({x, y}: Coordinates): Cell[] => {
  const neighborCoords: Coordinates[] = []
    for (let i of [-1, 0, 1]) {
      for (let j of [-1, 0, 1]){
        if(!(i === 0 && j === 0)) {
          neighborCoords.push({x: x + i, y: y + j})
        }
      }
    }

  return pipe(
    neighborCoords,
    A.map(getCellAt(world)),
    A.compact,
    A.filter(E.isRight)
  )
}

// what if fp-ts does not have the function we need?
// no problem, we can add our own:

const flatten2 = <L, R>(e: E.Either<E.Either<L, R>, E.Either<L, R>>): E.Either<L, R> => {
  return E.isLeft(e) ? e.left : e.right
}

const map2 = <L, R, A, B>(onLeft: (left: L) => A, onRight: (right: R) => B) => (e: E.Either<L, R>): E.Either<A, B> => {
  return E.isLeft(e) ? E.left(onLeft(e.left)) : E.right(onRight(e.right))
}

function newGeneration(world: World): World {
  let res: World = generateWorld(world.length, world[0].length)

  for(let i = 0; i < world.length; i ++) {
    for(let j = 0; j < world[i].length; j ++) {
      const neighbors = findNeighbors(world)({x: i, y: j})

      const newCell: Cell = pipe(
        world[i][j],
        map2(
          () => neighbors.length === 3 ? alive : dead,
          () => neighbors.length === 2 || neighbors.length === 3 ? alive : dead,
        ),
        flatten2
      )

      res[i][j] = newCell
    }
  }

  return res
}

const drawCell = ({x, y}: Coordinates) => (cell: Cell) => {
  pipe(
    cell,
    E.fold(
      () => ctx.clearRect(x * cellSize, y * cellSize, cellSize, cellSize),
      () => ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
    )
  )
}

function drawWorld(world: World) {
  for(let i = 0; i < world.length; i ++) {
    for(let j = 0; j < world[i].length; j ++) {
      drawCell({x: i, y: j})(world[i][j])
    }
  }
}

console.log('world size', {cellsX, cellsY, total: cellsX * cellsY})
let world = generateWorld(cellsX, cellsY, true)
world[1][0] = alive
world[2][1] = alive
world[0][2] = alive
world[1][2] = alive
world[2][2] = alive

drawWorld(world)

const speed = 1000

function gameLoop(world: World){
  drawWorld(world)
  setTimeout(() => gameLoop(newGeneration(world)), speed)
}

gameLoop(world)
