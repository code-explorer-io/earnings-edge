# Credit System Documentation

## Overview

EarningsEdge uses a credit-based system to manage usage of the trading insights tool. This infrastructure is built to support future Coinbase Commerce integration for purchasing credits.

## Credit Model

### Welcome Credits
- **Amount**: 10 credits (one-time)
- **For**: New users on first visit
- **Purpose**: Try the platform risk-free

### Daily Free Credits
- **Amount**: 5 credits per day
- **When**: After welcome credits are used up
- **Reset**: Midnight UTC every day
- **Cap**: Maximum 10 free credits at any time

### Purchased Credits (Coming Soon)
- **Expiration**: Never expire
- **Payment**: Coinbase Commerce (crypto payments)
- **Stacks**: Add to your free credits
- **Pricing**: TBD

## Cost Structure

| Action | Cost |
|--------|------|
| Analyze transcripts | 1 credit |
| View results | Free |
| Export CSV | Free |
| Use calculator | Free |

## User Experience Flow

### New User Journey
1. **First Visit**
   - System detects new user (no localStorage data)
   - Grants 10 welcome credits
   - Shows welcome modal explaining credit system
   - User can analyze up to 10 companies

2. **After Welcome Credits**
   - When credits hit 0, `welcomeUsed` flag is set
   - Next day at midnight UTC: receive 5 daily credits
   - Pattern continues: 5 credits daily, max 10 total

### Existing User Journey
1. **Daily Check**
   - On app load, system checks if new UTC day
   - If yes + welcomeUsed = true: add 5 daily credits
   - Credits capped at 10 free (excluding purchased)

2. **Low Credit Warnings**
   - At 2 credits: "Low on Credits" modal appears
   - At 0 credits: "Out of Credits" modal with countdown timer

## Technical Implementation

### Storage Keys (localStorage)

```javascript
{
  'earningsEdgeCredits': 10,              // Current balance
  'earningsEdgeWelcomeUsed': false,       // Has used welcome bonus?
  'earningsEdgeLastRefresh': '2025-10-31T00:00:00.000Z', // Last refresh timestamp
  'earningsEdgeSessionId': 'edge_1698765432123_abc123',  // Unique user ID
  'earningsEdgePurchasedCredits': 0       // Purchased credits (future)
}
```

### Core Functions

Located in: `frontend/src/utils/creditManager.js`

#### `initializeCreditSystem()`
- Checks if new user
- Sets up initial credits and session ID
- Returns credit info

```javascript
const { credits, isNewUser, sessionId } = initializeCreditSystem();
```

#### `checkAndRefreshDailyCredits()`
- Compares current date to last refresh date (UTC)
- Adds 5 credits if new day + welcome used
- Updates lastRefresh timestamp

```javascript
const refreshed = checkAndRefreshDailyCredits();
```

#### `deductCredits(amount)`
- Deducts credits for analysis
- Marks welcome as used if balance hits 0
- Returns success status and remaining balance

```javascript
const result = deductCredits(1);
// { success: true, remainingCredits: 9, message: '...' }
```

#### `getCurrentCredits()`
- Gets current credit balance
- Returns integer

```javascript
const credits = getCurrentCredits(); // 10
```

#### `getCreditStatus()`
- Comprehensive credit information
- Includes refresh countdown

```javascript
const status = getCreditStatus();
// {
//   totalCredits: 10,
//   freeCredits: 10,
//   purchasedCredits: 0,
//   welcomeUsed: false,
//   canAnalyze: true,
//   timeUntilRefresh: { hours: 5, minutes: 32 },
//   isLowCredits: false,
//   isOutOfCredits: false
// }
```

#### `addPurchasedCredits(amount, transactionId)`
- For future Coinbase Commerce integration
- Adds purchased credits to balance
- Tracks purchased vs free credits separately

```javascript
const result = addPurchasedCredits(50, 'charge_abc123');
// { success: true, newBalance: 60, purchasedTotal: 50 }
```

## Components

### CreditCounter
**Location**: `frontend/src/components/CreditCounter.jsx`

**Features**:
- Displays current credit balance in header
- Color-coded: Green (>5), Yellow (3-5), Orange (1-2), Red (0)
- Animated icon with pulse effect
- Hover tooltip with detailed breakdown
- Real-time countdown to next refresh

**Props**:
```javascript
<CreditCounter
  onCreditUpdate={(credits, status) => {}}
  darkMode={true}
/>
```

