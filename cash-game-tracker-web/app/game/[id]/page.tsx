import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import styles from "../../page.module.css";
import { Game } from "@/app/lib/game";
import { usePathname } from "next/navigation"
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { revalidateTag } from 'next/cache';

export default async function Home(props: { params: Record<string, string>}) {
  const game: Game = await fetch(`http://localhost:8080/game/${props.params.id}`, { next: { tags: ['game'] } }).then(res => res.json())

  console.log(JSON.stringify(game))

  async function addBuyIn(formData: FormData) {
    'use server';
    console.log('addBuyIn')

    const amount = formData.get('amount');
    console.log(`amount: ${amount}`)

    const newGame = await fetch(`http://localhost:8080/game/${props.params.id}/buy-in`, {
      method: 'POST',
      body: JSON.stringify({
        accountId: 'Account1',
        amount
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    revalidateTag('game');
  }

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <form action={addBuyIn}>
          <TextField name="amount" label="Amount" variant="outlined" />
          <Button variant="outlined" type="submit">"Add Buy In"</Button>
        </form>
        <List>
          {
            game.buyIns.map(buyIn => (
              <ListItem key={buyIn.id}>
                {buyIn.accountId}: ${buyIn.amount}
              </ListItem>
            ))
          }
        </List>
      </div>
    </main>
  );
}