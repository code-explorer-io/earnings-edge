# EarningsEdge Credit Management Tools

## Overview
Two HTML tools for managing and debugging the EarningsEdge credit system on any domain.

---

## Tools Available

### 1. check-credits.html (Comprehensive Diagnostic)
**Full-featured diagnostic and fix tool**

**Features:**
- 📊 Shows detailed credit status
- 🔧 Displays ALL localStorage keys and values
- ⚡ Quick action buttons for common fixes
- 📋 Manual console commands (copy/paste ready)
- ⚠️ Domain awareness (shows current domain)
- 🎨 Color-coded status (error/warning/success)

**Use when:**
- Debugging why credits show 0
- Need to see all stored data
- Want detailed status information
- Troubleshooting localStorage issues

**Actions available:**
- Set to 25 Credits
- Set to 10 Credits
- Force Daily Refresh (to 25)
- Clear All & Restart
- Refresh Status

---

### 2. reset-credits.html (Quick Manager)
**Simple, fast credit adjustment tool**

**Features:**
- 💰 Auto-refreshing credit display (updates every second)
- 🚀 Quick set buttons (25, 10, 5 credits)
- 🌅 Force daily refresh button
- 🗑️ Clear all data button
- 📝 Manual console commands

**Use when:**
- Need quick credit adjustment
- Testing with different credit amounts
- Want simple, fast interface
- Don't need detailed debugging info

---

## How to Use on Production

### Step 1: Upload to Production
```bash
# Upload ONE of these files to your production server:
frontend/check-credits.html
# OR
frontend/reset-credits.html

# Access at:
https://earningsedge.io/check-credits.html
# OR
https://earningsedge.io/reset-credits.html
```

### Step 2: Set Credits
1. Open the tool in your browser
2. Click "Set to 25 Credits" button
3. See success message
4. Refresh your main EarningsEdge app
5. Credits should now show 25

### Step 3: Verify
- Main app should show 25 credits
- Perform analysis to test deduction
- Should show 24 credits after analysis

---

## Technical Details

### Storage Keys Used
```javascript
earningsEdgeCredits          // Current credit balance
earningsEdgeSessionId        // Unique session identifier
earningsEdgeWelcomeUsed      // Whether welcome credits used
earningsEdgeLastRefresh      // Last daily refresh timestamp
earningsEdgePurchasedCredits // Purchased credits (future)
```

### Credit Configuration
```javascript
Welcome Credits: 10
Daily Credits:   25 (increased for testing)
Max Free:        25
Cost per Query:  1
```

---

## Common Issues & Solutions

### Issue: Credits show 0 on production
**Cause:** localStorage is domain-specific (localhost ≠ production)

**Solution:**
1. Use check-credits.html on production domain
2. Click "Set to 25 Credits"
3. Refresh main app

---

### Issue: Credits not updating after button click
**Cause:** Main app needs refresh to see localStorage changes

**Solution:**
- After setting credits in tool, refresh the MAIN app
- The tool shows "Now refresh your EarningsEdge app"

---

### Issue: Credits reset to 0 after refresh
**Cause:** Session not properly initialized

**Solution:**
1. Click "Clear All & Restart" in check-credits.html
2. Click "Set to 25 Credits"
3. Refresh main app

---

### Issue: Can't see localStorage keys
**Cause:** Tool not on same domain as main app

**Solution:**
- Tool MUST be on earningsedge.io (same domain as main app)
- check-credits.html shows current domain at top
- Upload to same server as main app

---

## Manual Console Commands

If you can't upload the HTML tools, use browser console:

### Set Credits to 25
```javascript
localStorage.setItem('earningsEdgeCredits', '25');
localStorage.setItem('earningsEdgeSessionId', `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
localStorage.setItem('earningsEdgeWelcomeUsed', 'false');
localStorage.setItem('earningsEdgeLastRefresh', new Date().toISOString());
localStorage.setItem('earningsEdgePurchasedCredits', '0');
location.reload();
```

### Check Current Credits
```javascript
localStorage.getItem('earningsEdgeCredits')
```

### View All Keys
```javascript
Object.keys(localStorage).filter(k => k.includes('earnings')).forEach(k => {
  console.log(k, ':', localStorage.getItem(k));
});
```

### Clear All Data
```javascript
localStorage.clear();
location.reload();
```

---

## Comparison: Which Tool to Use?

### Use check-credits.html when:
- ✅ Need full diagnostic information
- ✅ Want to see ALL localStorage keys
- ✅ Troubleshooting why credits aren't working
- ✅ Need color-coded status indicators
- ✅ Want detailed verification info

### Use reset-credits.html when:
- ✅ Just need to quickly set credits
- ✅ Want auto-refreshing display
- ✅ Prefer simpler, cleaner interface
- ✅ Testing with different credit amounts
- ✅ Don't need detailed debugging

**Recommendation:** Start with **check-credits.html** for first-time diagnosis, then use **reset-credits.html** for quick adjustments during testing.

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Verify code changes committed to GitHub
- [ ] Update CREDIT_CONFIG in creditManager.js (already set to 25)
- [ ] Build frontend for production
- [ ] Deploy to hosting (Vercel/Netlify/etc.)
- [ ] Upload check-credits.html OR reset-credits.html to same domain
- [ ] Access tool at https://earningsedge.io/check-credits.html
- [ ] Set credits to 25
- [ ] Refresh main app and verify 25 credits showing
- [ ] Test analysis to verify credit deduction works
- [ ] Verify daily refresh logic working

---

## File Locations

```
frontend/
├── check-credits.html      # Comprehensive diagnostic tool
├── reset-credits.html      # Quick credit manager
├── CREDIT-TOOLS-README.md  # This file
└── src/
    └── utils/
        └── creditManager.js # Credit system logic (DAILY_CREDITS: 25)
```

---

## Support

If issues persist after using both tools:

1. Check browser console (F12) for errors
2. Verify localStorage is enabled in browser settings
3. Try incognito/private browsing mode
4. Check if browser extensions are blocking localStorage
5. Verify you're on the correct production domain

---

## Summary

**Quick Fix:** Upload check-credits.html → Set to 25 → Refresh main app

**Both tools are production-ready and fully functional!**
