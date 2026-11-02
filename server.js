const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message) {
      return res.status(400).json({
        reply: "Kuch message likho."
      });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.error("GROQ_API_KEY environment variable missing");

      return res.status(500).json({
        reply: "API Key configure nahi hai."
      });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "Tumhara naam Shino hai. Tum ek friendly female Hindi AI assistant ho. Simple Hindi mein jawab do."
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API Error:", response.status, data);

      return res.status(500).json({
        reply: "Groq API Error: " +
          (data.error?.message || "Unknown error")
      });
    }

    const reply =
      data.choices?.[0]?.message?.content || "Jawab nahi mila.";

    res.json({ reply });

  } catch (error) {
    console.error("Server Error:", error);

    res.status(500).json({
      reply: "Server mein problem hai. Dobara try karo."
    });
  }
});

app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
  console.log("Shino AI server started");
});

