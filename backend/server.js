// オープンAI　APIの中継サーバー

const express = require("express");
// ノード.jsのフレームワーク
const cors = require("cors");
require("dotenv").config();
// .envを読み込むためのやつ

const app = express();
app.use(cors());
// どこからでもアクセスできるようにする
app.use(express.json());
// json形式のデータを受け取れるようにするやつ
// 下のコードは特定のURLにPOSTリクエストが来たときの処理を書いてます。
app.post("/api/openai", async (req, res) => {
  try {
    const { prompt } = req.body;
    // フロントエンドから送られてきたデータからpromptを取り出す

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    res.json({ success: true, content: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
  // なんか番号で、エラーメッセージ決まってるらしいです。
});
// ３５行目はオープンAIの回答から実際の文章部分だけを取り出す処理です。
app.listen(3001, () => console.log("サーバー起動: http://localhost:3001"));
