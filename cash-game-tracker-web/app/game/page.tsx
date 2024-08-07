'use client'

import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup"
import Image from "next/image";
import styles from "../page.module.css";
import { useEffect } from 'react'
import axios, { AxiosResponse } from "axios";
import { Game } from "../lib/game";
import { useGameContext } from "../context/game-context";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";

export default function Home() {
  const router = useRouter()
  const [game, setGame] = useGameContext()

  if (!game) {
    // router.back();

    return null;
  }

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <List>
          {
            game.buyIns.map(buyIn => (
              <ListItem>
                {buyIn.accountId}: ${buyIn.amount}
              </ListItem>
            ))
          }
        </List>
      </div>
    </main>
  );
}
 