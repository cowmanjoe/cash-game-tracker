# Design Specification: Payment Recording Feature

## Overview
Add payment recording functionality to the Cash Game Tracker frontend, allowing users to record player-to-player payments during a game. This feature will integrate with the existing backend payment API and provide an intuitive interface for tracking debt settlements.

## Current State
- Backend fully supports payments as a third transfer type (alongside BUY_IN and CASH_OUT)
- Backend API endpoint exists: `POST /game/{id}/payment`
- Payment model includes: `id`, `accountId`, `amount`, `createTime`, and `side` (PAYER or RECIPIENT)
- Frontend TypeScript types exist for `Payment` interface
- Payments are included in the game state but have no UI to create, view, or edit them
- Transfer table displays BUY_IN and CASH_OUT but not PAYMENT transfers

## Proposed State
- Users can record payments from the main game page via a "Record Payment" button
- Payment creation automatically calculates the recommended payment amount (what the user owes)
- Payments appear in the transfers list alongside buy-ins and cash-outs
- Users can click on payments to view details
- Users can edit payment amounts
- Users can cancel/delete payments
- Clear visual distinction between payments and other transfer types

---

## User Stories

### Epic 1: Payment Creation

#### US-1.1: Access Payment Recording
**As a** game participant
**I want to** see a "Record Payment" button on the main game page
**So that** I can easily record when I pay another player

**Acceptance Criteria:**
- "Record Payment" button is visible on the main game page (app/game/[gameId]/page.tsx)
- Button is styled consistently with existing action buttons (blue-500 with hover)
- Button is only visible to authenticated users who are participants in the game
- Clicking the button navigates to the payment creation form
- Button is prominently placed near other game actions (add buy-in, cash out)

#### US-1.2: Smart Payment Amount Default
**As a** game participant
**I want to** have the payment amount pre-filled with what I owe
**So that** I don't have to manually calculate my debt

**Acceptance Criteria:**
- When creating a payment, system fetches current user's balance
- If balance is negative (user owes money), amount defaults to absolute value of balance
- If balance is zero or positive, amount defaults to 0 (or blank)
- User can override the default amount
- Amount is displayed in dollars with 2 decimal places
- System uses current session to determine the user's accountId

#### US-1.3: Select Payment Side
**As a** game participant making a payment
**I want to** specify whether I'm paying or receiving from the house
**So that** my balance is adjusted correctly

**Acceptance Criteria:**
- Payment form includes selection for payment side (PAYER or RECIPIENT)
- PAYER option: "I am paying the house" (reduces negative balance)
- RECIPIENT option: "I am receiving from the house" (reduces positive balance)
- Default selection based on current balance:
  - If balance is negative: default to PAYER
  - If balance is positive: default to RECIPIENT
- Clear labels explain what each option means
- Selection is required to submit the form

#### US-1.4: Submit Payment
**As a** game participant
**I want to** submit a payment after entering the details
**So that** it's recorded in the game

**Acceptance Criteria:**
- Form validates amount is greater than 0
- Form validates payment side is selected
- Submission creates one payment record via backend API:
  - accountId: current user's account
  - amount: entered amount
  - side: PAYER or RECIPIENT
- Success redirects back to main game page
- Error messages display clearly if submission fails
- Loading state prevents duplicate submissions

---

### Epic 2: Payment Display

#### US-2.1: Show Payments in Transfer List
**As a** game participant
**I want to** see payments in the transfer list
**So that** I can view all financial activity in one place

**Acceptance Criteria:**
- Transfer table includes PAYMENT type rows
- Payment rows show:
  - Type: "PAYMENT" with side indicator (PAYER or RECIPIENT)
  - Amount with $ prefix
  - Player name who made the payment
- Payments are sorted chronologically with other transfers
- Visual distinction from buy-ins and cash-outs (color or icon)

#### US-2.2: Payment Visual Styling
**As a** game participant
**I want to** easily distinguish payments from buy-ins and cash-outs
**So that** I can quickly understand the transfer list

**Acceptance Criteria:**
- Payments use distinct styling/color (e.g., purple or orange instead of blue/green)
- Icon or symbol indicates payment type
- Clear text indicates side: "PAYMENT (PAYER)" or "PAYMENT (RECIPIENT)"
- Amount color:
  - Red for PAYER (paying the house)
  - Green for RECIPIENT (receiving from the house)
- Styling is consistent with existing Tailwind CSS patterns

#### US-2.3: Navigate to Payment Details
**As a** game participant
**I want to** click on a payment in the transfer list
**So that** I can see full details

**Acceptance Criteria:**
- Payment rows in transfer table are clickable
- Click navigates to payment detail page: `/game/{gameId}/payment/{paymentId}`
- Navigation is consistent with existing buy-in/cash-out pattern
- Hover state indicates row is clickable

---

### Epic 3: Payment Management

