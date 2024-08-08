import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Game } from './app/lib/game';

export async function middleware(request: NextRequest) {
    const gameResponse = await fetch('http://localhost:8080/game', {
        method: 'POST'
    });

    const game: Game = await gameResponse.json();

    return NextResponse.redirect(new URL(`/game/${game.id}`, request.url));
}

export const config = {
    matcher: '/game'
}