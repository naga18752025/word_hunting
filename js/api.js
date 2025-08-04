const OPENAI_API_KEY = "apiki-wokaitekudasai"; // ←ここに実際のAPIキーを入れる
// OpenAI APIのエンドポイント
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// AIが選んだキャラクターを記憶しておく変数
let selectedCharacter = null;

/**
 * ゲーム開始：AIにキャラクターを選んでもらう
 */
async function startGame() {
  const prompt = `
あなたは逆アキネーターゲームをプレイします。
以下のカテゴリから1つのものを心の中で選んでください：

- 人物（アニメキャラ、歴史人物、有名人など）
- 物（冷蔵庫、鉛筆、スマートフォンなど）
- 動物（犬、猫、ライオンなど）
- 食べ物（ラーメン、りんご、ケーキなど）
- 場所（学校、公園、東京タワーなど）
- 概念（愛、友情、時間など）

一般常識として多くの人が知っているものを1つ選び、その名前だけを日本語で答えてください。

例：「冷蔵庫」「鉛筆」「ドラえもん」「犬」「ラーメン」「学校」
    `;
  // AIが何かを一つ選んでくれる
  try {
    const response = await callOpenAI(prompt);
    selectedCharacter = response.trim(); // 前後の空白を削除
    console.log("AIが選んだキャラクター:", selectedCharacter); // こっちから見るとき用
    return { success: true, character: selectedCharacter };
  } catch (error) {
    console.error("ゲーム開始でエラー:", error);
    // こっちから見るためのやつ

    return { success: false, error: error.message };
  }
}

/**
 * 質問に対してAIが○×で答える
 * @param {string} question - プレイヤーからの質問
 */
async function askQuestion(question) {
  if (!selectedCharacter) {
    throw new Error("ゲームが開始されていません");
  }

  const prompt = `
あなたは「${selectedCharacter}」について質問に答えてください。
質問：${question}

以下のルールで答えてください：
- 「はい」「いいえ」「部分的にはい」「部分的にいいえ」「わかりません」のいずれかで答える
- 嘘をつかず、一般常識に基づいて答える
- 答えだけを返す（説明は必要なし）
    `;

  try {
    const response = await callOpenAI(prompt);
    return { success: true, answer: response.trim() };
  } catch (error) {
    console.error("質問でエラー:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 答え合わせ
 */
async function revealCharacter() {
  if (!selectedCharacter) {
    throw new Error("ゲームが開始されていません");
  }

  return {
    success: true,
    character: selectedCharacter,
    message: `私が思い浮かべていたキャラクターは「${selectedCharacter}」でした( ´∀｀ )`,
  };
}

/**
 * OpenAI APIを呼び出す共通関数
 * @param {string} prompt - AIに送るメッセージ
 */
async function callOpenAI(prompt) {
  // fetch()でAPIにリクエストを送信
  const response = await fetch(OPENAI_API_URL, {
    method: "POST", // POSTメソッドでデータを送信
    headers: {
      "Content-Type": "application/json", // JSONデータを送ることを明示
      Authorization: `Bearer ${OPENAI_API_KEY}`, // APIキーで認証
    },
    body: JSON.stringify({
      // JavaScriptオブジェクトをJSON文字列に変換
      model: "gpt-3.5-turbo", // 使用するAIモデル
      messages: [
        {
          role: "user", // ユーザーからのメッセージ
          content: prompt, // 実際のメッセージ内容
        },
      ],
      max_tokens: 100, // 返答の最大文字数制限
      temperature: 0.7, // 回答のランダム性（0〜1、高いほどランダム）
    }),
  });

  // レスポンスが成功かチェック
  if (!response.ok) {
    throw new Error(`API エラー: ${response.status} ${response.statusText}`);
  }

  // レスポンスをJSONとして解析
  const data = await response.json();

  // AIの回答を取り出して返す
  return data.choices[0].message.content;
}
// ここまでがAPIのコード
