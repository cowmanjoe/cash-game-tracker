"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Game } from "../lib/game";

const Context = createContext<[Game | null, (game: Game) => void]>([null, () => {}])

const GAME_KEY = "game";

export function GameProvider({ children }: { children: ReactNode }) {
    console.log("Starting GameProvider")
    const loadedGameJson = localStorage.getItem(GAME_KEY)
    console.log(`loaded: ${loadedGameJson}`)
    let loadedGame: Game | null = null;

    if (loadedGameJson) {
        loadedGame = JSON.parse(loadedGameJson)
    }

    const [game, setGame] = useState<Game | null>(loadedGame)

    const setAndSaveGame = (game: Game) => {
        setGame(game)
        localStorage.setItem(GAME_KEY, JSON.stringify(game))

        console.log(`Saved ${JSON.stringify(game)}`)
    }

    return (
        <Context.Provider value={[game, setAndSaveGame]}>{children}</Context.Provider>
    )
}

export function useGameContext() {
    return useContext(Context)
}