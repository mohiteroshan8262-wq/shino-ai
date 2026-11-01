const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Shino AI is running!");
});

app.post("/chat", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "Tumhara naam Shino hai. Tum ek friendly Hindi AI assistant ho. Hamesha simple Hindi mein jawab do."
            },
            {
              role: "user",
              content: req.body.message
            }
          ]
        })
      }
    );

    const data = await response.json();
    res.json({
      reply: data.choices?.[0]?.message?.content || "Mujhe jawab nahi mila."
    });

  } catch (error) {
    res.status(500).json({ reply: "Server mein problem hai." });
  }
});

app.listen(process.env.PORT || 3000);
