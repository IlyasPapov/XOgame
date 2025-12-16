const boardElement = document.getElementById("board");
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");

const playXBtn = document.getElementById("playX");
const playOBtn = document.getElementById("playO");
const restartBtn = document.getElementById("restart");
const difficultyLabel = document.getElementById("difficultyLabel");

// 🎁 Приз и модалки
const claimPrizeBtn = document.getElementById("claimPrizeBtn");
const resultModal = document.getElementById("resultModal");
const prizeModal = document.getElementById("prizeModal");
const playAgainBtn = document.getElementById("playAgainBtn");

const currentDifficulty = document.getElementById("currentDifficulty");
const difficultySelector = document.getElementById("difficultySelector");
const changeDifficultyBtn = document.getElementById("changeDifficulty");

let aiSmartChance = 0.6;
let board;
let humanPlayer = null;
let aiPlayer = null;
let gameActive = false;

const winCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// ================== СЛОЖНОСТЬ ==================
const difficultyButtons = document.querySelectorAll(".difficulty");
difficultyButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        aiSmartChance = parseFloat(btn.dataset.level);
        difficultyLabel.textContent = btn.dataset.name;
        statusText.textContent = "Сложность выбрана";

        difficultySelector.classList.add("hidden");
        currentDifficulty.classList.remove("hidden");
    });
});

changeDifficultyBtn.addEventListener("click", () => {
    currentDifficulty.classList.add("hidden");
    difficultySelector.classList.remove("hidden");
});

// ================== ВЫБОР СТОРОНЫ ==================
playXBtn.onclick = () => startGame("X");
playOBtn.onclick = () => startGame("O");

// ================== СТАРТ ИГРЫ ==================
function startGame(player) {
    humanPlayer = player;
    aiPlayer = player === "X" ? "O" : "X";

    resetBoard();
    gameActive = true;
    boardElement.classList.remove("dimmed");

    if (humanPlayer === "X") {
        statusText.textContent = "Ваш ход";
    } else {
        statusText.textContent = "Ход компьютера";
        aiMove();
    }
}

// ================== СБРОС ДОСКИ ==================
function resetBoard() {
    board = Array.from(Array(9).keys());
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("X", "O", "pop");
    });

    const oldLine = boardElement.querySelector(".win-line");
    if (oldLine) oldLine.remove();

    boardElement.classList.add("dimmed");
    restartBtn.style.display = "inline-block";
    claimPrizeBtn.style.display = "none";
    resultModal.classList.add("hidden");
    prizeModal.classList.add("hidden");
}

// ================== ХОДЫ ==================
cells.forEach(cell => {
    cell.addEventListener("click", () => {
        const index = cell.dataset.index;

        if (!gameActive) {
            statusText.textContent = "Сначала выберите сторону!";
            return;
        }

        if (typeof board[index] !== "number") return;

        makeMove(index, humanPlayer);
        if (gameActive) aiMove();
    });
});

// ================== ЛОГИКА ХОДА ==================
function makeMove(index, player) {
    board[index] = player;
    const cell = cells[index];
    cell.textContent = player;
    cell.classList.add(player);

    if (checkWin(board, player)) {
        gameActive = false;
        boardElement.classList.add("dimmed");
        restartBtn.style.display = "inline-block";

        const winningCombo = winCombos.find(combo => combo.every(i => board[i] === player));
        winningCombo.forEach(i => cells[i].classList.add("pop"));

        drawWinLine(winningCombo);

        setTimeout(() => {
            if (player === humanPlayer) {
                statusText.textContent = "Вы победили!";
                resultModal.classList.remove("hidden");
                claimPrizeBtn.style.display = "inline-block";
                showConfetti();
                logGameResult("win");

            } else {
                statusText.textContent = "Вы проиграли!";
                logGameResult("lose");

            }
        }, 500);
    } else if (emptyCells(board).length === 0) {
        statusText.textContent = "Ничья!";
        gameActive = false;
        restartBtn.style.display = "inline-block";
        boardElement.classList.add("dimmed");
        logGameResult("draw");

    }
}

