
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const size = 8;
let board, currentPlayer, busy=false;

function initBoard(){
  board = Array.from({length:size},()=>Array(size).fill(null));
  board[3][3]='W'; board[3][4]='B';
  board[4][3]='B'; board[4][4]='W';
  currentPlayer='B';
  render();
}

function render(){
  boardEl.innerHTML='';
  for(let r=0;r<size;r++){
    for(let c=0;c<size;c++){
      const cell=document.createElement('div');
      cell.className='cell';
      cell.onclick=()=>move(r,c);
      if(board[r][c]){
        const d=document.createElement('div');
        d.className='disk '+(board[r][c]=='B'?'black':'white');
        cell.appendChild(d);
      }
      boardEl.appendChild(cell);
    }
  }
  statusEl.textContent = currentPlayer=='B'?'你的回合（黑棋）':'電腦思考中...';
}

function move(r,c){
  if(busy || currentPlayer!='B' || board[r][c]) return;
  let flips = getFlips(r,c,'B');
  if(!flips.length) return;
  busy=true;
  board[r][c]='B';
  animateFlips(flips,'B',()=>{
    busy=false;
    currentPlayer='W';
    render();
    setTimeout(computerMove,600);
  });
}

function computerMove(){
  let moves=[];
  for(let r=0;r<size;r++)for(let c=0;c<size;c++){
    if(!board[r][c] && getFlips(r,c,'W').length) moves.push([r,c]);
  }
  if(!moves.length){ currentPlayer='B'; render(); return; }
  let level=document.getElementById('aiLevel').value;
  let m = level=='basic'? moves[0] : moves[Math.floor(Math.random()*moves.length)];
  let flips=getFlips(m[0],m[1],'W');
  board[m[0]][m[1]]='W';
  busy=true;
  animateFlips(flips,'W',()=>{
    busy=false;
    currentPlayer='B';
    render();
  });
}

function getFlips(r,c,p){
  let res=[];
  const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  dirs.forEach(([dr,dc])=>{
    let i=r+dr,j=c+dc,tmp=[];
    while(i>=0&&i<size&&j>=0&&j<size&&board[i][j]&&board[i][j]!=p){
      tmp.push([i,j]); i+=dr; j+=dc;
    }
    if(tmp.length && i>=0&&i<size&&j>=0&&j<size&&board[i][j]==p){
      res.push(...tmp);
    }
  });
  return res;
}

function animateFlips(list, p, callback) {
    let idx = 0;

    function step() {
        if (idx >= list.length) {
            callback();
            return;
        }

        let [r, c] = list[idx];
        let disk = boardEl.children[r * size + c].firstChild;

        // ① 開始翻
        disk.classList.add('flip');

        // ② 翻到一半才「換顏色 class」
        setTimeout(() => {
            disk.classList.remove('black', 'white');
            disk.classList.add(p === 'B' ? 'black' : 'white');
        }, 300);

        // ③ 翻完再處理下一顆（不 render）
        setTimeout(() => {
            disk.classList.remove('flip');
            board[r][c] = p;   // 資料此時才同步
            idx++;
            step();
        }, 600);
    }

    step();
}


function resetGame(){ busy=false; initBoard(); }

initBoard();
