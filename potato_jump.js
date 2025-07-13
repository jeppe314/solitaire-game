const game = document.getElementById('game');

const width = 500;
const height = 500;

const board = [
  [-1, -1, 1, 1, 1, -1, -1],
  [-1, -1, 1, 1, 1, -1, -1],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 0, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [-1, -1, 1, 1, 1, -1, -1],
  [-1, -1, 1, 1, 1, -1, -1],
];

let validMoves = [];

let draggedCell = null;

function handleMouseDown(event) {
  const targetCell = event.target;
  const { col, row } = targetCell.dataset;

  const previewMoves = calcValidMoves(col, row);

  clearTempClasses();

  previewMoves.forEach((move) => {
    const cell = document.getElementById(`cell-${move.row}-${move.col}`);
    if (cell) {
      cell.classList.add('target-valid');
    }
  });
}

function handleMouseUp(event) {
  // make sure valid moves are cleared
  clearTempClasses();
}

function handleDragStart(event) {
  // reset
  draggedCell = null;
  validMoves = [];

  const targetCell = event.target;

  const { col, row } = targetCell.dataset;

  // set global draggedCell variable
  draggedCell = { col: parseInt(col), row: parseInt(row), id: event.target.id };

  const rect = event.target.getBoundingClientRect();
  const offsetX = rect.width / 2;
  const offsetY = rect.height / 2;

  event.dataTransfer.setDragImage(event.target, offsetX, offsetY);

  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.dropEffect = 'move';
}

function handleDragOver(event) {
  event.preventDefault();

  const targetCell = event.target;

  // if still hovering the same cell, do nothing
  if (targetCell.classList.contains('target-valid-hover')) return;
  if (!targetCell.classList.contains('target-valid')) return;

  const targetData = event.target.dataset;

  const targetRow = parseInt(targetData.row);
  const targetCol = parseInt(targetData.col);

  const { row, col } = draggedCell;

  targetCell.classList.add('target-valid-hover');

  if (isValidMove(row, col, targetRow, targetCol)) {
    const middlePotato = getMiddlePotato(row, col, targetRow, targetCol);
    middlePotato.classList.add('middle-potato');
  }
}

function handleDragLeave(event) {
  const targetCell = event.target;
  targetCell.classList.remove('target-valid-hover');
  // remove middle potato class if it exists
  const middlePotato = document.querySelector('.middle-potato');
  if (middlePotato) {
    middlePotato.classList.remove('middle-potato');
  }
}
function handleDrop(event) {
  event.preventDefault();

  const targetCell = event.target;
  // remove class from all previously hovered cells
  if (!targetCell.classList.contains('target-valid-hover')) {
    clearTempClasses();
    return;
  }
  clearTempClasses();

  const { row, col, id } = draggedCell;

  const targetRow = parseInt(targetCell.dataset.row);
  const targetCol = parseInt(targetCell.dataset.col);

  if (row === targetRow) {
    if (targetCol < col) {
      removePotato(targetRow, targetCol + 1);
    } else {
      removePotato(targetRow, targetCol - 1);
    }
  } else {
    if (targetRow < row) {
      removePotato(targetRow + 1, targetCol);
    } else {
      removePotato(targetRow - 1, targetCol);
    }
  }
  movePotato(row, col, targetRow, targetCol);

  const droppedCell = document.getElementById(id);
  droppedCell.classList.remove('potato');

  renderBoard();
}

function removePotato(row, col) {
  // remove potato from the board
  if (board[row][col] === 1) {
    board[row][col] = 0; // set cell to empty
  }
}

function addPotato(row, col) {
  // add potato to the board
  if (board[row][col] === 0) {
    board[row][col] = 1; // set cell to potato
  }
}

function movePotato(row, col, targetRow, targetCol) {
  addPotato(targetRow, targetCol);
  removePotato(row, col);
}

function clearTempClasses() {
  // remove target-valid class from all cells
  document.querySelectorAll('.target-valid').forEach((el) => {
    el.classList.remove('target-valid');
    el.classList.remove('target-valid-hover');
  });

  // clear middle potato class
  document.querySelectorAll('.middle-potato').forEach((el) => {
    el.classList.remove('middle-potato');
  });
}

function getMiddlePotato(row, col, targetRow, targetCol) {
  // get the middle potato between the two cells
  const midRow = (row + targetRow) / 2;
  const midCol = (col + targetCol) / 2;

  return document.getElementById(`cell-${midRow}-${midCol}`);
}

