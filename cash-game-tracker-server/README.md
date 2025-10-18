# Cash Game Tracker Server

A Spring Boot backend application for managing cash game transactions, player accounts, and financial settlements. Provides RESTful APIs for tracking buy-ins, cash-outs, payments, and calculating player balances.

## Features

- **Account Management**: Register and retrieve player accounts
- **Game Creation**: Initialize new game sessions
- **Transaction Tracking**: Record buy-ins, cash-outs, and inter-player payments
- **Balance Calculation**: Automatically compute player net winnings/losses
- **Transaction History**: Retrieve complete transaction logs
- **Transaction Updates**: Modify existing buy-ins and cash-outs
- **Multi-Player Support**: Track multiple players in a single game

## Technology Stack

- **Kotlin** - Primary language
- **Spring Boot** - Application framework
- **Spring Data JDBC** - Data access layer
- **H2 Database** - Embedded in-memory database
- **Gradle** - Build tool
- **JUnit & MockK** - Testing framework

## Prerequisites

- Java 17 or higher
- Gradle (or use included Gradle wrapper)

## Getting Started

### Option 1: Run with Gradle

#### Build

```bash
./gradlew build
```

#### Run

```bash
./gradlew bootRun
```

The server will start on `http://localhost:8080`.

#### Run Tests

```bash
./gradlew test
```

### Option 2: Run with Docker

#### Build Docker Image

```bash
docker build -t cash-game-tracker-server:latest .
```

#### Run Docker Container

```bash
docker run -p 8080:8080 cash-game-tracker-server:latest
```

#### Or use Docker Compose (run both frontend and backend)

From the project root directory:

```bash
docker-compose up -d
```

To stop all containers:

```bash
docker-compose down
```

The server will be available at `http://localhost:8080`.

## How It Works

1. **Create Accounts**: Players register with their names
2. **Start Games**: Create a new game session and add players
3. **Record Transactions**: Track buy-ins when players enter and cash-outs when they leave
4. **Calculate Balances**: View net winnings/losses for all players
5. **Manage Payments**: Record settlements between players

## Architecture

This is a layered Spring Boot application following clean architecture principles:

- **Controller Layer**: REST endpoints and request/response handling
- **Service Layer**: Business logic and transaction management
- **Repository Layer**: Data persistence with Spring Data JDBC
- **Entity/Model Layer**: Domain models and database entities

The application uses an embedded H2 database for data storage and initializes the schema automatically on startup.

## API Overview

The server provides RESTful endpoints for:

- Account registration and retrieval
- Game creation and management
- Recording buy-ins, cash-outs, and payments
- Adding players to games
- Querying balances and transaction history
- Updating transaction amounts

All responses follow a unified format with success/error indication.

## Configuration

The application uses Spring Boot's default configuration with H2 database. Database schema and initial seed data are loaded automatically from `schema.sql` and `data.sql`.

## Development

The codebase includes comprehensive unit tests covering game operations, transaction handling, and balance calculations. The application uses BigDecimal for precise financial calculations and supports configurable decimal precision per game.