// ================== ИИ ==================
function aiMove() {
    if (!gameActive) return;

    let move;
    if (Math.random() < aiSmartChance) {
        move = minimax(board, aiPlayer).index;
    } else {
        const empty = emptyCells(board);
        move = empty[Math.floor(Math.random() * empty.length)];
    }

    makeMove(move, aiPlayer);
}

// ================== ЛОГИКА ==================
function checkWin(board, player) {
    return winCombos.some(combo => combo.every(i => board[i] === player));
}

function emptyCells(board) {
    return board.filter(s => typeof s === "number");
}

// ================== MINIMAX ==================
function minimax(newBoard, player) {
    const availSpots = emptyCells(newBoard);

    if (checkWin(newBoard, humanPlayer)) return { score: -10 };
    if (checkWin(newBoard, aiPlayer)) return { score: 10 };
    if (availSpots.length === 0) return { score: 0 };

    const moves = [];

    for (let i = 0; i < availSpots.length; i++) {
        const move = {};
        move.index = newBoard[availSpots[i]];
        newBoard[availSpots[i]] = player;

        const result = minimax(newBoard, player === aiPlayer ? humanPlayer : aiPlayer);
        move.score = result.score;

        newBoard[availSpots[i]] = move.index;
        moves.push(move);
    }

    let bestMove;
    if (player === aiPlayer) {
        let bestScore = -Infinity;
        moves.forEach((m, i) => {
            if (m.score > bestScore) {
                bestScore = m.score;
                bestMove = i;
            }
        });
    } else {
        let bestScore = Infinity;
        moves.forEach((m, i) => {
            if (m.score < bestScore) {
                bestScore = m.score;
                bestMove = i;
            }
        });
    }

    return moves[bestMove];
}

// ================== 🎟️ ГЕНЕРАЦИЯ ПРОМОКОДА ==================
function generatePromoCode() {
    // создаём случайный пятизначный промокод
    return Math.floor(10000 + Math.random() * 90000).toString();
}


// ================== 🎁 ПРИЗ ==================
let lastGameTime = null;      // время последней игры
let lastGameResult = null;    // результат последней игры

claimPrizeBtn.addEventListener("click", async () => {
    if (lastGameResult !== "победа") {
        alert("Приз доступен только за победу!");
        return;
    }

    // 1️⃣ Генерируем промокод
    const promo = generatePromoCode();
    const promoCodeEl = document.getElementById("promoCode");
    if (promoCodeEl) promoCodeEl.textContent = promo;

    prizeModal.classList.remove("hidden");

    // 2️⃣ Формируем сообщение для консоли
    const message = `Выдан промокод: ${promo} (игра от ${lastGameTime})`;
    console.log("📨 TELEGRAM (пока консоль):", message);

    // 3️⃣ Отправка на сервер (чтобы бот прислал в Telegram)
    try {
        const response = await fetch("http://localhost:3000/game", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                result: lastGameResult,
                promoCode: promo
            })
        });
        const data = await response.json();
        console.log("Ответ сервера:", data);
    } catch (err) {
        console.error("Ошибка при отправке на сервер:", err);
    }
});

// ================== КНОПКА КОПИРОВАНИЯ ==================
const copyPromoBtn = document.getElementById("copyPromoBtn");
const promoCodeEl = document.getElementById("promoCode");

copyPromoBtn.addEventListener("click", () => {
    const code = promoCodeEl.textContent;
    if (!code) return;
    navigator.clipboard.writeText(code)
        .then(() => alert("Промокод скопирован в буфер обмена!"))
        .catch(err => console.error("Ошибка копирования: ", err));
});

// ================== МОДАЛКИ: КРЕСТИКИ ==================
document.addEventListener("click", (e) => {
    if (e.target.matches(".modal-close")) {
        const modal = e.target.closest(".modal");
        if (modal) modal.classList.add("hidden");
    }
});

