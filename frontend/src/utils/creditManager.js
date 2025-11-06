/**
 * Credit Management System for EarningsEdge
 *
 * Features:
 * - 10 welcome credits for new users
 * - 25 daily credits after welcome credits used (increased for testing)
 * - Daily refresh at midnight UTC
 * - Purchased credits (future) never expire
 */

const STORAGE_KEYS = {
  CREDITS: 'earningsEdgeCredits',
  WELCOME_USED: 'earningsEdgeWelcomeUsed',
  LAST_REFRESH: 'earningsEdgeLastRefresh',
  SESSION_ID: 'earningsEdgeSessionId',
  PURCHASED_CREDITS: 'earningsEdgePurchasedCredits' // For future Coinbase Commerce integration
};

const CREDIT_CONFIG = {
  WELCOME_CREDITS: 10,
  DAILY_CREDITS: 25,  // 25 free credits added daily after welcome credits used (increased for testing)
  MAX_FREE_CREDITS: 25,  // Maximum free credits you can have at once
  COST_PER_ANALYSIS: 1
};

/**
 * Initialize credit system for new users
 */
export function initializeCreditSystem() {
  const sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);

  // Check if this is a new user
  if (!sessionId) {
    const newSessionId = `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    localStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId);
    localStorage.setItem(STORAGE_KEYS.CREDITS, CREDIT_CONFIG.WELCOME_CREDITS.toString());
    localStorage.setItem(STORAGE_KEYS.WELCOME_USED, 'false');
    localStorage.setItem(STORAGE_KEYS.LAST_REFRESH, new Date().toISOString());
    localStorage.setItem(STORAGE_KEYS.PURCHASED_CREDITS, '0');

    console.log('✨ New user initialized with 10 welcome credits');
    return {
      credits: CREDIT_CONFIG.WELCOME_CREDITS,
      isNewUser: true,
      sessionId: newSessionId
    };
  }

  // Existing user - check for daily refresh
  checkAndRefreshDailyCredits();

  return {
    credits: getCurrentCredits(),
    isNewUser: false,
    sessionId
  };
}

/**
 * Check if it's a new day and refresh daily credits
 */
export function checkAndRefreshDailyCredits() {
  const lastRefresh = localStorage.getItem(STORAGE_KEYS.LAST_REFRESH);
  const welcomeUsed = localStorage.getItem(STORAGE_KEYS.WELCOME_USED) === 'true';

  if (!lastRefresh || !welcomeUsed) {
    return false; // No refresh needed
  }

  const lastRefreshDate = new Date(lastRefresh);
  const now = new Date();

  // Check if it's a new UTC day
  const lastRefreshUTC = new Date(Date.UTC(
    lastRefreshDate.getUTCFullYear(),
    lastRefreshDate.getUTCMonth(),
    lastRefreshDate.getUTCDate()
  ));

  const nowUTC = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));

  if (nowUTC > lastRefreshUTC) {
    // It's a new day! Add daily credits
    const creditsAdded = addDailyCredits();
    localStorage.setItem(STORAGE_KEYS.LAST_REFRESH, now.toISOString());
    console.log(`🌅 New day detected! Added ${creditsAdded} daily credits (max ${CREDIT_CONFIG.MAX_FREE_CREDITS})`);

    // Trigger confetti if credits were actually added
    if (creditsAdded > 0 && typeof window !== 'undefined') {
      triggerConfetti();
    }

    return true;
  }

  return false;
}

/**
 * Trigger confetti animation (requires canvas-confetti package)
 */
function triggerConfetti() {
  // Dynamically import confetti to avoid SSR issues
  import('canvas-confetti').then((confetti) => {
    confetti.default({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b']
    });

    // Second burst after a short delay
    setTimeout(() => {
      confetti.default({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10b981', '#3b82f6']
      });
    }, 250);

    setTimeout(() => {
      confetti.default({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8b5cf6', '#f59e0b']
      });
    }, 400);
  }).catch((err) => {
    console.warn('Confetti not available:', err);
  });
}

/**
 * Add daily credits (max 25 free credits total for testing)
 */
function addDailyCredits() {
  const currentCredits = getCurrentCredits();
  const purchasedCredits = getPurchasedCredits();
  const freeCredits = currentCredits - purchasedCredits;

  // Only add daily credits if free credits are below max
  if (freeCredits < CREDIT_CONFIG.MAX_FREE_CREDITS) {
    const creditsToAdd = Math.min(
      CREDIT_CONFIG.DAILY_CREDITS,
      CREDIT_CONFIG.MAX_FREE_CREDITS - freeCredits
    );

    const newTotal = currentCredits + creditsToAdd;
    localStorage.setItem(STORAGE_KEYS.CREDITS, newTotal.toString());

    return creditsToAdd;
  }

  return 0;
}

/**
 * Get current credit balance
 */
export function getCurrentCredits() {
  const credits = localStorage.getItem(STORAGE_KEYS.CREDITS);
  return credits ? parseInt(credits, 10) : 0;
}

/**
 * Get purchased credits balance (for future use)
 */
export function getPurchasedCredits() {
  const purchased = localStorage.getItem(STORAGE_KEYS.PURCHASED_CREDITS);
  return purchased ? parseInt(purchased, 10) : 0;
}

/**
 * Check if user has used welcome credits
 */
export function hasUsedWelcomeCredits() {
  return localStorage.getItem(STORAGE_KEYS.WELCOME_USED) === 'true';
}

/**
 * Deduct credits for an analysis
 * @returns {object} { success: boolean, remainingCredits: number, message: string }
 */
export function deductCredits(amount = CREDIT_CONFIG.COST_PER_ANALYSIS) {
  const currentCredits = getCurrentCredits();

  if (currentCredits < amount) {
    return {
      success: false,
      remainingCredits: currentCredits,
      message: 'Insufficient credits'
    };
  }

  const newBalance = currentCredits - amount;
  localStorage.setItem(STORAGE_KEYS.CREDITS, newBalance.toString());

  // If this brings them to 0 for the first time, mark welcome as used
  if (newBalance === 0 && !hasUsedWelcomeCredits()) {
    localStorage.setItem(STORAGE_KEYS.WELCOME_USED, 'true');
    console.log('👋 Welcome credits used up! Daily credits will refresh tomorrow');
  }

  return {
    success: true,
    remainingCredits: newBalance,
    message: `Analysis complete! ${newBalance} credits remaining`
  };
}

/**
 * Add purchased credits (for future Coinbase Commerce integration)
 * @param {number} amount - Number of credits to add
 * @param {string} transactionId - Payment transaction ID
 */
export function addPurchasedCredits(amount, transactionId = null) {
  const currentCredits = getCurrentCredits();
  const currentPurchased = getPurchasedCredits();

  const newTotal = currentCredits + amount;
  const newPurchased = currentPurchased + amount;

  localStorage.setItem(STORAGE_KEYS.CREDITS, newTotal.toString());
  localStorage.setItem(STORAGE_KEYS.PURCHASED_CREDITS, newPurchased.toString());

  // Log transaction for future reference
  console.log('💰 Purchased credits added:', {
    amount,
    transactionId,
    newBalance: newTotal,
    totalPurchased: newPurchased
  });

  return {
    success: true,
    newBalance: newTotal,
    purchasedTotal: newPurchased
  };
}

/**
 * Get time until next daily credit refresh
 * @returns {object} { hours, minutes, timestamp }
 */
export function getTimeUntilRefresh() {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));

  const msUntilRefresh = tomorrow - now;
  const hours = Math.floor(msUntilRefresh / (1000 * 60 * 60));
  const minutes = Math.floor((msUntilRefresh % (1000 * 60 * 60)) / (1000 * 60));

  return {
    hours,
    minutes,
    timestamp: tomorrow.toISOString()
  };
}

/**
 * Get credit status summary
 */
export function getCreditStatus() {
  const credits = getCurrentCredits();
  const purchasedCredits = getPurchasedCredits();
  const welcomeUsed = hasUsedWelcomeCredits();
  const timeUntilRefresh = getTimeUntilRefresh();

  return {
    totalCredits: credits,
    freeCredits: credits - purchasedCredits,
    purchasedCredits,
    welcomeUsed,
    canAnalyze: credits >= CREDIT_CONFIG.COST_PER_ANALYSIS,
    timeUntilRefresh,
    isLowCredits: credits <= 2,
    isOutOfCredits: credits === 0
  };
}

/**
 * Reset credits (for testing/admin purposes only)
 */
export function resetCredits() {
  localStorage.removeItem(STORAGE_KEYS.CREDITS);
  localStorage.removeItem(STORAGE_KEYS.WELCOME_USED);
  localStorage.removeItem(STORAGE_KEYS.LAST_REFRESH);
  localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
  localStorage.removeItem(STORAGE_KEYS.PURCHASED_CREDITS);
  console.log('🔄 Credit system reset');
}

export const CREDIT_SYSTEM = {
  CONFIG: CREDIT_CONFIG,
  KEYS: STORAGE_KEYS
};
