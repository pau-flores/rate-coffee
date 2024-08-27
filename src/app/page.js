"use client";

import { useRef } from "react";
import Chat from "./components/Chat";
import { Button, Container, Grid, Typography } from "@mui/material";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";

export default function Home() {
  const chatInputRef = useRef(null);

  const handleAskClick = () => {
    chatInputRef.current?.focus();
  };

  return (
    <main
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        margin: 0,
      }}
    >
      <Container sx={{}}>
        <Grid container spacing={2}>
          <Grid
            item
            xs={12}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: { xs: "center", lg: "left" },
            }}
          >
            <Typography
              variant="h1"
              gutterBottom
              sx={{
                color: "#432818",
                fontSize: "3rem",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Welcome to CoffeeCurator
            </Typography>
            <Typography
              variant="h3"
              sx={{
                color: "#7F5539",
                fontSize: "1.5rem",
                textAlign: "center",
              }}
            >
              Your AI advisor for that cup of coffee!
            </Typography>
            <Button
              variant="contained"
              onClick={handleAskClick}
              sx={{
                display: "flex",
                width: "fit-content",
                alignItems: "center",
                mt: 4,
                py: 2,
                backgroundColor: "#432818 !important",
                mx: "auto",
              }}
            >
              Ask our AI <ArrowRightAltIcon sx={{ ml: 1 }} />
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Chat inputRef={chatInputRef} />
          </Grid>
        </Grid>
      </Container>
    </main>
  );
}
