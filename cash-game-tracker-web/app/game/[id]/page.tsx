import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import styles from "../../page.module.css";
import { Game } from "@/app/lib/game";
import { usePathname } from "next/navigation"

export default async function Home(props: { params: Record<string, string>}) {
  const game: Game = await fetch(`http://localhost:8080/game/${props.params.id}`).then(res => res.json())

  console.log(JSON.stringify(game))

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