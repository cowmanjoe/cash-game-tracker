# Cash Game Tracker

A full-stack application for tracking cash game transactions, buy-ins, cash-outs, and player balances during poker or cash game sessions.

## Project Structure

```
cash-game-tracker/
├── cash-game-tracker-server/    # Spring Boot backend (Kotlin)
├── cash-game-tracker-web/       # Next.js frontend (React/TypeScript)
└── docker-compose.yml           # Orchestrates both services
```

## Quick Start with Docker

The easiest way to run the entire application is with Docker Compose:

```bash
# Start both frontend and backend
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

After starting, access:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080

## Components

### Backend (cash-game-tracker-server)
- **Technology**: Kotlin, Spring Boot, H2 Database
- **Port**: 8080
- **Features**: REST API for accounts, games, transactions, and balances

See [cash-game-tracker-server/README.md](cash-game-tracker-server/README.md) for details.

### Frontend (cash-game-tracker-web)
- **Technology**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Port**: 3000
- **Features**: Game hosting, transaction tracking, balance viewing

See [cash-game-tracker-web/README.md](cash-game-tracker-web/README.md) for details.

## Development

### Running Individually

**Backend:**
```bash
cd cash-game-tracker-server
./gradlew bootRun
```

**Frontend:**
```bash
cd cash-game-tracker-web
npm install
npm run dev
```

### Building for Production

**With Docker:**
```bash
docker-compose build
docker-compose up -d
```

**Without Docker:**

Backend:
```bash
cd cash-game-tracker-server
./gradlew build
```

Frontend:
```bash
cd cash-game-tracker-web
npm run build
npm start
```

## Features

- Create and join cash games
- Track buy-ins and cash-outs for players
- View real-time player balances
- Edit transaction amounts
- Secure JWT-based sessions
- Responsive mobile-friendly interface

## License

Private project
