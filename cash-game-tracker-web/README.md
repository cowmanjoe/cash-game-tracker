# Cash Game Tracker Web

A modern web application for tracking cash game transactions, buy-ins, cash-outs, and player balances during poker or cash game sessions.

## Features

- **Host or Join Games**: Create new games or join existing ones
- **Transaction Tracking**: Record and view buy-ins and cash-outs for all players
- **Balance Management**: View real-time player balances
- **Transaction Editing**: Update transaction amounts when needed
- **Secure Sessions**: JWT-based authentication with httpOnly cookies
- **Responsive Design**: Mobile-friendly interface

## Technology Stack

- **Next.js 15** (App Router) - React meta-framework with server-side rendering
- **React 19** - UI library
- **TypeScript** - Static type checking
- **Tailwind CSS** - Utility-first CSS framework
- **jose** - JWT encryption and session management

## Prerequisites

- Node.js 20 or higher
- Backend server running on `http://localhost:8080`

## Getting Started

### Option 1: Run with Node.js

#### Installation

```bash
npm install
```

#### Development

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000).

#### Build for Production

```bash
npm run build
npm start
```

### Option 2: Run with Docker

#### Build Docker Image

```bash
docker build -t cash-game-tracker-web:latest .
```

#### Run Docker Container

```bash
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:8080 cash-game-tracker-web:latest
```

#### Or use Docker Compose

```bash
docker-compose up -d
```

To stop the container:

```bash
docker-compose down
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## How It Works

1. **Create or Join**: Users can either host a new game or join an existing one
2. **Track Transactions**: Add buy-ins when players purchase chips and cash-outs when they leave
3. **View Balances**: See real-time balances for all players in the game
4. **Edit as Needed**: Update transaction amounts if corrections are needed

## Architecture

This is a Next.js application that communicates with a backend REST API. It uses:

- Server-side rendering for optimal performance
- Server actions for form submissions
- Encrypted JWT sessions stored in httpOnly cookies
- Cache revalidation for real-time data updates

## Configuration

The backend API URL is currently set to `http://localhost:8080`. Update the session secret in production before deployment.
