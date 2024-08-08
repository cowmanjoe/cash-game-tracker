import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { Game } from "@/app/lib/game";
import { usePathname } from "next/navigation"
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { revalidateTag } from 'next/cache';
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { gameClient } from "@/app/lib/game-client";

export default async function Home(props: { params: Record<string, string>}) {
  const game: Game = await gameClient.getGame(props.params.id)

  console.log(JSON.stringify(game))

  async function addBuyIn(formData: FormData) {
    'use server';
    console.log('addBuyIn')

    const amount = formData.get('amount');

    if (amount === null) {
      throw Error("Amount was null");
    }
    console.log(`amount: ${amount}`)

    try {
      await gameClient.addBuyIn(game.id, 'Account1', amount.toString());
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