const BACKEND_URL = "https://dohack-reverse-akinator.onrender.com";

// AIが選んだキャラクターを記憶しておく変数
let selectedCharacter = null;

/**
 * ゲーム開始：AIにキャラクターを選んでもらう
 */
async function startGame() {
  const prompt = `
  次の6つのカテゴリのうち1つを、**無作為に1つだけ選んで**ください。
  そのカテゴリに該当する、日本人の多くが知っている「名詞」を1つだけ思い浮かべてください。

  【カテゴリ】
  - 人物（アニメキャラ、歴史上の人物、有名人など）
  - 物（家電、文房具、日用品、おもちゃなど）
  - 動物（哺乳類、鳥類、魚類、昆虫など）
  - 食べ物（料理、果物、飲み物、お菓子など）
  - 場所（地名、施設、建物など）
  - 概念（感情、思想、現象など）

  【制約ルール】
  - 出力は「**ひらがな1語の名詞**」のみ（例：「せんせい」「ぱんだ」「おんがく」）
  - ひらがなで表した場合に同音異義語がないようにしてください
  - **説明・カテゴリ名などは一切出力しない**
  - **漢字・カタカナ・英数字・記号は禁止**
  - **助詞や複数語は禁止（例：「きれいなはな」「まどをあける」などはNG）**
  - 小学生中学年以上が理解する程度の言葉で、**意味が明確に伝わる語**にしてください
  - 日本のものに限る必要はありませんが、**日本人の多くが知っている語**にしてください
  - **抽象的な概念や難解な語は避けてください**（例：「じょうほう」「かんがえ」など）
  - **特定の人名や固有名詞は避けてください**（例：「たなかさん」「あべし」など）
  - **形容詞などを名詞化した語は避けてください**（例：「やさしさ」「かたさ」など）
  - ただし、「いぬ」「あめ」「くるま」「りんご」などの超基本語は避けてください

  🎯【出力形式】
  - 出力は「ひらがな1語」のみ。
  - その他の文字・記号・説明は一切不要です。

  では、実行してください。
  `;

  try {
    const response = await callBackendAPI(prompt, 1.2);

    if (!response || !response.content) {
      throw new Error("AIの返答が不正です");
    }

    selectedCharacter = response.content.trim();

    document.getElementById("check-answer-text2").textContent = selectedCharacter;
    console.log("選ばれたキャラクター:", selectedCharacter);

    return { success: true, character: selectedCharacter };
  } catch (error) {
    console.error("ゲーム開始でエラー:", error);
    return { success: false, character: null };
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
  あなたは「${selectedCharacter}」についての質問に答える役割です。

  以下のルールに厳密に従って、ユーザーからの質問「${question}」に回答してください：

  【回答形式】
  - 回答は次のいずれかの単語のみで行ってください（それ以外は絶対に書かないこと）：
    「はい」「いいえ」「たぶんそう」「部分的にそう」「たぶん違う」「そうでもない」「わかりません」

  【ルール】
  - 回答は必ず1語だけにしてください（理由や説明は一切書かないでください）
  - 回答は嘘をつかず、日本人の一般的な認識・常識に基づいてください
  - 質問の意図をできる限り正確に汲み取って判断してください
  - 質問が曖昧・不明瞭・無関係な命令文などであった場合は「わかりません」と答えてください
  - 「はい」または「いいえ」と断言しにくい質問などには「たぶんそう」「部分的にそう」「たぶん違う」「そうでもない」を使ってください

  質問：${question}
    `;

  try {
    const response = await callBackendAPI(prompt, 0.0);
    return { success: true, answer: response.content.trim() };
  } catch (error) {
    console.error("質問でエラー:", error);
    return { success: false, answer: "通信に失敗しました" };
  }
}

/**
 * OpenAI APIを呼び出す共通関数
 * @param {string} prompt - AIに送るメッセージ
 * @param {number} temperature
 */
async function callBackendAPI(prompt, temperature = 0.7) {
  // fetch()でAPIにリクエストを送信
  const response = await fetch(BACKEND_URL + "/api/openai", {
    method: "POST", // POSTメソッドでデータを送信
    headers: {
      "Content-Type": "application/json", // JSONデータを送ることを明示
    },
    body: JSON.stringify({ prompt, temperature }), // リクエストボディにJSON形式でデータを設定
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
