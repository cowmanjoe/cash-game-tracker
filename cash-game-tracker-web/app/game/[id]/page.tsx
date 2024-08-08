import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { Game } from "@/app/lib/game";
import { usePathname } from "next/navigation"
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { revalidateTag } from 'next/cache';
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

export default async function Home(props: { params: Record<string, string>}) {
  const game: Game = await fetch(`http://localhost:8080/game/${props.params.id}`, { next: { tags: ['game'] } }).then(res => res.json())

  console.log(JSON.stringify(game))

  async function addBuyIn(formData: FormData) {
    'use server';
    console.log('addBuyIn')

    const amount = formData.get('amount');
    console.log(`amount: ${amount}`)

    try {
      const response = await fetch(`http://localhost:8080/game/${props.params.id}/buy-in`, {
        method: 'POST',
        body: JSON.stringify({
          accountId: 'Account1',
          amount
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status >= 400) {
        console.error(`Got a bad response: ${await response.text()}`)
      } else {
        revalidateTag('game');
      }
    } catch(e) {
      console.error(e)
    }

  }

  return (
    <Container>
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
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
      </Box>
      
    </Container>
    
  );
}