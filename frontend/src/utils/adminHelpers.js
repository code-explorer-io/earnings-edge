/**
 * Admin Testing Helpers for Credit System
 * Available in development mode via browser console
 */

import {
  CREDIT_SYSTEM,
  getCurrentCredits,
  getCreditStatus,
  checkAndRefreshDailyCredits,
  resetCredits as resetCreditsUtil
} from './creditManager';

/**
 * Reset credits to 10 welcome credits
 * Usage: window.resetCredits()
 */
export function resetCredits() {
  resetCreditsUtil();
  console.log('✅ Credits reset! Refresh page to get 10 welcome credits.');
  return {
    action: 'Credits reset',
    instruction: 'Refresh the page to see changes'
  };
}

/**
 * Set specific credit amount
 * Usage: window.setCredits(25)
 */
export function setCredits(amount) {
  if (typeof amount !== 'number' || amount < 0) {
    console.error('❌ Error: Amount must be a positive number');
    return { error: 'Invalid amount' };
  }

  localStorage.setItem(CREDIT_SYSTEM.KEYS.CREDITS, amount.toString());
  console.log(`✅ Credits set to ${amount}. Refresh page to see changes.`);

  return {
    action: 'Credits set',
    amount: amount,
    instruction: 'Refresh the page to see changes'
  };
}

/**
 * Simulate new day to trigger daily refresh
 * Usage: window.simulateNewDay()
 */
export function simulateNewDay() {
  // Set last refresh to yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  localStorage.setItem(CREDIT_SYSTEM.KEYS.LAST_REFRESH, yesterday.toISOString());
  localStorage.setItem(CREDIT_SYSTEM.KEYS.WELCOME_USED, 'true');

  // Trigger refresh
  const refreshed = checkAndRefreshDailyCredits();

  if (refreshed) {
    console.log('✅ Daily refresh simulated! 5 credits added.');
  } else {
    console.log('⚠️ Refresh triggered but no credits added (may be at cap).');
  }

  return {
    action: 'Daily refresh simulated',
    refreshed: refreshed,
    currentCredits: getCurrentCredits(),
    instruction: 'Refresh page to see changes'
  };
}

/**
 * View all session data
 * Usage: window.viewSession()
 */
export function viewSession() {
  const sessionId = localStorage.getItem(CREDIT_SYSTEM.KEYS.SESSION_ID);
  const credits = getCurrentCredits();
  const status = getCreditStatus();
  const allData = {
    sessionId,
    credits,
    welcomeUsed: localStorage.getItem(CREDIT_SYSTEM.KEYS.WELCOME_USED) === 'true',
    lastRefresh: localStorage.getItem(CREDIT_SYSTEM.KEYS.LAST_REFRESH),
    purchasedCredits: localStorage.getItem(CREDIT_SYSTEM.KEYS.PURCHASED_CREDITS),
    fullStatus: status
  };

  console.log('📊 Session Data:');
  console.table({
    'Session ID': allData.sessionId,
    'Total Credits': allData.credits,
    'Welcome Used': allData.welcomeUsed,
    'Last Refresh': allData.lastRefresh,
    'Purchased': allData.purchasedCredits
  });

  console.log('Full Status Object:', allData.fullStatus);

  return allData;
}

/**
 * Add purchased credits (simulate future feature)
 * Usage: window.addPurchasedCredits(50)
 */
export function addPurchasedCredits(amount) {
  if (typeof amount !== 'number' || amount < 1) {
    console.error('❌ Error: Amount must be a positive number');
    return { error: 'Invalid amount' };
  }

  const currentCredits = getCurrentCredits();
  const currentPurchased = parseInt(localStorage.getItem(CREDIT_SYSTEM.KEYS.PURCHASED_CREDITS) || '0');

  const newTotal = currentCredits + amount;
  const newPurchased = currentPurchased + amount;

  localStorage.setItem(CREDIT_SYSTEM.KEYS.CREDITS, newTotal.toString());
  localStorage.setItem(CREDIT_SYSTEM.KEYS.PURCHASED_CREDITS, newPurchased.toString());

  console.log(`✅ Added ${amount} purchased credits!`);
  console.log(`💰 New balance: ${newTotal} (${newPurchased} purchased)`);

  return {
    action: 'Purchased credits added',
    amount: amount,
    newTotal: newTotal,
    totalPurchased: newPurchased,
    instruction: 'Refresh page to see changes'
  };
}

/**
 * Simulate using welcome credits
 * Usage: window.useWelcomeCredits()
 */
export function useWelcomeCredits() {
  localStorage.setItem(CREDIT_SYSTEM.KEYS.CREDITS, '0');
  localStorage.setItem(CREDIT_SYSTEM.KEYS.WELCOME_USED, 'true');
  localStorage.setItem(CREDIT_SYSTEM.KEYS.LAST_REFRESH, new Date().toISOString());

  console.log('✅ Welcome credits marked as used. You now get 5 daily credits.');
  console.log('💡 Use simulateNewDay() to add daily credits');

  return {
    action: 'Welcome credits used',
    credits: 0,
    welcomeUsed: true,
    instruction: 'Refresh page or use simulateNewDay() to get daily credits'
  };
}

/**
 * Show all available admin commands
 * Usage: window.creditHelp()
 */
export function creditHelp() {
  const commands = {
    'resetCredits()': 'Reset to 10 welcome credits (new user)',
    'setCredits(n)': 'Set credits to specific amount',
    'simulateNewDay()': 'Trigger daily credit refresh (add 5 credits)',
    'viewSession()': 'View all session data and localStorage',
    'addPurchasedCredits(n)': 'Simulate purchasing credits (future feature)',
    'useWelcomeCredits()': 'Mark welcome credits as used, switch to daily mode',
    'creditHelp()': 'Show this help message'
  };

  console.log('🛠️ Credit System Admin Commands\n');
  console.log('Available commands:');
  Object.entries(commands).forEach(([cmd, desc]) => {
    console.log(`  ${cmd.padEnd(30)} - ${desc}`);
  });
  console.log('\nExample: window.setCredits(25)');

  return commands;
}

/**
 * Initialize admin helpers in window object (dev mode only)
 */
export function initializeAdminHelpers() {
  if (import.meta.env.MODE === 'development') {
    window.resetCredits = resetCredits;
    window.setCredits = setCredits;
    window.simulateNewDay = simulateNewDay;
    window.viewSession = viewSession;
    window.addPurchasedCredits = addPurchasedCredits;
    window.useWelcomeCredits = useWelcomeCredits;
    window.creditHelp = creditHelp;

    console.log('🛠️ Credit System Admin Helpers Loaded');
    console.log('Type window.creditHelp() for available commands');
  }
}
