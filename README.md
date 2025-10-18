# Cash Game Tracker

A full-stack application for tracking cash game transactions, buy-ins, cash-outs, and player balances during poker or cash game sessions.

## Project Structure

```
cash-game-tracker/
├── cash-game-tracker-server/    # Spring Boot backend (Kotlin)
├── cash-game-tracker-web/       # Next.js frontend (React/TypeScript)
└── docker-compose.yml           # Orchestrates both services
```

## Quick Start with Docker Compose

The easiest way to run the entire application is with Docker Compose:

```bash
# Start both frontend and backend
docker-compose up -d
```

After starting, access:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080

The docker-compose configuration automatically sets up the correct network communication between services using `http://server:8080` for internal container-to-container calls.

### Docker Compose Commands

```bash
# Start services in detached mode
docker-compose up -d

# Start services with live logs
docker-compose up

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f web
docker-compose logs -f server

# Stop all services
docker-compose down

# Rebuild images and start
docker-compose up -d --build

# Stop and remove all containers, networks, and volumes
docker-compose down -v
```

### What's Included

The `docker-compose.yml` file orchestrates:
- **Backend (server)**: Kotlin/Spring Boot API on port 8080
- **Frontend (web)**: Next.js application on port 3000
- **Networking**: Shared network for service communication (frontend uses `http://server:8080` to reach backend)
- **Auto-restart**: Services restart automatically on failure
- **Environment Configuration**: Backend URL automatically configured for Docker networking

## Configuration

### Backend API URL

The frontend needs to know where to reach the backend API. This is configured differently for each deployment scenario:

| Environment | Configuration | Backend URL |
|------------|---------------|-------------|
| **Local Development** | `.env.local` file | `http://localhost:8080` |
| **Docker Compose** | Automatic (via docker-compose.yml) | `http://server:8080` |
| **Production** | Environment variable | Your production backend URL |

**For local development**, the `.env.local` file is already configured with `BACKEND_API_URL=http://localhost:8080`.

**For Docker Compose**, the configuration is automatic - no changes needed.

**For production deployment**, set the `BACKEND_API_URL` environment variable to your backend URL.

## Components

### Backend (cash-game-tracker-server)
- **Technology**: Kotlin, Spring Boot, H2 Database
- **Port**: 8080
- **Features**: REST API for accounts, games, transactions, and balances

See [cash-game-tracker-server/README.md](cash-game-tracker-server/README.md) for development setup and standalone Docker commands.

### Frontend (cash-game-tracker-web)
- **Technology**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Port**: 3000
- **Features**: Game hosting, transaction tracking, balance viewing

See [cash-game-tracker-web/README.md](cash-game-tracker-web/README.md) for development setup and standalone Docker commands.

## Development

### Running Services Individually

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

### Production Build (without Docker)

**Backend:**
```bash
cd cash-game-tracker-server
./gradlew build
java -jar build/libs/*.jar
```

**Frontend:**
```bash
cd cash-game-tracker-web
npm run build
npm start
```

## Features

- **Game Management**: Create and join cash games with unique IDs
- **Transaction Tracking**: Record buy-ins and cash-outs for all players
- **Real-time Balances**: View current net winnings/losses for each player
- **Transaction Editing**: Update amounts for existing transactions
- **Secure Sessions**: JWT-based authentication with httpOnly cookies
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Architecture

This is a standard client-server architecture:
- **Backend**: RESTful API built with Spring Boot, uses embedded H2 database
- **Frontend**: Server-side rendered Next.js application with React Server Components
- **Communication**: HTTP/JSON API calls from frontend to backend
- **State**: Session state managed via encrypted JWT tokens

## License

Private project