#### US-3.1: View Payment Details
**As a** game participant
**I want to** view full details of a payment
**So that** I can verify the transaction information

**Acceptance Criteria:**
- Payment detail page shows:
  - Player name (accountId)
  - Side (PAYER or RECIPIENT)
  - Amount (formatted with $ and 2 decimals)
  - Timestamp (formatted date and time)
  - Payment ID
- Page shows "Back" button to return to game
- Page shows "Edit" button if user created the payment
- Page shows "Cancel" button if user created the payment
- Layout is consistent with buy-in detail page

#### US-3.2: Edit Payment Amount
**As a** payment creator
**I want to** edit the payment amount
**So that** I can correct mistakes

**Acceptance Criteria:**
- "Edit" button navigates to edit form: `/game/{gameId}/payment/{paymentId}/edit`
- Edit form shows current amount pre-filled
- User can modify amount
- Amount must be greater than 0
- Submission updates the payment record
- Success redirects to payment detail page
- Error messages display if update fails
- Only the payment creator can access edit functionality
- Edit form matches styling of buy-in edit form

#### US-3.3: Cancel Payment
**As a** payment creator
**I want to** cancel a payment
**So that** I can remove incorrect transactions

**Acceptance Criteria:**
- "Cancel" button appears on payment detail page
- Button is styled as destructive action (red-500)
- Clicking shows confirmation dialog
- Confirmation shows payment amount and side
- Confirming deletion removes the payment record
- Success redirects to main game page
- Balances update to reflect cancellation
- Only the payment creator can cancel a payment
- Error handling if cancellation fails

---

### Epic 4: Balance Integration

#### US-4.1: Real-time Balance Updates
**As a** game participant
**I want to** see my balance update immediately after recording a payment
**So that** I know my current financial position

**Acceptance Criteria:**
- Creating a payment updates balances in real-time
- Payer's balance increases (less negative or more positive)
- Recipient's balance decreases (less positive or more negative)
- Balance page reflects changes immediately after payment creation
- Transfer list shows new payment without manual refresh
- Server-side balance calculation includes payments

#### US-4.2: Payment Impact on Settlement Calculation
**As a** game participant
**I want to** payments to reduce what I owe or am owed
**So that** final settlements are accurate

**Acceptance Criteria:**
- Payments adjust balances correctly
- Balance calculation includes:
  - Buy-ins (positive for player)
  - Cash-outs (negative for player)
  - Payments as PAYER (positive for player - reduces debt to house)
  - Payments as RECIPIENT (negative for player - reduces what house owes)
- Final balance accurately reflects all transfers
- Zero balance means player is settled
- Negative balance means player owes money to the house
- Positive balance means the house owes player money

---

## Technical Considerations

### Frontend Changes Needed

#### New Pages/Components
1. **Payment Creation Form** (`app/game/[gameId]/add-payment/page.tsx` and `form.tsx`)
   - Payment side selector (PAYER or RECIPIENT)
   - Amount input (pre-filled with smart default)
   - Submit button
   - Error handling
   - Server action integration

2. **Payment Detail Page** (`app/game/[gameId]/payment/[paymentId]/page.tsx`)
   - Display payment information
   - Back, Edit, Cancel buttons
   - Permission checks (only payer can edit/cancel)

3. **Payment Edit Form** (`app/game/[gameId]/payment/[paymentId]/edit/page.tsx` and `form.tsx`)
   - Amount input with current value
   - Update server action
   - Error handling

4. **Payment Delete Confirmation** (modal or separate page)
   - Confirmation dialog
   - Delete server action

#### Updated Components
1. **Transfer Table** (`app/game/transfer-table.tsx`)
   - Add support for PAYMENT type display
   - Show payment side (PAYER or RECIPIENT)
   - Visual styling for payments (color coding)
   - Click navigation to payment detail

2. **Main Game Page** (`app/game/[gameId]/page.tsx`)
   - Add "Record Payment" button
   - Button positioning and styling

#### API Client Updates (`app/lib/game-client.ts`)
```typescript
// Add new functions:
async function addPayment(gameId: string, accountId: string, amount: string, side: 'PAYER' | 'RECIPIENT')
async function updatePayment(gameId: string, paymentId: string, amount: string)
async function deletePayment(gameId: string, paymentId: string)
async function getPayment(gameId: string, paymentId: string)
```

#### Type Updates (`app/lib/game.ts`)
- Fix Payment interface: change `accountid` to `accountId` for consistency
- Ensure Transfer type properly includes PAYMENT

### Backend Considerations

#### Existing API Endpoints (Already Implemented)
- `POST /game/{id}/payment` - Creates a payment (expects accountId, amount, side)
- `GET /game/{id}` - Returns game with payments array
- `GET /game/{id}/transfers` - Returns all transfers including payments

