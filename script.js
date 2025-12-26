function onPageLoaded() {
    // Write your javascript code here
    console.log("page loaded");
}

document.addEventListener("DOMContentLoaded", function () {
    // Listen for clicks on elements with the class 'play-button'
    document.querySelectorAll(".play-button").forEach(function (button) {
        button.addEventListener("click", function () {
            // When a play button is clicked, simulate a click on the <a> tag within the same .video-container
            this.parentNode.querySelector("a").click();
        });
    });
});
class GoGame {
    constructor() {
        this.aiEnabled = true;   // AI 開關
        this.history = [];       // 歷史紀錄
        this.initBoardData();
        this.renderBoardGrid();
        this.updateUI();
    }

    initBoardData() {
        this.board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(EMPTY));
        this.currentPlayer = BLACK;
        this.gameOver = false;
        this.passes = 0;
        this.koPoint = null;
        this.lastMove = null;
    }

    playMove(r, c) {
        if (this.board[r][c] !== EMPTY || this.gameOver) return false;

        const originalState = this.copyBoard(this.board);
        const originalLastMove = this.lastMove ? { ...this.lastMove } : null;

        this.board[r][c] = this.currentPlayer;

        const opponent = this.currentPlayer === BLACK ? WHITE : BLACK;
        const capturedStones = this.checkCaptures(r, c, opponent);

        if (this.koPoint && this.koPoint.r === r && this.koPoint.c === c && capturedStones.length === 1) {
            this.board = originalState;
            alert("不能立即回提");
            return false;
        }

        const myLiberties = this.getGroupLiberties(r, c, this.currentPlayer);
        if (myLiberties === 0 && capturedStones.length === 0) {
            this.board = originalState;
            alert("不能自殺");
            return false;
        }

        if (capturedStones.length > 0) this.removeStones(capturedStones);

        if (capturedStones.length === 1 && myLiberties === 0) {
            this.koPoint = { r: capturedStones[0].r, c: capturedStones[0].c };
        } else this.koPoint = null;

        this.passes = 0;
        this.lastMove = { r, c };

        // 儲存歷史，用於悔棋
        this.history.push({
            board: originalState,
            currentPlayer: this.currentPlayer,
            lastMove: originalLastMove,
            koPoint: this.koPoint,
            passes: this.passes
        });

        this.renderStones();
        this.updateRealTimeTerritory();

        // 超過41顆棋子檢查
        if (this.checkVictory()) return true;

        this.currentPlayer = opponent;
        this.updateUI();

        // AI 下子
        if (this.currentPlayer === WHITE && this.aiEnabled) {
            setTimeout(() => this.aiMove(), 400);
        }

        return true;
    }

    toggleAI() {
        this.aiEnabled = !this.aiEnabled;
        const btn = document.getElementById('btn-ai-toggle');
        btn.textContent = this.aiEnabled ? "AI 開啟" : "AI 關閉";
    }

    undo() {
        if (!this.history || this.history.length === 0 || this.gameOver) return;
        const lastState = this.history.pop();
        this.board = this.copyBoard(lastState.board);
        this.currentPlayer = lastState.currentPlayer;
        this.lastMove = lastState.lastMove;
        this.koPoint = lastState.koPoint;
        this.passes = lastState.passes;

        this.renderStones();
        this.updateRealTimeTerritory();
        this.updateUI();
    }

    aiMove() {
        if (!this.aiEnabled || this.gameOver) return;
        const validMoves = [];
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (this.board[r][c] === EMPTY && this.isValidMoveSim(r, c, WHITE)) {
                    let score = Math.random() * 10;
                    if ((r === 2 || r === 6) && (c === 2 || c === 6)) score += 5;
                    if (r === 4 && c === 4) score += 3;
                    validMoves.push({ r, c, score });
                }
            }
        }
        if (validMoves.length === 0) {
            this.pass();
            return;
        }
        validMoves.sort((a, b) => b.score - a.score);
        this.playMove(validMoves[0].r, validMoves[0].c);
    }

    // -------- 新增：勝利判斷 --------
    checkVictory() {
        let blackCount = 0, whiteCount = 0;
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (this.board[r][c] === BLACK) blackCount++;
                else if (this.board[r][c] === WHITE) whiteCount++;
            }
        }
        if (blackCount > 41 || whiteCount > 41) {
            this.gameOver = true;
            document.getElementById('board-container').classList.add('finished');
            const msg = blackCount > 41 ? "🏆 黑棋超過41顆勝利！" : "💻 白棋超過41顆勝利！";
            document.getElementById('status').textContent = msg;
            alert(msg);
            return true;
        }
        return false;
    }

    // ---------- 其餘函式不變，如 copyBoard, getGroupLiberties, removeStones, checkCaptures 等 ----------
}




