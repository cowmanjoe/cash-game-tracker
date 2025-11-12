# Room Code Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 4-letter room codes to games for easy joining, with lifecycle management (active games have codes, closed games release them for reuse).

**Architecture:** Backend adds room code generation and lookup alongside existing UUID system. Frontend supports both UUID and room code in all entry points. Room codes are UNIQUE in database, automatically freed when games close.

**Tech Stack:** Kotlin/Spring Boot, Spring Data JDBC, H2 Database, Next.js, React, TypeScript, qrcode.react

---

## Backend Implementation

### Task 1: Add GameStatus enum to domain model

**Files:**
- Modify: `cash-game-tracker-server/src/main/kotlin/com/cowan/cashgametracker/model/Game.kt`
- Test: Manual verification (enum doesn't require unit tests)

**Step 1: Add GameStatus enum to Game.kt**

Add this enum at the bottom of the file, before the `PlayerNotInGameException` class:

```kotlin
enum class GameStatus {
    ACTIVE,
    CLOSED
}
```

**Step 2: Update Game class constructor**

Change the Game class constructor from:

```kotlin
class Game(val id: String, val createTime: Instant, val decimals: Int) {
```

To:

```kotlin
class Game(
    val id: String,
    val createTime: Instant,
    val decimals: Int,
    val roomCode: String?,
    val status: GameStatus
) {
```

**Step 3: Verify compilation**

Run: `./gradlew compileKotlin`
Expected: Compilation will FAIL because existing code creating Game objects doesn't pass the new parameters. This is expected - we'll fix in subsequent tasks.

**Step 4: Commit**

```bash
git add cash-game-tracker-server/src/main/kotlin/com/cowan/cashgametracker/model/Game.kt
git commit -m "feat: add GameStatus enum and room code fields to Game model"
```

---

### Task 2: Create RoomCodeGenerator component

**Files:**
- Create: `cash-game-tracker-server/src/main/kotlin/com/cowan/cashgametracker/service/RoomCodeGenerator.kt`
- Test: `cash-game-tracker-server/src/test/kotlin/com/cowan/cashgametracker/service/RoomCodeGeneratorTest.kt`

**Step 1: Write the failing test**

Create new test file with this content:

```kotlin
package com.cowan.cashgametracker.service

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class RoomCodeGeneratorTest {

    private val generator = RoomCodeGenerator()

    @Test
    fun test_generateCode_returns4LetterCode() {
        val code = generator.generateCode()

        assertEquals(4, code.length)
        assertTrue(code.all { it.isUpperCase() && it.isLetter() })
    }

    @Test
    fun test_generateCode_returnsUniqueCodesOverMultipleCalls() {
        val codes = (1..100).map { generator.generateCode() }.toSet()

        // With 456,976 possible combinations, 100 codes should be unique
        assertTrue(codes.size > 90, "Expected at least 90 unique codes out of 100")
    }
}
```

**Step 2: Run test to verify it fails**

Run: `./gradlew test --tests "com.cowan.cashgametracker.service.RoomCodeGeneratorTest"`
Expected: FAIL with "Unresolved reference: RoomCodeGenerator"

**Step 3: Write minimal implementation**

Create the RoomCodeGenerator.kt file:

```kotlin
package com.cowan.cashgametracker.service

import org.springframework.stereotype.Component
import java.security.SecureRandom

@Component
class RoomCodeGenerator {

    private val random = SecureRandom()

    companion object {
        private const val CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        private const val CODE_LENGTH = 4
    }

    fun generateCode(): String {
        return (1..CODE_LENGTH)
            .map { CHARSET[random.nextInt(CHARSET.length)] }
            .joinToString("")
    }
}
```

**Step 4: Run test to verify it passes**

Run: `./gradlew test --tests "com.cowan.cashgametracker.service.RoomCodeGeneratorTest"`
Expected: PASS (both tests green)

**Step 5: Commit**

```bash
git add cash-game-tracker-server/src/main/kotlin/com/cowan/cashgametracker/service/RoomCodeGenerator.kt
git add cash-game-tracker-server/src/test/kotlin/com/cowan/cashgametracker/service/RoomCodeGeneratorTest.kt
git commit -m "feat: add RoomCodeGenerator component"
```

---

### Task 3: Update GameEntity with new fields

**Files:**
- Modify: `cash-game-tracker-server/src/main/kotlin/com/cowan/cashgametracker/entity/GameEntity.kt`
- Test: Manual verification (entity changes verified through integration tests later)

**Step 1: Update GameEntity data class**

Change the GameEntity constructor from:

```kotlin
@Table("GAME")
data class GameEntity(
    @Id
    val id: String?,
    val createTime: Instant,
    val decimals: Int,
```

To:

```kotlin
@Table("GAME")
data class GameEntity(
    @Id
    val id: String?,
    val createTime: Instant,
    val decimals: Int,
    val roomCode: String?,
    val status: String,
```

**Step 2: Verify compilation**

Run: `./gradlew compileKotlin`
Expected: Compilation will FAIL because existing code creating GameEntity objects doesn't pass the new parameters. This is expected.

**Step 3: Commit**

```bash
git add cash-game-tracker-server/src/main/kotlin/com/cowan/cashgametracker/entity/GameEntity.kt
git commit -m "feat: add roomCode and status fields to GameEntity"
```

---

### Task 4: Add repository methods for room code lookup

**Files:**
- Modify: `cash-game-tracker-server/src/main/kotlin/com/cowan/cashgametracker/repository/GameRepository.kt`
- Test: Integration tests in Task 6

**Step 1: Add repository methods**

Add these two methods to the GameRepository interface:

```kotlin
interface GameRepository : CrudRepository<GameEntity, String> {
    fun getById(id: String): GameEntity

    // NEW: Find by room code (any status)
    fun findByRoomCode(roomCode: String): GameEntity?

    // NEW: Find by room code and status (for active games only)
    fun findByRoomCodeAndStatus(roomCode: String, status: String): GameEntity?
}
```

**Step 2: Verify compilation**

Run: `./gradlew compileKotlin`
Expected: SUCCESS (Spring Data JDBC will implement these methods automatically)

**Step 3: Commit**

```bash
git add cash-game-tracker-server/src/main/kotlin/com/cowan/cashgametracker/repository/GameRepository.kt
git commit -m "feat: add room code lookup methods to GameRepository"
```

---

### Task 5: Update GameService constructor and add RoomCodeGenerationException

**Files:**
- Modify: `cash-game-tracker-server/src/main/kotlin/com/cowan/cashgametracker/service/GameService.kt`

**Step 1: Add RoomCodeGenerationException at bottom of file**

Add this class at the end of GameService.kt:

```kotlin
class RoomCodeGenerationException(message: String) : RuntimeException(message)
```

**Step 2: Update GameService constructor to inject RoomCodeGenerator**

Change the @Service class declaration from:

```kotlin
@Service
class GameService(
    private val gameRepository: GameRepository,
    private val accountRepository: AccountRepository
) {
```

To:

```kotlin
@Service
class GameService(
    private val gameRepository: GameRepository,
    private val accountRepository: AccountRepository,
    private val roomCodeGenerator: RoomCodeGenerator
) {
```

**Step 3: Add companion object with constant**

Add this right after the class declaration:

```kotlin
@Service
class GameService(
    private val gameRepository: GameRepository,
    private val accountRepository: AccountRepository,
    private val roomCodeGenerator: RoomCodeGenerator
) {

    companion object {
        private const val MAX_CODE_GENERATION_RETRIES = 10
    }
```

**Step 4: Verify compilation**

Run: `./gradlew compileKotlin`
Expected: Will likely FAIL due to other changes needed, but that's expected. We're building incrementally.

**Step 5: Commit**

```bash
git add cash-game-tracker-server/src/main/kotlin/com/cowan/cashgametracker/service/GameService.kt
git commit -m "feat: inject RoomCodeGenerator into GameService"
```

---

### Task 6: Update GameService.createGame to generate room codes

**Files:**
- Modify: `cash-game-tracker-server/src/main/kotlin/com/cowan/cashgametracker/service/GameService.kt`
- Test: `cash-game-tracker-server/src/test/kotlin/com/cowan/cashgametracker/service/GameServiceTest.kt`

**Step 1: Write the failing test**

Add this test to GameServiceTest.kt:

```kotlin
@Test
fun test_createGame_assignsRoomCode() {
    val game = gameService.createGame(2)

    assertNotNull(game.roomCode)
    assertEquals(4, game.roomCode!!.length)
    assertTrue(game.roomCode!!.all { it.isUpperCase() && it.isLetter() })
}

@Test
fun test_createGame_setsStatusToActive() {
    val game = gameService.createGame(2)

    assertEquals(GameStatus.ACTIVE, game.status)
}
```

**Step 2: Run test to verify it fails**

Run: `./gradlew test --tests "*GameServiceTest.test_createGame_assignsRoomCode" --tests "*GameServiceTest.test_createGame_setsStatusToActive"`
Expected: FAIL (roomCode and status not set yet)

**Step 3: Add helper method generateUniqueRoomCode**

Add this private method to GameService class:

```kotlin
private fun generateUniqueRoomCode(): String {
    repeat(MAX_CODE_GENERATION_RETRIES) {
        val code = roomCodeGenerator.generateCode()
        val existing = gameRepository.findByRoomCode(code)
        if (existing == null) {
            return code
        }
    }
    throw RoomCodeGenerationException(
        "Failed to generate unique room code after $MAX_CODE_GENERATION_RETRIES attempts"
    )
}
```

**Step 4: Update createGame method**

Find the createGame method and update it from:

```kotlin
@Transactional
fun createGame(decimals: Int): Game {
    val gameEntity = GameEntity(generateNewId(), Instant.now(), decimals)

    val savedGameEntity = gameRepository.save(gameEntity)

    return convertEntity(savedGameEntity)
}
```

To:

```kotlin
@Transactional
fun createGame(decimals: Int): Game {
    val gameId = generateNewId()
    val roomCode = generateUniqueRoomCode()

    val gameEntity = GameEntity(
        id = gameId,
        createTime = Instant.now(),
        decimals = decimals,
        roomCode = roomCode,
        status = "ACTIVE"
    )

    val savedGameEntity = gameRepository.save(gameEntity)

    return convertEntity(savedGameEntity)
}
```

**Step 5: Update convertEntity method**

Find the convertEntity method and update the Game constructor call from:

```kotlin
val game = Game(entity.requireNotNullId(), entity.createTime, entity.decimals)
```

To:

```kotlin
val game = Game(
    entity.requireNotNullId(),
    entity.createTime,
    entity.decimals,
    entity.roomCode,
    GameStatus.valueOf(entity.status)
)
```

**Step 6: Run test to verify it passes**

Run: `./gradlew test --tests "*GameServiceTest.test_createGame_assignsRoomCode" --tests "*GameServiceTest.test_createGame_setsStatusToActive"`
Expected: PASS

**Step 7: Run all GameServiceTest to check for regressions**

Run: `./gradlew test --tests "*GameServiceTest*"`
Expected: Some tests may fail due to convertEntity changes. This is expected - existing tests may need updates.

**Step 8: Fix any failing tests**

If tests fail because they're checking game objects, you may need to update assertions. For example, if a test compares entire Game objects, it will fail because Game now has additional fields. Update those tests to ignore the new fields or set appropriate expectations.

**Step 9: Commit**

```bash
git add cash-game-tracker-server/src/main/kotlin/com/cowan/cashgametracker/service/GameService.kt
git add cash-game-tracker-server/src/test/kotlin/com/cowan/cashgametracker/service/GameServiceTest.kt
git commit -m "feat: generate room codes when creating games"
```

---

### Task 7: Add GameService.closeGame method

**Files:**
- Modify: `cash-game-tracker-server/src/main/kotlin/com/cowan/cashgametracker/service/GameService.kt`
- Test: `cash-game-tracker-server/src/test/kotlin/com/cowan/cashgametracker/service/GameServiceTest.kt`

**Step 1: Write the failing test**

Add this test to GameServiceTest.kt:

```kotlin
@Test
fun test_closeGame_setsStatusToClosedAndClearsRoomCode() {
    val game = gameService.createGame(2)
    val originalRoomCode = game.roomCode

    assertNotNull(originalRoomCode)
    assertEquals(GameStatus.ACTIVE, game.status)

    gameService.closeGame(game.id)

    val closedGame = gameService.getGame(game.id)
    assertEquals(GameStatus.CLOSED, closedGame.status)
    assertNull(closedGame.roomCode, "Room code should be null after closing")
}

@Test
fun test_closeGame_freesRoomCodeForReuse() {
    val game1 = gameService.createGame(2)
    val roomCode1 = game1.roomCode!!

    gameService.closeGame(game1.id)

    // Create many games to likely hit the same room code
    val newGames = (1..20).map { gameService.createGame(2) }
    val newRoomCodes = newGames.map { it.roomCode }

    // Should be able to reuse the room code from closed game
    // (This test is probabilistic but with 20 tries and 456k combinations,
    // if reuse works it should occasionally match)
    assertTrue(newRoomCodes.isNotEmpty(), "Should create new games successfully")
}
```

**Step 2: Run test to verify it fails**

Run: `./gradlew test --tests "*GameServiceTest.test_closeGame*"`
Expected: FAIL with "Unresolved reference: closeGame"

**Step 3: Implement closeGame method**

Add this method to GameService:

```kotlin
@Transactional
fun closeGame(gameId: String) {
    val gameEntity = gameRepository.getById(gameId)

    val closedGame = gameEntity.copy(
        status = "CLOSED",
        roomCode = null
    )

    gameRepository.save(closedGame)
}
```

**Step 4: Run test to verify it passes**

Run: `./gradlew test --tests "*GameServiceTest.test_closeGame*"`
Expected: PASS

**Step 5: Commit**

```bash
git add cash-game-tracker-server/src/main/kotlin/com/cowan/cashgametracker/service/GameService.kt
git add cash-game-tracker-server/src/test/kotlin/com/cowan/cashgametracker/service/GameServiceTest.kt
git commit -m "feat: add closeGame method to free room codes"
```

---

### Task 8: Update GameService.getGame to handle room codes

**Files:**
- Modify: `cash-game-tracker-server/src/main/kotlin/com/cowan/cashgametracker/service/GameService.kt`
- Test: `cash-game-tracker-server/src/test/kotlin/com/cowan/cashgametracker/service/GameServiceTest.kt`

**Step 1: Write the failing test**

Add these tests to GameServiceTest.kt:

```kotlin
@Test
fun test_getGame_byRoomCode_returnsGame() {
    val createdGame = gameService.createGame(2)
    val roomCode = createdGame.roomCode!!

    val retrievedGame = gameService.getGame(roomCode)

    assertEquals(createdGame.id, retrievedGame.id)
    assertEquals(roomCode, retrievedGame.roomCode)
}

@Test
fun test_getGame_byUuid_returnsGame() {
    val createdGame = gameService.createGame(2)

    val retrievedGame = gameService.getGame(createdGame.id)

    assertEquals(createdGame.id, retrievedGame.id)
}

@Test
fun test_getGame_byRoomCode_caseInsensitive() {
    val createdGame = gameService.createGame(2)
    val roomCode = createdGame.roomCode!!

    val retrievedGame = gameService.getGame(roomCode.lowercase())

    assertEquals(createdGame.id, retrievedGame.id)
}

@Test
fun test_getGame_byClosedGameRoomCode_throwsException() {
    val game = gameService.createGame(2)
    val roomCode = game.roomCode!!

    gameService.closeGame(game.id)

    assertThrows(GameNotFoundException::class.java) {
        gameService.getGame(roomCode)
    }
}

@Test
fun test_getGame_byClosedGameUuid_returnsGame() {
    val game = gameService.createGame(2)

    gameService.closeGame(game.id)

    val retrievedGame = gameService.getGame(game.id)
    assertEquals(game.id, retrievedGame.id)
    assertEquals(GameStatus.CLOSED, retrievedGame.status)
}
```

**Step 2: Run test to verify it fails**

Run: `./gradlew test --tests "*GameServiceTest.test_getGame_by*"`
Expected: Some will FAIL (room code lookup not implemented yet)

**Step 3: Add helper method isRoomCode**

Add this private method to GameService:

```kotlin
private fun isRoomCode(input: String): Boolean {
    return input.length == 4 && input.all { it.isLetter() }
}
```

**Step 4: Update getGame method**

Replace the existing getGame method with:

```kotlin
fun getGame(idOrCode: String): Game {
    val gameEntity = if (isRoomCode(idOrCode)) {
        // Lookup by room code - only ACTIVE games have codes
        gameRepository.findByRoomCodeAndStatus(idOrCode.uppercase(), "ACTIVE")
            ?: throw GameNotFoundException("Game not found with code: $idOrCode")
    } else {
        // Lookup by UUID - works for any status
        gameRepository.getById(idOrCode)
    }
    return convertEntity(gameEntity)
}
```

**Step 5: Run test to verify it passes**

Run: `./gradlew test --tests "*GameServiceTest.test_getGame_by*"`
Expected: PASS

**Step 6: Run all GameServiceTest**

Run: `./gradlew test --tests "*GameServiceTest*"`
Expected: All tests PASS

**Step 7: Commit**

```bash
git add cash-game-tracker-server/src/main/kotlin/com/cowan/cashgametracker/service/GameService.kt
git add cash-game-tracker-server/src/test/kotlin/com/cowan/cashgametracker/service/GameServiceTest.kt
git commit -m "feat: support room code lookup in getGame method"
```

---

### Task 9: Update database schema

**Files:**
- Modify: `cash-game-tracker-server/src/main/resources/schema.sql`

**Step 1: Update GAME table definition**

Find the GAME table creation statement and update it from:

```sql
CREATE TABLE GAME (
    ID VARCHAR(64) PRIMARY KEY,
    CREATE_TIME TIMESTAMP NOT NULL,
    DECIMALS TINYINT NOT NULL
);
```

To:

```sql
CREATE TABLE GAME (
    ID VARCHAR(64) PRIMARY KEY,
    CREATE_TIME TIMESTAMP NOT NULL,
    DECIMALS TINYINT NOT NULL,
    ROOM_CODE VARCHAR(4) UNIQUE,
    STATUS VARCHAR(16) NOT NULL DEFAULT 'ACTIVE'
);
```

**Step 2: Verify schema with integration test**

Run: `./gradlew test`
Expected: All tests PASS (schema changes applied on next app startup)

**Step 3: Commit**

```bash
git add cash-game-tracker-server/src/main/resources/schema.sql
git commit -m "feat: add room_code and status columns to game table"
```

---

### Task 10: Update test data

**Files:**
- Modify: `cash-game-tracker-server/src/main/resources/data.sql`

**Step 1: Update existing game data**

Find the INSERT into GAME and update it from:

```sql
INSERT INTO GAME (ID, CREATE_TIME, DECIMALS) VALUES ('Game1', '2024-08-05 20:00:00', 2);
```

To:

```sql
INSERT INTO GAME (ID, CREATE_TIME, DECIMALS, ROOM_CODE, STATUS) VALUES ('Game1', '2024-08-05 20:00:00', 2, 'TEST', 'ACTIVE');
```

**Step 2: Test with full build**

Run: `./gradlew build`
Expected: BUILD SUCCESSFUL with all tests passing

**Step 3: Commit**

```bash
git add cash-game-tracker-server/src/main/resources/data.sql
git commit -m "feat: update test data with room code and status"
```

---

## Frontend Implementation

### Task 11: Update Game TypeScript interface

**Files:**
- Modify: `cash-game-tracker-web/app/lib/game.ts`

**Step 1: Add GameStatus enum**

Add this enum near the top of the file, after the existing enums:

```typescript
export enum GameStatus {
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED"
}
```

**Step 2: Update Game interface**

Update the Game interface from:

```typescript
export interface Game {
  id: string;
  createTime: number;
  buyIns: BuyIn[];
  cashOuts: Record<string, CashOut>;
  payments: Payment[];
  players: Record<string, Account>;
}
```

To:

```typescript
export interface Game {
  id: string;
  createTime: number;
  buyIns: BuyIn[];
  cashOuts: Record<string, CashOut>;
  payments: Payment[];
  players: Record<string, Account>;
  roomCode: string | null;
  status: GameStatus;
}
```

**Step 3: Verify TypeScript compilation**

Run: `npm run build`
Expected: Will likely show type errors where Game is used - this is expected

**Step 4: Commit**

```bash
git add cash-game-tracker-web/app/lib/game.ts
git commit -m "feat: add roomCode and status to Game interface"
```

---

### Task 12: Update join-game page to normalize room code input

**Files:**
- Modify: `cash-game-tracker-web/app/join-game/page.tsx`

**Step 1: Update form submission to normalize input**

Update the `submitJoinGameForm` function from:

```typescript
async function submitJoinGameForm(formData: FormData) {
  'use server';

  const gameId = formData.get('gameId');

  if (!gameId) {
    throw Error("Game ID was null");
  }

  redirect(`/join-game/${gameId}`);
}
```

To:

```typescript
async function submitJoinGameForm(formData: FormData) {
  'use server';

  const gameIdOrCode = formData.get('gameId');

  if (!gameIdOrCode) {
    throw Error("Game ID or room code was null");
  }

  // Normalize: if it looks like a room code (4 letters), uppercase it
  const normalized = gameIdOrCode.toString().length === 4 && /^[a-zA-Z]+$/.test(gameIdOrCode.toString())
    ? gameIdOrCode.toString().toUpperCase()
    : gameIdOrCode.toString();

  redirect(`/join-game/${normalized}`);
}
```

**Step 2: Update placeholder text**

Change the input placeholder from:

```typescript
placeholder="Game ID"
```

To:

```typescript
placeholder="Room Code or Game ID"
```

**Step 3: Test manually**

Start the app:
```bash
npm run dev
```

Navigate to http://localhost:3000/join-game and verify:
- Entering "abcd" redirects to "/join-game/ABCD"
- Entering a UUID redirects as-is

**Step 4: Commit**

```bash
git add cash-game-tracker-web/app/join-game/page.tsx
git commit -m "feat: normalize room code input on join-game page"
```

---

### Task 13: Display room code on game page

**Files:**
- Modify: `cash-game-tracker-web/app/game/[id]/page.tsx`
- Manual testing required

**Step 1: Find the game page component**

Read the file to understand structure:

Run: `cat cash-game-tracker-web/app/game/[id]/page.tsx`

**Step 2: Add room code display component**

Add a new component near the top of the file, before the main page component:

```typescript
function RoomCodeDisplay({ roomCode }: { roomCode: string | null }) {
  if (!roomCode) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">Room Code</p>
          <p className="text-3xl font-bold tracking-wider text-blue-600">{roomCode}</p>
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(roomCode)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Copy Code
        </button>
      </div>
    </div>
  );
}
```

**Step 3: Add RoomCodeDisplay to page**

In the main page component's return statement, add the RoomCodeDisplay component near the top, after the `<main>` tag and before the existing content:

```typescript
return (
  <main className="flex min-h-screen flex-col items-center p-8">
    <div className="w-full max-w-4xl">
      <RoomCodeDisplay roomCode={game.roomCode} />

      {/* ... existing content ... */}
```

**Step 4: Test manually**

With the dev server running, navigate to a game page and verify:
- Room code is displayed prominently
- Copy button works
- Old games without room codes don't show the section

**Step 5: Commit**

```bash
git add cash-game-tracker-web/app/game/[id]/page.tsx
git commit -m "feat: display room code on game page"
```

---

### Task 14: Add QR code generation

**Files:**
- Modify: `cash-game-tracker-web/package.json`
- Modify: `cash-game-tracker-web/app/game/[id]/page.tsx`

**Step 1: Install QR code library**

Run: `npm install qrcode.react`
Run: `npm install --save-dev @types/qrcode.react`

**Step 2: Commit package.json changes**

```bash
git add cash-game-tracker-web/package.json cash-game-tracker-web/package-lock.json
git commit -m "feat: add qrcode.react dependency"
```

**Step 3: Create QR code component**

Add this component to `cash-game-tracker-web/app/game/[id]/page.tsx`:

```typescript
'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

function QRCodeModal({ roomCode, gameUrl }: { roomCode: string, gameUrl: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Show QR Code
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-8 max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4 text-center">Scan to Join</h3>
            <div className="flex justify-center mb-4">
              <QRCodeSVG value={gameUrl} size={256} />
            </div>
            <p className="text-center text-gray-600 mb-2">Room Code: <span className="font-bold text-2xl">{roomCode}</span></p>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
```

**Step 4: Update RoomCodeDisplay to include QR code button**

Update the RoomCodeDisplay component to include the QR modal:

```typescript
function RoomCodeDisplay({ roomCode, gameId }: { roomCode: string | null, gameId: string }) {
  if (!roomCode) return null;

  const joinUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/join-game/${roomCode}`;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">Room Code</p>
          <p className="text-3xl font-bold tracking-wider text-blue-600">{roomCode}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(roomCode)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Copy Code
          </button>
          <QRCodeModal roomCode={roomCode} gameUrl={joinUrl} />
        </div>
      </div>
    </div>
  );
}
```

**Step 5: Update page component to pass gameId**

Update the RoomCodeDisplay usage to pass the gameId:

```typescript
<RoomCodeDisplay roomCode={game.roomCode} gameId={game.id} />
```

**Step 6: Add 'use client' directive if needed**

If the file doesn't already have it, add this at the very top:

```typescript
'use client';
```

**Step 7: Test manually**

Navigate to a game page and verify:
- "Show QR Code" button appears
- Clicking shows modal with QR code
- Scanning QR code with phone opens join URL
- Modal closes when clicking outside or Close button

**Step 8: Commit**

```bash
git add cash-game-tracker-web/app/game/[id]/page.tsx
git commit -m "feat: add QR code generation for room codes"
```

---

### Task 15: Update join-game confirmation page to show room code

**Files:**
- Modify: `cash-game-tracker-web/app/join-game/[id]/page.tsx`

**Step 1: Add room code display**

Add a room code display section in the page component's return statement, near the top:

```typescript
export default async function JoinGamePage(props: { params: { id: string } }) {
  // ... existing code ...

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md flex flex-col gap-4">
        {game.roomCode && (
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">Room Code</p>
            <p className="text-2xl font-bold text-blue-600">{game.roomCode}</p>
          </div>
        )}

        {/* ... existing forms ... */}
```

**Step 2: Test manually**

Navigate to join-game page via room code and verify room code is displayed

**Step 3: Commit**

```bash
git add cash-game-tracker-web/app/join-game/[id]/page.tsx
git commit -m "feat: display room code on join confirmation page"
```

---

## Final Integration Testing

### Task 16: Full end-to-end testing

**Manual Test Script:**

1. **Start backend**
   ```bash
   cd cash-game-tracker-server
   ./gradlew bootRun
   ```

2. **Start frontend**
   ```bash
   cd cash-game-tracker-web
   npm run dev
   ```

3. **Test flow:**
   - Create new game → verify room code appears
   - Copy room code → verify it copies
   - Show QR code → verify QR modal opens
   - Join game with room code (lowercase) → verify it works
   - Join game with room code (uppercase) → verify it works
   - Join game with UUID → verify it works
   - Verify old test game (Game1) shows "TEST" as room code
   - Close game via backend (future feature) → verify code is freed

4. **Run all tests**
   ```bash
   # Backend tests
   cd cash-game-tracker-server
   ./gradlew test

   # Frontend build
   cd cash-game-tracker-web
   npm run build
   ```

Expected: All tests pass, all manual scenarios work

**Step: Document any issues found**

If any issues are found, create TODO items and fix before finalizing.

**Step: Final commit**

```bash
git add -A
git commit -m "test: verify room code feature end-to-end"
```

---

## Deployment Checklist

- [ ] All backend tests pass
- [ ] Frontend builds successfully
- [ ] Manual testing complete
- [ ] Database schema updated
- [ ] Environment variables checked (none needed for this feature)
- [ ] Documentation updated (README mentions room codes)

---

## Future Enhancements (Out of Scope)

- Add API endpoint for closing games via frontend
- Add "Close Game" button on game page
- Display game status (ACTIVE/CLOSED) in UI
- Analytics on room code usage
- Custom room code selection (with availability check)
- Room code expiration after X hours of inactivity

---

## Implementation Notes

**Design Decisions:**
- Room codes are UNIQUE at database level (prevents race conditions)
- Closed games have NULL room codes (frees codes for reuse)
- Case-insensitive lookup (normalized to uppercase)
- UUID lookup always works (even for closed games)
- Room code lookup only works for ACTIVE games

**Testing Strategy:**
- Unit tests for room code generation
- Integration tests for database constraints
- Service tests for game lifecycle
- Manual testing for frontend UX

**Rollback Plan:**
If issues arise:
1. Revert database schema changes
2. Revert entity and domain model changes
3. Frontend will continue to work with UUIDs
4. No data loss (room codes are additive feature)