function calcValidMoves(col, row) {
  const moves = [];
  const directions = [
    { dRow: -2, dCol: 0 },
    { dRow: 2, dCol: 0 },
    { dRow: 0, dCol: -2 },
    { dRow: 0, dCol: 2 },
  ];

  for (const { dRow, dCol } of directions) {
    const newRow = parseInt(row) + dRow;
    const newCol = parseInt(col) + dCol;
    const midRow = parseInt(row) + dRow / 2;
    const midCol = parseInt(col) + dCol / 2;

    if (
      inBounds(newRow, newCol) &&
      inBounds(midRow, midCol) &&
      board[newRow][newCol] === 0 &&
      board[midRow][midCol] === 1
    ) {
      moves.push({ row: newRow, col: newCol });
    }
  }
  return moves;
}

function isValidMove(cellRow, cellCol, targetRow, targetCol) {
  const midRow = (cellRow + targetRow) / 2;
  const midCol = (cellCol + targetCol) / 2;
  return (
    inBounds(targetRow, targetCol) &&
    inBounds(midRow, midCol) &&
    board[targetRow][targetCol] === 0 &&
    board[midRow][midCol] === 1
  );
}

function potatoHasValidMoves(row, col) {
  return [
    { dRow: -2, dCol: 0 },
    { dRow: 2, dCol: 0 },
    { dRow: 0, dCol: -2 },
    { dRow: 0, dCol: 2 },
  ].some(({ dRow, dCol }) => {
    const newRow = row + dRow;
    const newCol = col + dCol;
    const midRow = row + dRow / 2;
    const midCol = col + dCol / 2;
    return (
      inBounds(newRow, newCol) && inBounds(midRow, midCol) && board[newRow][newCol] === 0 && board[midRow][midCol] === 1
    );
  });
}

function countValidMoves() {
  let count = 0;
  board.forEach((row, rowIndex) =>
    row.forEach((cell, colIndex) => {
      if (cell === 1 && potatoHasValidMoves(rowIndex, colIndex)) count++;
    }),
  );
  return count;
}

function countPotatoes() {
  return board.flat().filter((cell) => cell === 1).length;
}

async function renderBoard() {
  // reset board
  game.innerHTML = '';

  const rows = board.length;
  const cols = board[0].length;

  game.style.display = 'grid';
  game.style.gap = '1px';
  game.style.width = width + 'px';
  game.style.height = height + 'px';
  game.style.aspectRatio = `${cols} / ${rows}`;
  game.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  game.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  board.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      const cellValue = board[rowIndex][cellIndex];
      const cellDiv = document.createElement('div');
      cellValue !== -1 && cellDiv.classList.add('cell');
      cellDiv.id = `cell-${rowIndex}-${cellIndex}`;
      cellDiv.dataset.row = rowIndex;
      cellDiv.dataset.col = cellIndex;

      if (cell === 1) {
        cellDiv.classList.add('potato');
        cellDiv.addEventListener('dragstart', handleDragStart);
        cellDiv.addEventListener('mousedown', handleMouseDown);
        cellDiv.addEventListener('mouseup', handleMouseUp);
        if (potatoHasValidMoves(rowIndex, cellIndex) && cellDiv.classList.contains('potato')) {
          cellDiv.setAttribute('draggable', 'true');
          cellDiv.classList.add('has-valid-moves');
        }
      }

      cellDiv.addEventListener('dragover', handleDragOver);
      cellDiv.addEventListener('drop', handleDrop);
      cellDiv.addEventListener('dragleave', handleDragLeave);

      game.appendChild(cellDiv);
    });
  });

  if (!countValidMoves()) {
    await sleep(0.2);
    addGameOverTextElement();
  }
}

function addGameOverTextElement() {
  const gameOverText = document.createElement('h3');
  gameOverText.classList.add('game-over-text');

  const potatoesLeft = countPotatoes();
  const text =
    potatoesLeft === 1
      ? 'You have won! You have 1 potato left.'
      : `Game Over! You have ${potatoesLeft} potato${potatoesLeft !== 1 ? 'es' : ''} left.`;

  gameOverText.textContent = text;

  const container = document.querySelector('.container');
  container.appendChild(gameOverText);
}

function inBounds(row, col) {
  return row >= 0 && row < board.length && col >= 0 && col < board[0].length;
}

function sleep(seconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}

renderBoard();
