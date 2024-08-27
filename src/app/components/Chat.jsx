"use client";

import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function Chat({ inputRef }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey there! I'm your Brew Buddy, here to help you find the perfect coffee. To get started, choose a conversation starter below or ask me anything coffee related!",
    },
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(true);

  const sendMessage = async (msg) => {
    const userMessage = msg || message;
    if (!userMessage.trim()) return; // Don't send empty messages
    setIsLoading(true);
    setOptionsVisible(false);

    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: userMessage },
      { role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((messages) => [
        ...messages,
        {
          role: "assistant",
          content:
            "I'm sorry, but I encountered an error. Please try again later.",
        },
      ]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      width="80%"
      height="600px"
      margin={"auto"}
      backgroundColor="#7F5539"
      border="1px solid rgba(94, 110, 212, .5)"
      borderRadius="8px"
      boxShadow="0 0 10px rgba(255, 255, 255, 0.15)"
      display="flex"
      flexDirection="column"
    >
      <Box
        flexGrow={1}
        overflow="auto"
        p={2}
        display="flex"
        flexDirection="column"
      >
        <Stack direction={"column"} spacing={2}>
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                bgcolor={message.role === "assistant" ? "#DDB892" : "#6f1d1b"}
                color={message.role === "assistant" ? "#432818" : "#EDE0D4"}
                borderRadius={2}
                p={2}
                sx={{ whiteSpace: "pre-wrap" }}
              >
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <Typography
                        variant="body1"
                        color={
                          message.role === "assistant" ? "#432818" : "#EDE0D4"
                        }
                        component="span"
                      >
                        {children}
                      </Typography>
                    ),
                    strong: ({ children }) => (
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color={
                          message.role === "assistant" ? "#432818" : "#EDE0D4"
                        }
                        component="span"
                      >
                        {children}
                      </Typography>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </Box>
            </Box>
          ))}
          {optionsVisible && (
            <Box>
              <Stack spacing={1} mt={2}>
                <Button
                  variant="contained"
                  onClick={() => sendMessage("What are the top-rated coffees?")}
                  sx={{
                    backgroundColor: "rgba(255,255,255,.5)",
                    color: "#432818",
                    "&:hover": { backgroundColor: "rgba(255,255,255,.7)" },
                  }}
                >
                  What are the top-rated coffees?
                </Button>
                <Button
                  variant="contained"
                  onClick={() => sendMessage("Recommend a dark roast coffee.")}
                  sx={{
                    backgroundColor: "rgba(255,255,255,.5)",
                    color: "#432818",
                    "&:hover": { backgroundColor: "rgba(255,255,255,.7)" },
                  }}
                >
                  Recommend a dark roast coffee
                </Button>
                <Button
                  variant="contained"
                  onClick={() =>
                    sendMessage("Show me coffees with fruity flavor profiles.")
                  }
                  sx={{
                    backgroundColor: "rgba(255,255,255,.5)",
                    color: "#432818",
                    "&:hover": { backgroundColor: "rgba(255,255,255,.7)" },
                  }}
                >
                  Show me coffees with fruity flavor profiles
                </Button>
                <Button
                  variant="contained"
                  onClick={() =>
                    sendMessage("What are the best coffees from Colombia?")
                  }
                  sx={{
                    backgroundColor: "rgba(255,255,255,.5)",
                    color: "#432818",
                    "&:hover": { backgroundColor: "rgba(255,255,255,.7)" },
                  }}
                >
                  What are the best coffees from Colombia?
                </Button>
              </Stack>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Stack>
      </Box>
      <Stack
        direction={"row"}
        spacing={2}
        p={2}
        borderTop="1px solid rgba(255, 255, 255, .5)"
      >
        <TextField
          inputRef={inputRef}
          label="Message"
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
          variant="outlined"
          sx={{
            backgroundColor: "#432818",
            border: "solid",
            borderWidth: "1px",
            borderRadius: "4px",
            borderColor: "rgba(255, 255, 255, .45)",
            fontSize: "14px",
            color: "#fff",
          }}
          InputProps={{
            style: {
              color: "#fff",
            },
            classes: {
              notchedOutline: {
                borderColor: "rgba(255, 255, 255, .45)",
              },
            },
          }}
          InputLabelProps={{
            style: { color: "#fff" },
          }}
          inputProps={{
            style: {
              color: "#fff",
            },
          }}
        />
        <Button
          variant="contained"
          onClick={() => sendMessage()}
          disabled={isLoading}
          sx={{ backgroundColor: "#432818", color: "#fff" }}
        >
          {isLoading ? "Sending..." : "Send"}
        </Button>
      </Stack>
    </Box>
  );
}
