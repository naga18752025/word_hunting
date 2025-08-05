const BACKEND_URL = "http://localhost:3001";

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
    const response = await callBackendAPI(prompt);
    selectedCharacter = response.content.trim(); // 前後の空白を削除
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
    const response = await callBackendAPI(prompt);
    return { success: true, answer: response.content.trim() };
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
async function callBackendAPI(prompt) {
  // fetch()でAPIにリクエストを送信
  const response = await fetch(BACKEND_URL + "/api/openai", {
    method: "POST", // POSTメソッドでデータを送信
    headers: {
      "Content-Type": "application/json", // JSONデータを送ることを明示
    },
    body: JSON.stringify({ prompt }),
  });

  // レスポンスが成功かチェック
  if (!response.ok) {
    throw new Error(`API エラー: ${response.status} ${response.statusText}`);
  }

  // レスポンスをJSONとして解析
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error);
  }
  return data; // { success: true, content: "回答" }
  // ここまでがAPIの呼び出し部分
}
// 改善の余地としてはエラーハンドリングをしっかりするぐらいだと思います
