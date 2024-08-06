'use client'

import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup"
import Image from "next/image";
import styles from "../page.module.css";
import { useEffect } from 'react'
import axios from "axios";
import { Game } from "../lib/game";

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    axios.post("http://localhost:8080/game")
      .then((game: Game) => console.log(game))
  });

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <ButtonGroup variant="contained">
          <Button variant="contained" onClick={() => router.push('/game')}>Host Game</Button>
          <Button variant="contained">Join Game</Button>
        </ButtonGroup>
      </div>
    </main>
  );
}
 