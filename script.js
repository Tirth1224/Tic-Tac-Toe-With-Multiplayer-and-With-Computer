document.addEventListener("DOMContentLoaded", () => {
  const cells = document.querySelectorAll(".cell");
  const statusDisplay = document.getElementById("status");
  const restartButton = document.getElementById("restart");
  const changePlayerButton = document.getElementById("change-player");
  const gameContainer = document.getElementById("game");
  const selectionPage = document.getElementById("selection-page");
  const playerSelectionContainer = document.getElementById("player-selection");
  const modeSelectionButtons = document.querySelectorAll(
    "#selection-page .btn-group button"
  );
  const playerSelectionButtons = document.querySelectorAll(
    "#player-selection-buttons button"
  );
  const fireworksContainer = document.getElementById("fireworks-container");
  const fireworksCanvas = document.getElementById("fireworks-canvas");
  const messageContainer = document.getElementById("message-container");
  const messageText = document.getElementById("message-text");
  const messageGif = document.getElementById("message-gif");

  let board = Array(9).fill(null);
  let currentPlayer = "X";
  let gameActive = true;
  let gameMode = "";
  let aiPlayer = "O";

  const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const handleCellPlayed = (clickedCell, clickedCellIndex) => {
    board[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
    clickedCell.style.pointerEvents = "none";
    if (checkWin()) {
      if (gameMode.includes("computer") && currentPlayer === aiPlayer) {
        statusDisplay.innerHTML = `Computer has won! 😕🙁`;
        messageText.innerHTML = "Better Luck Next Time! 😊😇";
        messageGif.src =
          "Better Luck Next Time No Thanks GIF by Andy Grammer - Find & Share on GIPHY.gif"; // Use the actual URL
        messageContainer.classList.remove("d-none");
      } else {
        statusDisplay.innerHTML = `${currentPlayer} has won! 🥳🎉`;
        messageText.innerHTML = "Congratulations! 🥳🥳";
        messageGif.src = "win.gif";
        messageContainer.classList.remove("d-none");
        triggerFireworks();
      }
      statusDisplay.classList.add("win");
      gameActive = false;
      highlightWinningCells();
    } else if (board.every((cell) => cell)) {
      statusDisplay.innerHTML = "Draw! Keep it up! 😊";
      messageText.innerHTML = "Good Job! 👍👏";
      messageGif.src = "good-job.gif";
      messageContainer.classList.remove("d-none");
      gameActive = false;
    } else {
      currentPlayer = currentPlayer === "X" ? "O" : "X";
      if (gameMode.includes("computer") && currentPlayer === aiPlayer) {
        setTimeout(makeComputerMove, 500);
      }
    }
  };

  const handleCellClick = (event) => {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute("data-index"));
    if (board[clickedCellIndex] || !gameActive) {
      return;
    }
    handleCellPlayed(clickedCell, clickedCellIndex);
  };

  const makeComputerMove = () => {
    let emptyCells = board
      .map((cell, index) => (cell === null ? index : null))
      .filter((val) => val !== null);
    let chosenIndex;
    if (gameMode === "computer-easy") {
      chosenIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    } else {
      chosenIndex = getBestMove();
    }
    handleCellPlayed(cells[chosenIndex], chosenIndex);
  };

  const getBestMove = () => {
    const minimax = (newBoard, player) => {
      const availSpots = newBoard
        .map((cell, index) => (cell === null ? index : null))
        .filter((val) => val !== null);

      if (checkWinCondition(newBoard, "X")) {
        return { score: -10 };
      } else if (checkWinCondition(newBoard, "O")) {
        return { score: 10 };
      } else if (availSpots.length === 0) {
        return { score: 0 };
      }

      let moves = [];
      for (let i = 0; i < availSpots.length; i++) {
        let move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === "O") {
          let result = minimax(newBoard, "X");
          move.score = result.score;
        } else {
          let result = minimax(newBoard, "O");
          move.score = result.score;
        }

        newBoard[availSpots[i]] = null;
        moves.push(move);
      }

      let bestMove;
      if (player === "O") {
        let bestScore = -10000;
        for (let i = 0; i < moves.length; i++) {
          if (moves[i].score > bestScore) {
            bestScore = moves[i].score;
            bestMove = i;
          }
        }
      } else {
        let bestScore = 10000;
        for (let i = 0; i < moves.length; i++) {
          if (moves[i].score < bestScore) {
            bestScore = moves[i].score;
            bestMove = i;
          }
        }
      }
      return moves[bestMove];
    };

    const checkWinCondition = (board, player) => {
      for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] === player && board[b] === player && board[c] === player) {
          return true;
        }
      }
      return false;
    };

    return minimax(board, aiPlayer).index;
  };

  const checkWin = () => {
    let won = false;
    winningConditions.forEach((condition) => {
      const [a, b, c] = condition;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        won = true;
      }
    });
    return won;
  };

  const highlightWinningCells = () => {
    winningConditions.forEach((condition) => {
      const [a, b, c] = condition;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        cells[a].classList.add("winning-cell");
        cells[b].classList.add("winning-cell");
        cells[c].classList.add("winning-cell");
      }
    });
  };

  const handleRestartGame = () => {
    board = Array(9).fill(null);
    gameActive = true;
    currentPlayer = "X";
    statusDisplay.innerHTML = "";
    statusDisplay.classList.remove("win");
    cells.forEach((cell) => {
      cell.innerHTML = "";
      cell.classList.remove("winning-cell");
      cell.style.pointerEvents = "auto";
    });
    fireworksContainer.classList.add("d-none");
    messageContainer.classList.add("d-none");
  };

  const handleChangePlayer = () => {
    gameContainer.classList.add("d-none");
    playerSelectionContainer.classList.add("d-none");
    selectionPage.classList.remove("d-none");
    handleRestartGame();
  };

  const triggerFireworks = () => {
    fireworksContainer.classList.remove("d-none");
    startFireworks();
  };

  modeSelectionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      gameMode = button.id;
      selectionPage.classList.add("d-none");
      if (gameMode === "two-player") {
        currentPlayer = "X";
        aiPlayer = "";
        gameContainer.classList.remove("d-none");
        playerSelectionContainer.classList.add("d-none");
        statusDisplay.innerHTML = "Player X's turn";
      } else {
        playerSelectionContainer.classList.remove("d-none");
      }
    });
  });

  playerSelectionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.id === "choose-x") {
        currentPlayer = "X";
        aiPlayer = "O";
      } else {
        currentPlayer = "O";
        aiPlayer = "X";
      }
      playerSelectionContainer.classList.add("d-none");
      gameContainer.classList.remove("d-none");
      statusDisplay.innerHTML = `Player ${currentPlayer}'s turn`;
    });
  });

  cells.forEach((cell) => {
    cell.addEventListener("click", handleCellClick);
  });

  restartButton.addEventListener("click", handleRestartGame);
  changePlayerButton.addEventListener("click", handleChangePlayer);

  const startFireworks = () => {
    const canvas = fireworksCanvas;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ["#FF1461", "#18FF92", "#5A87FF", "#FBF38C"];

    const random = (min, max) => Math.random() * (max - min) + min;

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = random(2, 5);
        this.speedX = random(-3, 3);
        this.speedY = random(-3, 3);
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.size *= 0.95;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    const handleParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        if (particles[i].size <= 0.5) {
          particles.splice(i, 1);
          i--;
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      handleParticles();
      requestAnimationFrame(animate);
    };

    const createFireworks = (x, y) => {
      for (let i = 0; i < 50; i++) {
        particles.push(new Particle(x, y));
      }
    };

    canvas.addEventListener("click", (event) => {
      createFireworks(event.clientX, event.clientY);
    });

    createFireworks(canvas.width / 2, canvas.height / 2);
    animate();
  };
});
