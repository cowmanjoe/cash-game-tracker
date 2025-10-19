# Design Specification: User Authentication & Account Management

## Overview
Add user authentication to the Cash Game Tracker application, allowing users to create accounts, sign in, and participate in games using their registered account with a persistent nickname.

## Current State
- Users enter a nickname when creating or joining a game
- No persistent user accounts
- No authentication mechanism
- Account entities exist but are created ad-hoc per game with a nickname

## Proposed State
- Users can register with email, nickname, and password
- Users can sign in before creating/joining games
- Authenticated users automatically use their account's nickname (changeable)
- Nicknames can collide between different users (not unique globally)
- Session management tracks authenticated users
- Users can see a list of games they've joined on the home page

---

## User Stories

### Epic 1: Account Registration

#### US-1.1: User Registration
**As a** new user
**I want to** create an account with email, nickname, and password
**So that** I can have a persistent identity across multiple games

**Acceptance Criteria:**
- User can access a registration page
- User must provide:
  - Email address (unique, valid format)
  - Nickname (3-50 characters, not globally unique)
  - Password (minimum 8 characters)
- System validates email format
- System validates email uniqueness (must be unique)
- Nickname does not need to be unique (can collide with other users)
- System securely hashes password before storage
- User receives confirmation after successful registration
- Invalid submissions show clear error messages

#### US-1.2: Email Validation
**As a** new user
**I want to** receive feedback on my email format
**So that** I know if my email is valid

**Acceptance Criteria:**
- System validates email format on client side
- System validates email format on server side
- Email must be unique in the system
- Clear error message if email already exists
- Clear error message if email format is invalid
- Nickname can be the same as other users' nicknames (no uniqueness check)

#### US-1.3: Password Requirements
**As a** new user
**I want to** understand password requirements
**So that** I can create a secure password

**Acceptance Criteria:**
- Password must be at least 8 characters
- Password requirements displayed on registration form
- Password is hashed using bcrypt or similar before storage
- Password is never stored in plain text
- Password field uses type="password" (masked input)

---

### Epic 2: User Authentication

#### US-2.1: User Sign In
**As a** registered user
**I want to** sign in with my email and password
**So that** I can access my account

**Acceptance Criteria:**
- User can access a sign-in page
- User provides email and password
- System validates credentials
- Successful sign-in creates a session
- Session is stored securely (httpOnly cookie)
- User is redirected to home/dashboard after sign-in
- Failed sign-in shows clear error message
- Error message doesn't reveal which field is incorrect (security)

#### US-2.2: User Sign Out
**As a** signed-in user
**I want to** sign out of my account
**So that** I can end my session securely

**Acceptance Criteria:**
- User can access sign-out functionality from any page
- Sign-out clears the session cookie
- Sign-out redirects to sign-in or home page
- User cannot access authenticated features after sign-out

#### US-2.3: Session Persistence
**As a** signed-in user
**I want to** stay signed in across page refreshes
**So that** I don't have to sign in repeatedly

**Acceptance Criteria:**
- Session persists across page refreshes
- Session expires after 7 days of inactivity
- Session cookie is httpOnly and secure
- Expired sessions redirect to sign-in page

---

### Epic 3: Authenticated Game Creation

#### US-3.1: Create Game While Authenticated
**As a** signed-in user
**I want to** create a new game without entering a nickname
**So that** I can quickly start a game using my account's nickname

**Acceptance Criteria:**
- Authenticated users bypass nickname entry when creating a game
- System automatically uses the user's account nickname
- Game is created and user is added as the host
- User is redirected to the game page
- Game session links to user's account

#### US-3.2: Create Game While Unauthenticated
**As an** unauthenticated user
**I want to** still be able to create a game with a nickname
**So that** I can use the app without registering

**Acceptance Criteria:**
- Unauthenticated users see the existing nickname flow
- Nickname is required for unauthenticated users
- Temporary account is created as before
- User can play the game normally
- App suggests creating an account (optional banner/message)

---

### Epic 4: Authenticated Game Joining

#### US-4.1: Join Game While Authenticated
**As a** signed-in user
**I want to** join an existing game without entering a nickname
**So that** I can quickly join using my account's nickname

**Acceptance Criteria:**
- Authenticated users bypass nickname entry when joining a game
- System automatically uses the user's account nickname
- User is added to the game
- User is redirected to the game page
- Can join game even if nickname collides with another player (nicknames are not unique)

#### US-4.2: Join Game While Unauthenticated
**As an** unauthenticated user
**I want to** still be able to join a game with a nickname
**So that** I can participate without registering

**Acceptance Criteria:**
- Unauthenticated users see the existing nickname flow
- Nickname is required for unauthenticated users
- Temporary account is created as before
- User can play the game normally
- App suggests creating an account (optional banner/message)

#### US-4.3: Prevent Duplicate Account in Same Game
**As a** signed-in user
**I want to** be prevented from joining a game I'm already in
**So that** I don't create duplicate entries

**Acceptance Criteria:**
- System checks if the authenticated user's account is already in the game
- If account already exists in game, show error message
- User cannot join the game again
- Error message indicates the user is already in this game
- Nickname collisions are allowed (different users with same nickname can be in the same game)

---

### Epic 5: Game List & Navigation

#### US-5.1: View My Games List
**As a** signed-in user
**I want to** see a list of games I've joined on the home page
**So that** I can easily navigate to my active games

**Acceptance Criteria:**
- Home page displays a list of games the authenticated user has joined
- Each game shows: Game ID, date created, number of players
- Games are sorted by most recent activity/creation date
- Clicking a game navigates to that game's page
- Empty state message shown if user has no games
- List only shows when user is authenticated

