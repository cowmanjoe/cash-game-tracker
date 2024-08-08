import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup"
import Image from "next/image";
import styles from "./page.module.css";
import axios from "axios";
import Link from "next/link";

export default async function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <ButtonGroup variant="contained">
          <Link href="/game"><Button variant="contained">Host Game</Button></Link>
          <Button variant="contained">Join Game</Button>
        </ButtonGroup>
      </div>
    </main>
  );
}
