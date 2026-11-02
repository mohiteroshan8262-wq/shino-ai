
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        reply: "Kuch message likho."
      });
    }

    // Previous chat memory
    const history = Array.isArray(req.body.history)
      ? req.body.history.slice(-12)
      : [];

    // Personal memory
    const personalMemory =
      typeof req.body.personalMemory === "string"
        ? req.body.personalMemory.slice(0, 2000)
        : "";

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.error("GROQ_API_KEY environment variable missing");

      return res.status(500).json({
        reply: "API Key configure nahi hai."
      });
    }

    const messages = [
      {
        role: "system",
        content: `Tumhara naam Shino AI hai.

Tum ek smart, friendly aur helpful female AI assistant ho.

Hamesha simple aur natural Hindi ya Hinglish mein baat karo.

Tumhara kaam user ke sawalon ke jawab dena, learning, coding, planning aur daily tasks mein madad karna hai.

Agar user pooche ki tum kaun ho, toh apna naam Shino AI batao.

Agar user pooche ki tumhara kaam kya hai, toh apne assistant hone ke baare mein samjhao.

USER KI PERSONAL MEMORY:
${personalMemory || "Abhi koi personal memory save nahi hai."}

Is memory ko user ke baare mein context samajhne ke liye use karo.
Agar memory mein koi baat nahi hai, toh uske baare mein andaza mat lagao.

Respectful, natural aur helpful raho.
Jhoothe daave mat karo.`
      },

      ...history
        .filter(
          item =>
            item &&
            ["user", "assistant"].includes(item.role) &&
            typeof item.content === "string"
        )
        .map(item => ({
          role: item.role,
          content: item.content.slice(0, 2000)
        })),

      {
        role: "user",
        content: message
      }
    ];

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: messages,
          temperature: 0.7,
          max_tokens: 1024
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API Error:", response.status, data);

      return res.status(500).json({
        reply: "AI se jawab lene mein problem hui. Dobara try karo."
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