#### US-5.2: Navigate to Game from List
**As a** signed-in user
**I want to** click on a game in my list
**So that** I can quickly return to a game I'm participating in

**Acceptance Criteria:**
- Each game in the list is clickable
- Clicking navigates to the game details page
- Navigation preserves the user's session
- User sees their balance and transactions for that game

---

### Epic 6: Navigation & UI

#### US-6.1: Authentication Navigation
**As a** user
**I want to** easily navigate between sign-in and registration
**So that** I can access the appropriate form

**Acceptance Criteria:**
- Link to sign-in from registration page
- Link to registration from sign-in page
- Clear navigation from home page to sign-in/registration
- Authenticated users see "Sign Out" instead of "Sign In"
- Header/navigation shows current authentication state

#### US-6.2: User Profile Display
**As a** signed-in user
**I want to** see my nickname displayed in the navigation
**So that** I know I'm signed in

**Acceptance Criteria:**
- Nickname is displayed in header/navigation when signed in
- Clear visual indication of signed-in state
- Nickname links to profile or shows dropdown menu

#### US-6.3: Protected Routes
**As a** developer
**I want to** protect certain routes that require authentication
**So that** unauthenticated users are redirected appropriately

**Acceptance Criteria:**
- Authenticated routes redirect to sign-in if not authenticated
- After sign-in, user is redirected to originally requested page
- Public routes (home, join game, create game) remain accessible to all

---

### Epic 7: Account Management

#### US-7.1: View Account Information
**As a** signed-in user
**I want to** view my account information
**So that** I can see my email and nickname

**Acceptance Criteria:**
- User can access an account/profile page
- Page displays email and nickname
- Page shows account creation date
- Password is not displayed

#### US-7.2: Update Nickname
**As a** signed-in user
**I want to** update my nickname
**So that** I can change how I appear in games

**Acceptance Criteria:**
- User can edit their nickname
- Nickname does not need to be unique
- Nickname length validation applies (3-50 characters)
- Changes are reflected immediately in the user's profile
- Changes apply to future games but don't retroactively change existing games
- Confirmation message on successful update

#### US-7.3: Update Password
**As a** signed-in user
**I want to** change my password
**So that** I can maintain account security

**Acceptance Criteria:**
- User must provide current password
- User must provide new password
- New password must meet requirements
- Password is hashed before storage
- Confirmation message on successful update
- Session remains active after password change

---

## Out of Scope (Future Enhancements)

The following features are intentionally excluded from this initial implementation:

- Converting anonymous accounts to authenticated accounts
- Email verification
- Password reset/forgot password
- OAuth/social sign-in (only email/password login)
- Two-factor authentication
- Email notifications
- Account deletion
- Profile pictures/avatars
- Detailed game history/statistics per account
- Unique usernames (nicknames are not globally unique)

---

## Technical Considerations

### Backend Changes Needed
- Add authentication endpoints (register, sign-in, sign-out)
- Add password hashing (bcrypt or similar)
- Update account creation logic to support authenticated vs. anonymous accounts
- Add email uniqueness validation (nicknames do not need to be unique)
- Update game creation/joining to check for authenticated session
- Add endpoint to retrieve games by account ID
- Distinguish between authenticated accounts (with email/password) and anonymous accounts

### Frontend Changes Needed
- Add registration page/form (email, nickname, password)
- Add sign-in page/form (email, password)
- Add navigation for authentication
- Add "My Games" list to home page for authenticated users
- Update game creation flow to skip nickname if authenticated
- Update game joining flow to skip nickname if authenticated
- Add session checking on page load
- Add sign-out functionality
- Add protected route handling
- Display nickname in navigation when authenticated

### Database Changes Needed
- Add `email` field to Account table (unique, nullable for backward compatibility)
- Add `password_hash` field to Account table (nullable for backward compatibility)
- Add index on email for performance
- Distinguish between authenticated and anonymous accounts

### Security Considerations
- Use bcrypt or Argon2 for password hashing
- Validate all inputs server-side
- Use parameterized queries to prevent SQL injection
- Rate limit authentication endpoints
- Use HTTPS in production (SECURE_COOKIES=true)
- httpOnly session cookies
- CSRF protection for state-changing operations

---

## Success Metrics

- Users can successfully register accounts
- Users can successfully sign in
- Authenticated users can create games without entering nickname
- Authenticated users can join games without entering nickname
- Sessions persist correctly
- No security vulnerabilities in authentication flow
- Backward compatibility maintained for anonymous users

---

## Design Decisions Made

Based on user feedback, the following decisions have been made:

1. **No username uniqueness**: Nicknames are not globally unique and can collide between users
2. **Email/password only**: Only email and password authentication (no OAuth/social login)
3. **Email must be unique**: Email addresses must be unique across all authenticated accounts
4. **Game list on home page**: Authenticated users see a list of their games on the home page
5. **Anonymous account conversion**: NOT included in this version (future enhancement)
6. **Nickname can be changed**: Users can update their nickname in their profile settings
7. **Nickname collisions allowed**: Multiple users with the same nickname can be in the same game
8. **Prevent duplicate account joins**: Authenticated users cannot join the same game twice (by account ID, not nickname)

## Remaining Open Questions

1. Should nicknames be case-sensitive or case-insensitive when displaying?
2. Should we enforce any nickname format requirements (alphanumeric, special characters, etc.)?
3. How many games should we show in the "My Games" list? All games or just recent/active ones?
4. Should email addresses be case-sensitive or normalized to lowercase?
5. Should we show a count of total buy-ins or current balance in the game list?
