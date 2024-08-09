import { Game } from "@/app/lib/game";
import { gameClient } from "@/app/lib/game-client";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import OutlinedInput from "@mui/material/OutlinedInput";

export default async function Home(props: { params: Record<string, string> }) {
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
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} className="formGrid">
          <form action={addBuyIn}>
            <OutlinedInput
              id="amount"
              name="amount"
              placeholder="Amount"
              required
            />

            <Button variant="outlined" type="submit">Add Buy In</Button>
          </form>
          
        </Grid>
        <List>
          {
            game.buyIns.map(buyIn => 
              <ListItem key={buyIn.id}>
                {buyIn.accountId}: {buyIn.amount}
              </ListItem>
            )
          }

          
        </List>
      </Grid>
    </Container>

  );
}