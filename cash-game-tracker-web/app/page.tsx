import styles from "./page.module.css";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";

export default function Home() {
  return (
    <Container>
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Link href="/game"><Button variant="contained">Host Game</Button></Link>
        <Button variant="contained">Join Game</Button>
      </Box>
    </Container>
  );
}
