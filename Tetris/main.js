document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".grid");
  let squares = Array.from(document.querySelectorAll(".grid div"));
  const scoreLabel = document.querySelector("#score");
  const startBtn = document.querySelector("#start-button");
  const width = 10;
  let nextRandom = 0;
  let timeId;
  let score = 0;
  let _xStart = 0;
  let _xEnd = 0;
  let _yStart = 0;
  let _yEnd = 0;
  let canTouch = true;

  // const colors = ["orange", "red", "purple", "green", "blue"];
  const colors = [
    " url(./img/bricks/brickYellow.png)",
    " url(./img/bricks/brickBlue.png)",
    " url(./img/bricks/brickRed.png)",
    " url(./img/bricks/brickGreen.png)",
    " url(./img/bricks/brickPurple.png)",
  ];

  //The Tetrominoes
  const lTetrominoes = [
    [1, width + 1, width * 2 + 1, 2],
    [width, width + 1, width + 2, width * 2 + 2],
    [1, width + 1, width * 2 + 1, width * 2],
    [width, width * 2, width * 2 + 1, width * 2 + 2],
  ];

  const zTetromino = [
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
  ];

  const tTetromino = [
    [1, width, width + 1, width + 2],
    [1, width + 1, width + 2, width * 2 + 1],
    [width, width + 1, width + 2, width * 2 + 1],
    [1, width, width + 1, width * 2 + 1],
  ];

  const oTetromino = [
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
  ];

  const iTetromino = [
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
  ];
  const theTetrominoes = [lTetrominoes, zTetromino, tTetromino, oTetromino, iTetromino];
  let currentPosition = 4;
  let currentRotation = 0;
  //randomly select a Tetromino and its first rotation
  let random = Math.floor(Math.random() * theTetrominoes.length);
  let current = theTetrominoes[random][currentRotation];

  //draw the Tetrominoes
  function draw() {
    current.forEach((index) => {
      squares[currentPosition + index].classList.add("tetromino");
      squares[currentPosition + index].style.backgroundImage = colors[random];
    });
  }

  //undraw the Tetrominoes
  function undraw() {
    current.forEach((index) => {
      squares[currentPosition + index].classList.remove("tetromino");
      squares[currentPosition + index].style.backgroundImage = "";
    });
  }
  //make the terominoes move every second
  // timeId = setInterval(moveDown, 500);
  //assign functions to keycode
  function control(e) {
    if (e.keyCode === 37) {
      moveLeft();
    } else if (e.keyCode === 38) {
      rotate();
    } else if (e.keyCode === 39) {
      moveRight();
    } else if (e.keyCode === 40) {
      moveDown();
    }
  }
  document.addEventListener("keydown", control);
  document.addEventListener("touchstart", touchStart);
  document.addEventListener("touchend", touchEnd);

  function touchStart(e) {
    _xStart = e.getLocationX();
    _yStart = e.getLocationY();
  }
  function touchEnd(e) {
    _xEnd = e.getLocationX();
    _yEnd = e.getLocationY();
    touchMove();
  }

  function touchMove() {
    if (!canTouch) return;

    if (_xStart != null && _yStart != null && _xEnd != null && _yEnd != null) {
      if (Math.abs(_xEnd - _xStart) > Math.abs(_yEnd - _yStart)) {
        if (_xEnd > _xStart) {
          moveRight();
        } else {
          moveLeft();
        }
      } else {
        if (_yEnd > _yStart) {
          rotate();
        } else {
          moveDown();
        }
      }
    }
    // else cc.error("ERROR!!!");
  }
  //move down function
  function moveDown() {
    undraw();
    currentPosition += width;
    draw();
    freeze();
  }

  function freeze() {
    if (current.some((index) => squares[currentPosition + index + width].classList.contains("taken"))) {
      current.forEach((index) => {
        squares[currentPosition + index].classList.add("taken");
      });
      //start a new tetromino falling
      random = nextRandom;
      nextRandom = Math.floor(Math.random() * theTetrominoes.length);
      current = theTetrominoes[random][currentRotation];
      currentPosition = 4;
      draw();
      displayShape();
      addScore();
      gameOver();
    }
  }
  function moveLeft() {
    undraw();
    const isAtLeftWall = current.some((index) => (currentPosition + index) % width === 0);
    if (!isAtLeftWall) currentPosition -= 1;
    if (current.some((index) => squares[currentPosition + index].classList.contains("taken"))) {
      currentPosition += 1;
    }
    draw();
  }
  function moveRight() {
    undraw();
    const isAtRightWall = current.some((index) => (currentPosition + index) % width === width - 1);
    if (!isAtRightWall) currentPosition += 1;
    if (current.some((index) => squares[currentPosition + index].classList.contains("taken"))) {
      currentPosition -= 1;
    }
    draw();
  }
  ///FIX ROTATION OF TETROMINOS A THE EDGE
  function isAtRight() {
    return current.some((index) => (currentPosition + index + 1) % width === 0);
  }

  function isAtLeft() {
    return current.some((index) => (currentPosition + index) % width === 0);
  }

  function checkRotatedPosition(P) {
    P = P || currentPosition; //get current position.  Then, check if the piece is near the left side.
    if ((P + 1) % width < 4) {
      //add 1 because the position index can be 1 less than where the piece is (with how they are indexed).
      if (isAtRight()) {
        //use actual position to check if it's flipped over to right side
        currentPosition += 1; //if so, add one to wrap it back around
        checkRotatedPosition(P); //check again.  Pass position from start, since long block might need to move more.
      }
    } else if (P % width > 5) {
      if (isAtLeft()) {
        currentPosition -= 1;
        checkRotatedPosition(P);
      }
    }
  }
  //rotate the tetromino
  function rotate() {
    undraw();
    currentRotation++;
    if (currentRotation === current.length) {
      //if the current rotation gets to 4, make it back to 0
      currentRotation = 0;
    }
    current = theTetrominoes[random][currentRotation];
    checkRotatedPosition();
    draw();
  }
  //show up-next tetromino in mini-grid display
  const displaySquares = document.querySelectorAll(".mini-grid div");
  const displayWidth = 4;
  const displayIndex = 0;

  //the Tetromino without rotations
  const upNextTetrominoes = [
    [1, displayWidth + 1, displayWidth * 2 + 1, 2], //lTetromino
    [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], //zTetromino
    [1, displayWidth, displayWidth + 1, displayWidth + 2], //tTetromino
    [0, 1, displayWidth, displayWidth + 1], //oTetromino
    [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1], //iTetromino
  ];
  function displayShape() {
    //remove any trace of a tetromino form the entire grid
    displaySquares.forEach((square) => {
      square.classList.remove("tetromino");
      square.style.backgroundImage = "";
    });
    upNextTetrominoes[nextRandom].forEach((index) => {
      displaySquares[displayIndex + index].classList.add("tetromino");
      displaySquares[displayIndex + index].style.backgroundImage = colors[nextRandom];
    });
  }

  startBtn.addEventListener("click", () => {
    if (timeId) {
      clearInterval(timeId);
      timeId = null;
    } else {
      draw();
      timeId = setInterval(moveDown, 500);
      nextRandom = Math.floor(Math.random() * theTetrominoes.length);
      displayShape();
    }
  });

  //score
  function addScore() {
    for (let i = 0; i < 199; i += width) {
      const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9];

      if (row.every((index) => squares[index].classList.contains("taken"))) {
        score += 10;
        scoreLabel.innerHTML = score;
        row.forEach((index) => {
          squares[index].classList.remove("taken");
          squares[index].classList.remove("tetromino");
          squares[index].style.backgroundImage = "";
        });
        const squaresRemoved = squares.splice(i, width);
        squares = squaresRemoved.concat(squares);
        squares.forEach((cell) => grid.appendChild(cell));
      }
    }
  }
  //game over
  function gameOver() {
    if (current.some((index) => squares[currentPosition + index].classList.contains("taken"))) {
      scoreLabel.innerHTML = "End";
      clearInterval(timeId);
    }
  }
});
