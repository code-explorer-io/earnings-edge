# Production Credit System Fix Guide

## Problem Summary
Credits showing **0 on earningsedge.io** (production) despite being set to 25 on localhost.

## Root Cause
**localStorage is domain-specific** (security feature):
- `localhost:5173` has its own localStorage (25 credits)
- `earningsedge.io` has separate localStorage (0 credits)
- Code changes committed to GitHub but **not yet deployed to production**

---

## Solution Options

### Option 1: Quick Fix - Use Diagnostic Tool on Production (FASTEST)

1. **Upload the diagnostic tool to production:**
   ```bash
   # Upload frontend/check-credits.html to your production server
   # Access it at: https://earningsedge.io/check-credits.html
   ```

2. **Use the tool to set credits:**
   - Open `https://earningsedge.io/check-credits.html`
   - Click "Set to 25 Credits" button
   - Refresh the main EarningsEdge app
   - Credits should now show 25

3. **Features of the diagnostic tool:**
   - Shows current credit status
   - Displays all localStorage keys
   - Can set credits to any amount (25, 10, 5)
   - Force daily refresh to 25 credits
   - Clear all data and restart
   - Provides manual console commands

---

### Option 2: Manual Console Fix (NO DEPLOYMENT NEEDED)

1. **Open production site in browser:**
   ```
   https://earningsedge.io
   ```

2. **Open browser console (F12)**

3. **Run these commands:**
   ```javascript
   // Set credits to 25
   localStorage.setItem('earningsEdgeCredits', '25');

   // Initialize system if needed
   if (!localStorage.getItem('earningsEdgeSessionId')) {
     const sessionId = `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
     localStorage.setItem('earningsEdgeSessionId', sessionId);
     localStorage.setItem('earningsEdgeWelcomeUsed', 'false');
     localStorage.setItem('earningsEdgeLastRefresh', new Date().toISOString());
     localStorage.setItem('earningsEdgePurchasedCredits', '0');
   }

   // Reload page
   location.reload();
   ```

---

### Option 3: Deploy GitHub Changes to Production (PERMANENT FIX)

**This is the permanent solution that includes:**
- DAILY_CREDITS: 25 (increased from 5)
- MAX_FREE_CREDITS: 25 (increased from 10)

**Steps:**
1. Verify changes are committed to GitHub (✅ Already done)
2. Deploy to production (Vercel/Netlify/etc.)
3. New users will automatically get 25 daily credits
4. Existing sessions still need manual credit reset (use Option 1 or 2)

---

## Verification

After applying the fix, verify credits are showing correctly:

1. **Check credit display:**
   - Open https://earningsedge.io
   - Look for credit counter in UI
   - Should show **25 credits**

2. **Test analysis:**
   - Perform an analysis
   - Credits should deduct by 1
   - Should show **24 credits remaining**

3. **Check localStorage (console):**
   ```javascript
   localStorage.getItem('earningsEdgeCredits')  // Should return "25"
   ```

---

## Files Created

### 1. `frontend/check-credits.html`
Comprehensive diagnostic and fix tool:
- Domain-aware (works on any domain)
- Shows detailed credit status
- Interactive buttons for quick fixes
- Displays all localStorage keys
- Provides manual console commands

### 2. `frontend/reset-credits.html`
Simpler credit manager:
- Auto-refreshing display
- Quick action buttons
- Force daily refresh
- Clear all data

---

## Understanding localStorage Domain Isolation

**Why this happened:**
- Browser security feature
- Each domain gets its own localStorage
- localhost:5173 ≠ earningsedge.io
- Data doesn't sync between domains
- Must set credits separately on each domain

**This is normal behavior** and prevents websites from accessing each other's data.

---

## Recommended Workflow

1. **Immediate Fix** (Option 1 or 2): Set credits on production RIGHT NOW
2. **Long-term Fix** (Option 3): Deploy code changes when ready
3. **Future Testing**: Use diagnostic tool on production for quick credit adjustments

---

## Support

If credits still show 0 after trying these options:

1. **Check browser console for errors:**
   - Open F12 developer tools
   - Look for red errors
   - Check if localStorage is enabled

2. **Try incognito/private browsing:**
   - Rules out browser extension conflicts
   - Fresh localStorage state

3. **Verify domain:**
   - Make sure you're on https://earningsedge.io
   - Not a subdomain or different environment

4. **Check localStorage permissions:**
   - Some browsers block localStorage in certain modes
   - Ensure cookies/storage are enabled

---

## Summary

**Fastest solution:** Upload `check-credits.html` to production and use it to set credits to 25.

**Most permanent solution:** Deploy GitHub changes to production.

**Both tools are ready to use and fully functional!**