### CreditWarningModal
**Location**: `frontend/src/components/CreditWarningModal.jsx`

**Features**:
- Three modal types: `welcome`, `low-credits`, `no-credits`
- Real-time countdown timer
- Tips and usage suggestions
- Dark/light mode support

**Props**:
```javascript
<CreditWarningModal
  isOpen={true}
  onClose={() => {}}
  warningType="low-credits"
  darkMode={true}
/>
```

## Future: Coinbase Commerce Integration

### Planned Features

1. **Purchase Flow**
   - "Buy Credits" button when out of credits
   - Credit bundles: 50, 100, 250, 500
   - Crypto payments via Coinbase Commerce
   - Instant credit delivery after confirmation

2. **Pricing Strategy** (TBD)
   - Volume discounts
   - Special promotions
   - Referral bonuses

3. **Purchase Tracking**
   - Transaction history
   - Receipt emails
   - Refund handling

### Implementation Notes

```javascript
// Future purchase function
async function purchaseCreditBundle(bundleSize) {
  // 1. Create Coinbase Commerce charge
  const charge = await createCommerceCharge({
    amount: bundleSize,
    currency: 'USD',
    name: `${bundleSize} EarningsEdge Credits`,
    description: 'Trading insights credits that never expire'
  });

  // 2. Redirect to payment
  window.location.href = charge.hosted_url;

  // 3. Webhook handles credit delivery after payment
  // See: /api/webhooks/coinbase-commerce
}
```

## Testing & Development

### Reset Credits (Development)
```javascript
import { resetCredits } from './utils/creditManager';

// Reset entire credit system
resetCredits();
// Clears all localStorage keys
// Next page load = new user with 10 welcome credits
```

### Test Scenarios

1. **New User**
   - Clear localStorage
   - Refresh app
   - Should see welcome modal + 10 credits

2. **Daily Refresh**
   - Set `earningsEdgeLastRefresh` to yesterday
   - Set `earningsEdgeCredits` to 2
   - Set `earningsEdgeWelcomeUsed` to true
   - Refresh app
   - Should get 5 more credits (total = 7)

3. **Out of Credits**
   - Set `earningsEdgeCredits` to 0
   - Try to analyze
   - Should see "Out of Credits" modal

4. **Low Credits**
   - Set `earningsEdgeCredits` to 2
   - Analyze once (1 credit left)
   - Should see "Low Credits" warning

## Analytics & Monitoring

### Key Metrics to Track

1. **User Behavior**
   - Average analyses per day
   - Welcome credit conversion rate
   - Daily active users vs returning users

2. **Credit Usage**
   - Peak usage times
   - Average credits used per session
   - Credit exhaustion patterns

3. **Future Revenue (Post-Commerce)**
   - Conversion rate to paid
   - Average purchase size
   - Lifetime value per user

### Logging

All credit operations log to console:
```javascript
✨ New user initialized with 10 welcome credits
🌅 New day detected! Added 5 daily credits
👋 Welcome credits used up! Daily credits will refresh tomorrow
💰 Purchased credits added: { amount: 50, transactionId: '...', ... }
```

## Security Considerations

### Current (Client-Side)
- localStorage can be manipulated by users
- Acceptable for free tier (low risk)
- No sensitive data stored

### Future (Server-Side)
When adding purchases:
- Store credit balance server-side
- Use JWT or session authentication
- Validate purchases via Coinbase webhook
- Rate limiting on API endpoints
- Fraud detection for unusual patterns

## FAQ

**Q: What happens if I clear my browser data?**
A: You'll be treated as a new user with 10 welcome credits.

**Q: Can I use the tool across multiple devices?**
A: Currently no (localStorage is per-browser). Future: account system with sync.

**Q: What timezone is used for daily refresh?**
A: UTC (Coordinated Universal Time) for consistency worldwide.

**Q: Will purchased credits ever expire?**
A: No, purchased credits never expire.

**Q: Can I gift credits to someone?**
A: Not yet, but planned for future release.

## Changelog

### Version 1.0.0 (Current)
- ✅ Welcome credits (10)
- ✅ Daily free credits (5)
- ✅ Credit counter in header
- ✅ Low/out of credits modals
- ✅ Midnight UTC refresh
- ✅ localStorage persistence
- 🚧 Coinbase Commerce (coming soon)

---

**Built for**: EarningsEdge Trading Insights
**Infrastructure**: Ready for Coinbase Commerce integration
**Status**: Production Ready
