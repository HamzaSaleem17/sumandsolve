
// --- Sum & Solve: enforced scoring/level rules (non-destructive override) ---
(function(){
  // Guard if not on game page
  if (typeof document === 'undefined') return;
  const scoreEl = document.getElementById('score');
  const levelEl = document.getElementById('level');
  const askedEl = document.getElementById('totalQuestions') || document.getElementById('questionCount');
  const feedbackEl = document.getElementById('feedback');
  // Use existing globals if present
  window.__sums_enforcer__ = window.__sums_enforcer__ || {};
  const S = window.__sums_enforcer__;
  S.questionsInLevel = 0;
  S.correctInLevel = 0;
  S.maxPerLevel = 20;
  S.pointsCorrect = 5;
  S.pointsWrong = -2;

  // Utility to safely set text
  function setText(node, txt){
    if (node) node.textContent = txt;
  }
  function toast(msg, ok){
    if (feedbackEl){
      feedbackEl.textContent = msg;
      feedbackEl.classList.remove('bad','ok');
      feedbackEl.classList.add(ok ? 'ok':'bad');
      setTimeout(()=>{ feedbackEl.textContent=''; }, 1500);
    }
  }

  // Patch generateQuestion to increment asked counter and use level-based complexity
  const _gen = window.generateQuestion;
  window.generateQuestion = function(){
    if (typeof _gen === 'function'){
      _gen();
    }
    // Track per-level question attempts
    S.questionsInLevel = (S.questionsInLevel||0);
    if (typeof window.totalQuestions !== 'undefined'){
      // totalQuestions is already incremented elsewhere; mirror it if needed
    }
    // Update a visible counter if available
    if (askedEl && typeof window.totalQuestions !== 'undefined'){
      setText(askedEl, window.totalQuestions + "/20");
    }
  };

  // Patch checkAnswer to enforce +5/-2 and level transitions
  const _chk = window.checkAnswer;
  window.checkAnswer = function(btn){
    try{
      // Determine correctness using original logic
      const beforeScore = (typeof window.score !== 'undefined') ? window.score : 0;
      const selected = parseInt(btn && btn.textContent);
      const isCorrect = (window.currentQuestion && selected === window.currentQuestion.answer);
      // Apply enforced scoring
      if (typeof window.score === 'undefined') window.score = 0;
      if (isCorrect){
        window.score += S.pointsCorrect;
        S.correctInLevel = (S.correctInLevel||0) + 1;
        toast("Correct! +5", true);
      } else {
        window.score += S.pointsWrong;
        toast("Oops! −2", false);
      }
      // Update score UI
      setText(scoreEl, window.score);
      // Track question attempt
      S.questionsInLevel = (S.questionsInLevel||0) + 1;
      if (askedEl){
        const q = (typeof window.totalQuestions !== 'undefined') ? window.totalQuestions : S.questionsInLevel;
        setText(askedEl, q + "/20");
      }
      // Check level up conditions
      if (S.correctInLevel >= 20 || S.questionsInLevel >= 20){
        // Level up
        if (typeof window.level === 'number'){
          window.level += 1;
          setText(levelEl, window.level);
        }
        S.correctInLevel = 0;
        S.questionsInLevel = 0;
        if (typeof window.playSound === 'function'){ try{ window.playSound('levelUp'); }catch(e){} }
      }
    }catch(e){
      console && console.warn && console.warn("Enforcer scoring error:", e);
    }finally{
      // Delegate to original checker for UI transitions, timers, etc.
      if (typeof _chk === 'function'){
        return _chk(btn);
      }
    }
  };

})();