#### Required New API Endpoints
These endpoints need to be added to the backend GameController:
- `GET /game/{gameId}/payment/{paymentId}` - Retrieve single payment details
- `PUT /game/{gameId}/payment/{paymentId}` - Update payment amount
- `DELETE /game/{gameId}/payment/{paymentId}` - Delete payment

### Data Flow

#### Creating a Payment
1. User clicks "Record Payment" button
2. System fetches user's current balance from `/game/{id}/balances`
3. Form loads with smart default amount and side:
   - If balance is negative: default side = PAYER, amount = abs(balance)
   - If balance is positive: default side = RECIPIENT, amount = balance
4. User confirms/adjusts amount and side
5. Submit creates ONE payment record via API:
   ```typescript
   POST /game/{gameId}/payment
   {
     accountId: currentUser.accountId,
     amount: "50.00",
     side: "PAYER"  // or "RECIPIENT"
   }
   ```
6. Redirect to game page showing updated transfers

#### Displaying Payments in Transfer List
1. Fetch transfers via `GET /game/{id}/transfers`
2. Display payment transfers:
   - Show type as "PAYMENT (PAYER)" or "PAYMENT (RECIPIENT)"
   - Show player name from accountId
   - Show amount
3. Style based on side:
   - Red for PAYER (paying the house)
   - Green for RECIPIENT (receiving from the house)

### UI/UX Patterns

#### Consistent with Existing Patterns
- Full-page navigation (not modals) for create/edit forms
- Server actions with `useActionState` for form handling
- Tailwind CSS styling matching existing buttons/forms
- Blue buttons for primary actions, red for destructive
- Error messages below forms in red text
- Loading states to prevent duplicate submissions

#### Navigation Structure
```
/game/{gameId}
├── page.tsx (main game view with "Record Payment" button)
├── add-payment/
│   ├── page.tsx (container)
│   └── form.tsx (payment creation form)
└── payment/
    └── [paymentId]/
        ├── page.tsx (detail view)
        └── edit/
            ├── page.tsx (container)
            └── form.tsx (edit form)
```

---

## Out of Scope (Future Enhancements)

- Payment descriptions/notes
- Payment attachments (photos of Venmo/Cash App receipts)
- Suggesting who to pay based on balances
- Partial payments (paying less than full balance)
- Payment history filtering/sorting
- Bulk payment operations
- Payment notifications
- Offline payment recording

---

## Design Decisions

1. **House Payment Model:** Payments are single records representing transactions with "the house" (not player-to-player)
   - PAYER = payment TO the house (reduces player's negative balance)
   - RECIPIENT = payment FROM the house (reduces player's positive balance)
2. **Smart Defaults:** Pre-fill payment amount with current debt to reduce user effort
3. **Creator Controls:** Only the person who created the payment can edit or cancel it
4. **Full-Page Forms:** Continue existing pattern of full-page navigation rather than modals
5. **Visual Distinction:** Use distinct color (suggest purple/orange) for payments in transfer list
6. **Integrated Display:** Show payments inline with other transfers rather than separate section

## Open Questions

None remaining - key clarifications received:
- Backend needs GET/PUT/DELETE endpoints (to be added in Phase 0)
- Payments are single records to/from "the house" (not player-to-player)
- No additional validation needed initially
- Frontend Payment interface needs `accountid` → `accountId` fix

## Success Metrics

- Users can create payments from the main game page
- Payment amount defaults correctly based on balance
- Payments appear in transfer list with clear styling
- Users can edit payment amounts
- Users can cancel payments
- Balances update correctly after payment operations
- UI is consistent with existing design patterns
- No errors in payment creation/update/deletion flow
- Backend API integration works correctly

---

## Implementation Phases

### Phase 0: Backend API Endpoints
- Add `GET /game/{gameId}/payment/{paymentId}` endpoint
- Add `PUT /game/{gameId}/payment/{paymentId}` endpoint
- Add `DELETE /game/{gameId}/payment/{paymentId}` endpoint
- Test endpoints with existing payment data

### Phase 1: TypeScript Type Fix
- Fix Payment interface: `accountid` → `accountId` in app/lib/game.ts

### Phase 2: Display (Read-Only)
- Update transfer table to show PAYMENT type
- Add visual styling for payments (color coding by side)
- Show payment side (PAYER or RECIPIENT)
- Navigate to payment detail page (view only)

### Phase 3: Creation
- Add "Record Payment" button to game page
- Create payment form with side selection (PAYER/RECIPIENT)
- Implement smart amount and side defaulting based on balance
- Submit payment via API
- Update game state

### Phase 4: Management
- Add Edit functionality to payment detail page
- Add Cancel functionality with confirmation
- Implement PUT/DELETE API calls
- Update error handling

### Phase 5: Polish
- Refine visual styling
- Add loading states
- Improve error messages
- Test edge cases (zero balance, multiple payments, etc.)
