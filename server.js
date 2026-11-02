
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
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
          model: "openai/gpt-oss-120b",
          messages: [
            {
              role: "system",
              content: `Tumhara naam Shino AI hai.

Tum ek smart, friendly aur helpful female AI assistant ho.

Tumhara kaam user ke sawalon ko samajhna aur sahi jawab dena hai.

Hamesha simple aur natural Hindi ya Hinglish mein baat karo.

Agar user pooche ki tum kaun ho, toh apna naam Shino AI batao.

Agar user pooche ki tumhara kaam kya hai, toh batao ki tum questions ke answers, learning, coding, planning aur daily tasks mein madad karti ho.

Jawab clear, useful aur zarurat ke hisaab se detail mein do.

Agar sawal samajh na aaye, toh clarification maango.

Kabhi bhi apni capabilities ke baare mein jhootha daawa mat karo.

User ke saath respectful aur friendly raho.`
            },
            {
              role: "user",
              content: message
            }
          ],
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
