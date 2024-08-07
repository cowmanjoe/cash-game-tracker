'use client'

import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup"
import Image from "next/image";
import styles from "./page.module.css";
import { useState } from "react";
import axios from "axios";
import { useGameContext } from "./context/game-context";

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false);
  const [game, setGame] = useGameContext();

  const onHostGame = async () => {
    setLoading(true);

    const response = await axios.post("http://localhost:8080/game")

    console.log(response.data)

    setGame(response.data)

    router.push("/game")
  }

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <ButtonGroup variant="contained">
          <Button variant="contained" disabled={loading} onClick={onHostGame}>Host Game</Button>
          <Button variant="contained">Join Game</Button>
        </ButtonGroup>
      </div>
    </main>
  );
}
