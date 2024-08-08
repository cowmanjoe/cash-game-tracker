import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Game } from './app/lib/game';
import { gameClient } from './app/lib/game-client';

export async function middleware(request: NextRequest) {
    const game: Game = await gameClient.createGame();

    return NextResponse.redirect(new URL(`/game/${game.id}`, request.url));
}

export const config = {
    matcher: '/game'
}