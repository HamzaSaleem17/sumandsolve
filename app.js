
/* Sum & Solve – adaptive addition quiz
   Scoring: +5 correct, -2 incorrect
   Level-up: after 20 correct answers in current level (resets per level)
   Level session: capped at 20 questions; if user reaches 20 correct earlier, we level up immediately.
*/
const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => [...root.querySelectorAll(q)];

const state = {
  level: 1,
  score: 0,
  questionsAsked: 0,
  correctInLevel: 0,
  totalCorrect: 0,
  current: null,
  streak: 0,
  bestStreak: 0
};

const LEVEL_RULES = {
  1: () => genAdd(2, 1),                 // 2 numbers, single-digit
  2: () => genAdd(2, 2),                 // 2 numbers, two-digit
  3: () => (Math.random()<.5? genAdd(2,1): genAdd(2,2)), // mix 1 & 2
  4: () => genAdd(3, 2),                 // 3 numbers, two-digit
  5: () => genAdd(3, 2, true),           // 3 numbers, two-digit, include carrying frequently
  6: () => genAdd(4, 2),                 // 4 numbers, two-digit
  7: () => genAdd(2, 3),                 // 2 numbers, up to 3 digits
  8: () => genAdd(3, 3),                 // 3 numbers, up to 3 digits
};

function randint(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }
function genAdd(count=2, digits=1, biasCarry=false){
  let nums = [];
  for(let i=0;i<count;i++){
    let low = Math.pow(10, digits-1);
    let high = Math.pow(10, digits)-1;
    // allow 0 for single-digit level-1
    if(digits===1) low = 0;
    let n;
    if(biasCarry && digits>=2){
      // bias towards numbers ending in 7-9 to encourage carrying
      const end = [7,8,9][randint(0,2)];
      n = randint(Math.max(low,10), high);
      n = n - (n%10) + end;
      if(n<low) n = low+end;
      if(n>high) n = high- (10-end);
    } else {
      n = randint(low, high);
    }
    nums.push(n);
  }
  const sum = nums.reduce((a,b)=>a+b,0);
  return { nums, sum, text: nums.join(" + ") };
}

function updateUI(){
  $("#level").textContent = state.level;
  $("#score").textContent = state.score;
  $("#asked").textContent = state.questionsAsked + "/20";
  $("#correct").textContent = state.totalCorrect;
  $("#streak").textContent = state.streak;
  $("#bestStreak").textContent = state.bestStreak;
  const p = Math.min(100, Math.round((state.correctInLevel/20)*100));
  $("#progressFill").style.width = p + "%";
  $("#badgeImg").src = `badge-level-${Math.min(5, state.level)}.svg`;
  $("#levelChip").textContent = "LEVEL " + state.level;
}

function nextQuestion(){
  if(state.questionsAsked>=20){
    endLevel("You've completed 20 questions this level.");
    return;
  }
  const rule = LEVEL_RULES[state.level] || LEVEL_RULES[1];
  state.current = rule();
  $(".question").textContent = state.current.text + " = ?";
  const inp = $("#answer");
  inp.value = "";
  inp.focus();
}

function endLevel(reason="Level complete!"){
  toast(reason + " Leveling up.");
  state.level += 1;
  state.questionsAsked = 0;
  state.correctInLevel = 0;
  updateUI();
  nextQuestion();
}

function toast(msg, good=true){
  const fb = $("#feedback");
  fb.textContent = msg;
  fb.className = "feedback " + (good? "ok":"bad");
  setTimeout(()=>{ fb.textContent=""; fb.className="feedback"; }, 2000);
}

function submitAnswer(){
  const inp = $("#answer");
  const val = parseInt(inp.value, 10);
  if(Number.isNaN(val)) return toast("Enter a number.", false);
  state.questionsAsked += 1;
  if(val === state.current.sum){
    state.score += 5;
    state.correctInLevel += 1;
    state.totalCorrect += 1;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    toast("Correct! +5", true);
  } else {
    state.score -= 2;
    state.streak = 0;
    toast(`Oops! ${state.current.text} = ${state.current.sum}. −2`, false);
  }
  updateUI();
  if(state.correctInLevel >= 20){
    endLevel("Great job! 20 correct answers achieved.");
  } else if (state.questionsAsked >= 20){
    endLevel("20 questions attempted.");
  } else {
    nextQuestion();
  }
}

function keyHandler(e){
  if(e.key === "Enter") submitAnswer();
}

function resetGame(){
  Object.assign(state, {
    level: 1,
    score: 0,
    questionsAsked: 0,
    correctInLevel: 0,
    totalCorrect: 0,
    current: null,
    streak: 0,
    bestStreak: 0
  });
  updateUI();
  nextQuestion();
}

window.addEventListener("DOMContentLoaded", ()=>{
  $("#answer").addEventListener("keydown", keyHandler);
  $("#submitBtn").addEventListener("click", submitAnswer);
  $("#resetBtn").addEventListener("click", resetGame);
  updateUI();
  nextQuestion();
});
