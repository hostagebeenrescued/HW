// Tic-Tac-Toe with Minimax (alpha-beta) and UI features
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const aiModeSelect = document.getElementById('aiMode');
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const scoreTEl = document.getElementById('scoreT');

let board = Array(9).fill('');
let active = true;
let current = 'X'; // player X starts
let scores = {X:0, O:0, T:0};

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function init(){
  boardEl.innerHTML = '';
  board = Array(9).fill('');
  active = true;
  current = 'X';
  statusEl.innerText = '輪到玩家 (X)';
  for(let i=0;i<9;i++){
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.addEventListener('click', ()=>playerMove(i));
    boardEl.appendChild(cell);
  }
  updateBoard();
}

function playerMove(i){
  if(!active || board[i]) return;
  board[i] = 'X';
  updateBoard();
  if(checkWin('X')){
    endGame('玩家 (X) 勝利！', 'X');
    return;
  } else if(isFull()){
    endGame('平手！', 'T');
    return;
  }
  current = 'O';
  statusEl.innerText = '電腦思考中...';
  // small delay to show thinking
  setTimeout(()=>computerMove(aiModeSelect.value), 300);
}

function computerMove(mode){
  if(!active) return;
  let move = null;
  if(mode === 'basic'){
    // basic: win/block/random
    move = findWinningMove('O') ?? findWinningMove('X') ?? getRandomMove();
  } else if(mode === 'smart'){
    // smart: try win/block, center, corner, fork creation/block
    move = findWinningMove('O') ?? findWinningMove('X') ?? preferCenterOrCorner() ?? findForkMove('O') ?? findForkMove('X') ?? getRandomMove();
  } else {
    // unbeatable using minimax with alpha-beta and move ordering
    move = bestMoveMinimax();
  }
  if(move === null || board[move]) move = getRandomMove();
  board[move] = 'O';
  updateBoard();
  if(checkWin('O')){
    endGame('電腦 (O) 勝利！', 'O');
    return;
  } else if(isFull()){
    endGame('平手！', 'T');
    return;
  }
  current = 'X';
  statusEl.innerText = '輪到玩家 (X)';
}

function getRandomMove(){
  const empties = board.map((v,i)=> v?null:i).filter(v=>v!==null);
  if(empties.length===0) return null;
  return empties[Math.floor(Math.random()*empties.length)];
}

function findWinningMove(player){
  for(const [a,b,c] of WIN_LINES){
    const line = [board[a], board[b], board[c]];
    if(line.filter(v=>v===player).length===2 && line.includes('')){
      const idx = [a,b,c][line.indexOf('')];
      return idx;
    }
  }
  return null;
}

function preferCenterOrCorner(){
  if(board[4]==='') return 4;
  const corners = [0,2,6,8].filter(i=>board[i]==='');
  if(corners.length) return corners[Math.floor(Math.random()*corners.length)];
  return null;
}

function findForkMove(player){
  // fork: a move that creates two threats
  for(let i=0;i<9;i++){
    if(board[i]!=='') continue;
    const copy = board.slice();
    copy[i]=player;
    const threats = WIN_LINES.reduce((acc,[a,b,c])=>{
      const line = [copy[a],copy[b],copy[c]];
      if(line.filter(v=>v===player).length===2 && line.includes('')) return acc+1;
      return acc;
    },0);
    if(threats>=2) return i;
  }
  return null;
}

function checkWin(player){
  return WIN_LINES.some(([a,b,c])=> board[a]===player && board[b]===player && board[c]===player);
}

function isFull(){ return board.every(v=>v!==''); }

function updateBoard(){
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell,i)=>{
    cell.innerText = board[i]||'';
    cell.classList.toggle('disabled', !!board[i] || !active);
    cell.classList.toggle('x', board[i]==='X');
    cell.classList.toggle('o', board[i]==='O');
  });
}

function endGame(message, result){
  active = false;
  statusEl.innerText = message;
  highlightWin();
  if(result==='X') scores.X++;
  else if(result==='O') scores.O++;
  else scores.T++;
  scoreXEl.innerText = scores.X;
  scoreOEl.innerText = scores.O;
  scoreTEl.innerText = scores.T;
}

function highlightWin(){
  // highlight winning line if exists
  for(const [a,b,c] of WIN_LINES){
    if(board[a] && board[a]===board[b] && board[b]===board[c]){
      const cells = document.querySelectorAll('.cell');
      cells[a].classList.add('win');
      cells[b].classList.add('win');
      cells[c].classList.add('win');
      break;
    }
  }
}

// ---- Minimax (unbeatable) with alpha-beta and move ordering ----
function bestMoveMinimax(){
  // move ordering: center, corners, sides
  const ordering = [4,0,2,6,8,1,3,5,7];
  let bestScore = -Infinity;
  let bestIdx = null;
  for(const i of ordering){
    if(board[i]!=='' ) continue;
    board[i]='O';
    const score = minimax(board, 0, false, -Infinity, Infinity);
    board[i]='';
    if(score>bestScore){
      bestScore=score;
      bestIdx=i;
    }
  }
  return bestIdx;
}

function minimax(bd, depth, isMaximizing, alpha, beta){
  // terminal checks
  if(winFor(bd,'O')) return 10 - depth; // prefer faster wins
  if(winFor(bd,'X')) return depth - 10; // prefer slower losses
  if(bd.every(v=>v!=='')) return 0;

  const ordering = [4,0,2,6,8,1,3,5,7];
  if(isMaximizing){
    let maxEval = -Infinity;
    for(const i of ordering){
      if(bd[i]!=='') continue;
      bd[i]='O';
      const evalScore = minimax(bd, depth+1, false, alpha, beta);
      bd[i]='';
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if(beta<=alpha) break; // beta cut-off
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for(const i of ordering){
      if(bd[i]!=='') continue;
      bd[i]='X';
      const evalScore = minimax(bd, depth+1, true, alpha, beta);
      bd[i]='';
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if(beta<=alpha) break; // alpha cut-off
    }
    return minEval;
  }
}

function winFor(bd, player){
  return WIN_LINES.some(([a,b,c])=> bd[a]===player && bd[b]===player && bd[c]===player);
}

// UI actions
resetBtn.addEventListener('click', ()=>init());
downloadBtn.addEventListener('click', ()=> {
  // trigger a download link (the zip file is prepared server-side when generating bundle)
  // In this static demo environment we will open ./ox_hw09.zip if available
  window.open('ox_hw09.zip', '_blank');
});

// initialize
init();
