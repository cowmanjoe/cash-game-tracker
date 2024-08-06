'use client'

import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup"
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter()

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
