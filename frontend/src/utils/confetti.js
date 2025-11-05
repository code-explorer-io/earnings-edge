import confetti from 'canvas-confetti';

// MOMENT 1: Full screen celebration (Analysis complete)
export const celebrateAnalysisComplete = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;

  const randomInRange = (min, max) => Math.random() * (max - min) + min;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      particleCount,
      startVelocity: 30,
      spread: 360,
      origin: {
        x: randomInRange(0.1, 0.9),
        y: Math.random() - 0.2
      },
      colors: ['#667eea', '#764ba2', '#4ade80', '#22c55e', '#3b82f6']
    });
  }, 250);
};

// MOMENT 2: AI Summary loads (Small corner burst from top right)
export const celebrateAiSummary = () => {
  confetti({
    particleCount: 50,
    angle: 225,
    spread: 55,
    origin: { x: 1, y: 0 },
    colors: ['#3b82f6', '#60a5fa', '#93c5fd']
  });
};

// MOMENT 3: Perfect Consistency 100% (Medium celebration from center)
export const celebratePerfectConsistency = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x: 0.5, y: 0.5 },
    colors: ['#4ade80', '#22c55e', '#16a34a', '#10b981']
  });
};

// MOMENT 4: Share Link Copied (Tiny burst at cursor position)
export const celebrateShareCopied = (event) => {
  const rect = event.target.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;

  confetti({
    particleCount: 30,
    spread: 60,
    origin: { x, y },
    colors: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
    startVelocity: 20,
    scalar: 0.8
  });
};

// MOMENT 5: First Analysis Ever (Extra big celebration - one-time only)
export const celebrateFirstAnalysis = () => {
  const duration = 5000;
  const animationEnd = Date.now() + duration;

  const colors = ['#667eea', '#764ba2', '#4ade80', '#22c55e', '#3b82f6', '#f59e0b'];

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 100 * (timeLeft / duration);

    // Fire from left
    confetti({
      particleCount,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors
    });

    // Fire from right
    confetti({
      particleCount,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors
    });

    // Fire from center
    if (timeLeft > 2500) {
      confetti({
        particleCount: particleCount / 2,
        spread: 360,
        origin: { x: 0.5, y: 0.5 },
        colors
      });
    }
  }, 250);
};

// Check if user has completed first analysis
export const isFirstAnalysis = () => {
  return !localStorage.getItem('hasCompletedFirstAnalysis');
};

// Mark first analysis as complete
export const markFirstAnalysisComplete = () => {
  localStorage.setItem('hasCompletedFirstAnalysis', 'true');
};