// ================== КНОПКИ ПЕРЕЗАПУСКА ==================
playAgainBtn.addEventListener("click", () => location.reload());
restartBtn.addEventListener("click", () => location.reload());

// ================== АНИМАЦИЯ ЛИНИИ ВЫИГРЫША ==================
function drawWinLine(combo) {
    const layer = boardElement.querySelector(".win-layer");
    layer.innerHTML = "";

    const line = document.createElement("div");
    line.classList.add("win-line");

    const cellSize = 100;
    const gap = 14;
    const lineThickness = 6;
    const totalCell = cellSize + gap;

    const centers = [
        { x: totalCell * 0 + cellSize / 2, y: totalCell * 0 + cellSize / 2 },
        { x: totalCell * 1 + cellSize / 2, y: totalCell * 0 + cellSize / 2 },
        { x: totalCell * 2 + cellSize / 2, y: totalCell * 0 + cellSize / 2 },

        { x: totalCell * 0 + cellSize / 2, y: totalCell * 1 + cellSize / 2 },
        { x: totalCell * 1 + cellSize / 2, y: totalCell * 1 + cellSize / 2 },
        { x: totalCell * 2 + cellSize / 2, y: totalCell * 1 + cellSize / 2 },

        { x: totalCell * 0 + cellSize / 2, y: totalCell * 2 + cellSize / 2 },
        { x: totalCell * 1 + cellSize / 2, y: totalCell * 2 + cellSize / 2 },
        { x: totalCell * 2 + cellSize / 2, y: totalCell * 2 + cellSize / 2 },
    ];

    const start = centers[combo[0]];
    const end = centers[combo[2]];

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const offsetX = Math.cos(angle) * (cellSize / 2);
    const offsetY = Math.sin(angle) * (cellSize / 2);

    const lineStartX = start.x - offsetX;
    const lineStartY = start.y - offsetY;
    const lineLength = length + cellSize;

    line.style.width = `0px`;
    line.style.height = `${lineThickness}px`;
    line.style.left = `${lineStartX}px`;
    line.style.top = `${lineStartY - lineThickness / 2}px`;
    line.style.transform = `rotate(${angle * 180 / Math.PI}deg)`;
    line.style.transformOrigin = "0 50%";
    line.style.transition = "width 0.5s ease";

    layer.appendChild(line);

    requestAnimationFrame(() => {
        line.style.width = `${lineLength}px`;
    });
}

// ================== ЛЕГКОЕ КОНФЕТТИ ==================
function showConfetti() {
    const colors = ['#FFC107', '#FF5722', '#4CAF50', '#03A9F4', '#E91E63'];
    for (let i = 0; i < 50; i++) {
        const conf = document.createElement('div');
        conf.classList.add('confetti');
        conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        conf.style.left = Math.random() * 100 + '%';
        conf.style.animationDuration = 2 + Math.random() * 2 + 's';
        document.body.appendChild(conf);
        setTimeout(() => conf.remove(), 4000);
    }
}

// ================== 📜 ИСТОРИЯ ИГР (СЕРВЕР / TELEGRAM) ==================
function logGameResult(result, promoCode = null) {
    // сохраняем время и результат в глобальные переменные
    lastGameTime = new Date().toLocaleString("ru-RU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    switch (result) {
        case "win": lastGameResult = "победа"; break;
        case "lose": lastGameResult = "поражение"; break;
        case "draw": lastGameResult = "ничья"; break;
        default: lastGameResult = "неизвестно";
    }

    const message = `Игра от ${lastGameTime} — ${lastGameResult}`;
    console.log("📨 ОТПРАВКА В TELEGRAM (через сервер):", message);

    // Отправляем на сервер
    fetch('http://localhost:3000/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result: lastGameResult, promoCode })
    })
        .then(res => res.json())
        .then(data => console.log('Ответ сервера:', data))
        .catch(err => console.error('Ошибка отправки на сервер:', err));
}

