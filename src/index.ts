import { flow, pipe, tuple } from "fp-ts/function";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import * as R from "fp-ts/Random";

const winWidth = window.innerWidth;
const winHeight = window.innerHeight;

const canvas = document.querySelector<HTMLCanvasElement>("#game");
canvas.width = winWidth;
canvas.height = winHeight;

const ctx = canvas.getContext("2d");
ctx.fillStyle = "rgb(100, 240, 150)";

const cellSize = 10;
const cellsX = Math.floor(winWidth / cellSize);
const cellsY = Math.floor(winHeight / cellSize);

type Cell = E.Either<"dead", "alive">;
const dead: Cell = E.left("dead");
const alive: Cell = E.right("alive");
type Coordinates = { x: number; y: number };
type World = Cell[][];

/**
 * generates array of numbers from 0 to @param max
 */
const genA = (max: number) =>
  A.unfold(0, (n) => (n < max ? O.some([n, n + 1]) : O.none));

function generateWorld(
  sizeX: number,
  sizeY: number,
  random: boolean = false
): World {
  const xs = genA(sizeX);
  const ys = genA(sizeY);
  const genCell = () =>
    random ? pipe(R.randomBool(), (r) => (r ? alive : dead)) : dead;
  return A.comprehension([xs], () => pipe(ys, A.map(genCell)));
}

const getCellAt =
  (world: World) =>
  ({ x, y }: Coordinates): O.Option<Cell> => {
    return pipe(world, A.lookup(x), O.chain(A.lookup(y)));
  };

const findNeighbors =
  (world: World) =>
  ({ x, y }: Coordinates): Cell[] => {
    return pipe(
      A.comprehension(
        [
          [-1, 0, 1],
          [-1, 0, 1],
        ],
        tuple
      ),
      A.filter(([i, j]) => !(i === 0 && j === 0)),
      A.map(([i, j]) => ({ x: x + i, y: y + j })),
      A.map(getCellAt(world)),
      A.compact,
      A.filter(E.isRight)
    );
  };

const iterateWorld = (world: World) =>
  pipe(
    world,
    A.chainWithIndex((x, c) =>
      pipe(
        c,
        A.mapWithIndex((y, cell) => ({ x, y, cell }))
      )
    )
  );

// what if fp-ts does not have the function we need?
// no problem, we can add our own:

/**
 * Flattens Either that has other Either as both left and right value
 */
 const flatten2 = <L, R>(
  e: E.Either<E.Either<L, R>, E.Either<L, R>>
): E.Either<L, R> => {
  return E.isLeft(e) ? e.left : e.right;
};

function newGeneration(world: World): World {
  let res: World = generateWorld(world.length, world[0].length);

  pipe(
    iterateWorld(world),
    A.map(({ x, y, cell }) => {
      const neighbors = findNeighbors(world)({ x, y });
      return pipe(
        cell,
        E.bimap(
          () => (neighbors.length === 3 ? alive : dead),
          () =>
            neighbors.length === 2 || neighbors.length === 3 ? alive : dead
        ),
        flatten2,
        (cell) => ({ x, y, cell })
      );
    }),
    A.reduce(res, (acc, { x, y, cell }) => {
      acc[x][y] = cell;
      return acc;
    })
  );

  return res;
}

const drawCell =
  ({ x, y }: Coordinates) =>
  (cell: Cell) => {
    pipe(
      cell,
      E.fold(
        () => ctx.clearRect(x * cellSize, y * cellSize, cellSize, cellSize),
        () => ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      )
    );
  };

const drawWorld: (world: World) => void = flow(
  iterateWorld,
  A.reduce(null, (_, { x, y, cell }) => drawCell({ x, y })(cell))
);

const random = true;
let world = generateWorld(cellsX, cellsY, random);
if (!random) {
  world[1][0] = alive;
  world[2][1] = alive;
  world[0][2] = alive;
  world[1][2] = alive;
  world[2][2] = alive;
}

drawWorld(world);

const speed = 1000;

function gameLoop(world: World) {
  drawWorld(world);
  setTimeout(() => gameLoop(newGeneration(world)), speed);
}

gameLoop(world);
