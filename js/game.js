let loadingTimeout = null;

function startLoading() {
    document.getElementById("loading3").style.display = "flex";
    loadingTimeout = setTimeout(() => {
        document.getElementById("long-loading").style.display = "block";
        document.getElementById("mole-game-container").style.display = "flex";
    }, 4000);
}

function stopLoading() {
    clearTimeout(loadingTimeout);
    loadingTimeout = null;

    document.getElementById("loading3").style.display = "none";
    document.getElementById("long-loading").style.display = "none";
    document.getElementById("mole-game-container").style.display = "none";
}

let sessionId = null;

async function fetchTheme(maxRetries = 10, retryInterval = 2000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`テーマ決定 試行${attempt}回目`);
            const result = await startGame(localStorage.getItem("id"));
            if (result.success) {
                console.log("テーマ決定成功");
                return result;
            }
        } catch (err) {
            console.warn(`接続失敗 (${attempt}回目):`, err);
        }
        if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryInterval));
        }
    }
    return null;
}

async function main() {
    startLoading();

    if (localStorage.getItem("reload") === "none") {
        localStorage.setItem("reload", "done");
    } else {
        alert("不正な操作を検知しました。");
        window.location.href = "index.html";
        return;
    }

    const result = await fetchTheme();
    if (!result || !result.success) {
        alert("ゲーム開始に失敗しました。もう一度試してください。");
        window.location.href = "index.html";
        return;
    }

    sessionId = result.sessionId;

    stopLoading();
    startTimer();
}

main();

let usedHint = false;

async function getHint() {
    if (usedHint) {
        alert("ヒントは使用済みです");
        return;
    }

    let caution = "";
    if(localStorage.getItem("id")){
        caution = "\n＊正解時の正解数が0.5になります";
    }
    if (confirm("本当にヒントを使用しますか？" + caution)) {
        try {
            questionFormClose();
            answerFormClose();
            document.getElementById("buttons").style.display = "none";
            usedHint = true;
            document.getElementById("hint-button").style.backgroundColor = "gray";
            const newComment = document.createElement("div");
            const comment = document.createElement("span");
            comment.textContent = "・";
            newComment.classList.add("hint");
            newComment.classList.add("loading");
            for (let i = 0; i < 5; i++) {
                const clone = comment.cloneNode(true);
                newComment.appendChild(clone);
            }
            const comments = document.getElementById("comments");
            comments.appendChild(newComment);
            setTimeout(() => {
                comments.scrollTop = comments.scrollHeight;
            }, 0);
            const result = await addHint(sessionId, (30 - questionNokori));
            
            if (!result.success) {
                alert("ヒントの取得に失敗しました");
                document.querySelector(".hint").remove();
                document.getElementById("buttons").style.display = "flex";
                return;
            }

            const hint = result.hint;
            newComment.textContent = hint;
            document.getElementById("buttons").style.display = "flex";
        } catch (err) {
            alert("ヒントの取得中にエラーが発生しました");
            document.querySelector(".hint").remove();
            document.getElementById("buttons").style.display = "flex";
        }
    }
}

// ゲームの中断
async function gameQuit(){
    const result = confirm("本当にゲームを中断しますか？");
    if(result){
        startLoading();
        try {
            const { answer, isCorrect } = await sendAnswerWithRetry(sessionId, "----", "中断", 3);
            document.getElementById("check-answer-text2").textContent = answer;

            stopTimer();
            document.getElementById("timer").textContent = "中断";
            document.getElementById("checked-answer").textContent = "----";
            document.querySelectorAll(".question").forEach(Q => {
                Q.style.display = "none";
            })
            document.querySelectorAll(".response").forEach(R => {
                R.style.display = "none";
            })
            if(document.querySelector(".hint")){
                document.querySelector(".hint").style.display = "none";
            }
            sessionId = null;
            showAnswerResult(false);
            questionFormClose();
            answerFormClose();
            document.getElementById("check-answer-box").style.display = "flex";
            document.getElementById("buttons").style.display = "none";
            document.getElementById("quit").style.display = "none";
            document.getElementById("hint-button").style.display = "none";
            stopLoading();
        } catch {
            alert("通信に失敗しました。");
            window.location.href = "index.html";
        }
    }
}

// 質問の入力画面を表示する
function questionFormOpen(){
    if(questionNokori < 0){
        return;
    }
    document.getElementById("buttons").style.display = "none";
    document.getElementById("question-form").style.display = "flex";
}

// 質問の入力画面を閉じる
function questionFormClose(){
    document.getElementById("buttons").style.display = "flex";
    document.getElementById("question-form").style.display = "none";
}

// 解答の入力画面を表示する
function answerFormOpen(){
    document.getElementById("buttons").style.display = "none";
    document.getElementById("answer-form").style.display = "flex";
}

// 解答の入力画面を閉じる
function answerFormClose(){
    document.getElementById("buttons").style.display = "flex";
    document.getElementById("answer-form").style.display = "none";
}

// 質問追加工程
function questionAdd(){
    const question = document.getElementById("question-input");

    if(question.value === ""){
        alert("質問を入力してください")
        return;
    }

    const result = confirm("本当にこの内容で質問しますか？");
    if (!result) {
        return;
    }

    const newComment = document.createElement("div");
    const comment = question.value;
    newComment.textContent = comment;
    newComment.classList.add("question");
    document.getElementById("comments").appendChild(newComment);

    questionFormClose();
    document.getElementById("buttons").style.display = "none";

    responseAdd();
}

let questionNokori = 30;

// 質問回数を管理
function questionCounter(){
    document.getElementById("question-remain").textContent = questionNokori;
    questionNokori --;

    if(questionNokori < 0){
        document.getElementById("question-button").style.backgroundColor = "gray";
        document.getElementById("question-button").textContent = "質問終了";
    }
}

questionCounter();

// AIの回答追加の前工程
function responseAdd(){
    const newComment = document.createElement("div");
    const comment = document.createElement("span");
    comment.textContent = "・";
    newComment.classList.add("response");
    newComment.classList.add("loading");
    for (let i = 0; i < 5; i++) {
        const clone = comment.cloneNode(true);
        newComment.appendChild(clone);
    }
    const comments = document.getElementById("comments");
    comments.appendChild(newComment);
    setTimeout(() => {
        comments.scrollTop = comments.scrollHeight;
    }, 0);

    questionCheck();
}

// AIの回答を実際に追加
async function questionCheck(){
    const { answer: response } = await askQuestion(document.getElementById("question-input").value, sessionId);
    if(response === "通信に失敗しました"){
    }else{
        questionCounter();
    }
    const lastComment = document.querySelector("#comments .response:last-child");
    lastComment.innerHTML = "";
    lastComment.textContent = response;

    document.getElementById("buttons").style.display = "flex";
    document.getElementById("question-input").value = ""; 
    addComment(30 - questionNokori - 1);
}

// 解答の決定工程
async function answerCheck(){
    const re = /^[\p{Script=Hiragana}\u30FC]+$/u;
    if(!re.test(document.getElementById("answer-input").value.trim())){
        alert("解答はひらがなで入力してください");
        return;
    }

    const result = confirm("本当にこの内容で解答しますか？");
    if (!result) {
        return;
    }

    document.querySelectorAll(".question").forEach(Q => {
        Q.style.display = "none";
    })
    document.querySelectorAll(".response").forEach(R => {
        R.style.display = "none";
    })
    if(document.querySelector(".hint")){
        document.querySelector(".hint").style.display = "none";
    }

    const newComment = document.createElement("div");
    newComment.id = "answer-checking";
    newComment.textContent = "解答確認中";
    const comment = document.createElement("span");
    comment.textContent = ".";
    newComment.classList.add("loading2");
    for (let i = 0; i < 3; i++) {
        const clone = comment.cloneNode(true);
        newComment.appendChild(clone);
    }
    const comments = document.getElementById("comments");
    comments.style.justifyContent = "center";
    comments.appendChild(newComment);
    comments.scrollTop = document.getElementById("comments").scrollHeight;

    document.getElementById("checked-answer").textContent = document.getElementById("answer-input").value.trim();

    answerFormClose();
    document.getElementById("buttons").style.display = "none";
    document.getElementById("quit").style.display = "none";
    document.getElementById("hint-button").style.display = "none";

    try {
        const { answer, isCorrect } = await sendAnswerWithRetry(sessionId, document.getElementById("answer-input").value.trim(), stopTimer(), 3);

        document.getElementById("check-answer-text2").textContent = answer;

        setTimeout(() => {
            document.getElementById("answer-checking").style.display = "none";
            showAnswerResult(isCorrect);
        }, 1500);

    } catch (err) {
        alert("解答の送信に失敗しました。");
        window.location.href = "index.html";
    }
}

async function sendAnswerWithRetry(sessionId, answerInput, timer, maxRetries = 3) {
    let attempt = 0;
    let lastError;

    while (attempt < maxRetries) {
        try {
            const { answer, isCorrect } = await updateSession(sessionId, answerInput, timer, localStorage.getItem("id"));
            sessionId = null;
            return { answer, isCorrect };
        } catch (err) {
            lastError = err;
            attempt++;
            console.warn(`送信失敗(${attempt}回目)、再試行中...`);

            await new Promise(res => setTimeout(res, 500)); 
        }
    }

    throw lastError;
}

function showAnswerResult(isCorrect) {
    document.getElementById("check-answer-box").style.display = "flex";
    document.getElementById("result").style.display = "flex";

    const text = isCorrect ? "🎊大正解🎊" : "残念...不正解";
    const images = isCorrect
        ? ["images/responser.png", "images/smiler.png"]
        : ["images/responser.png", "images/sadder.png"];

    document.getElementById("SorF").textContent = text;

    let currentIndex = 1;
    const mainOwl = document.getElementById("main-owl");
    mainOwl.src = images[1];

    const intervalId = setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        mainOwl.src = images[currentIndex];
    }, 1500);

    if (!isCorrect) {
        setTimeout(() => clearInterval(intervalId), 6000);
    }
}

function finishGame(){
    document.getElementById("loading3").style.display = "flex";
    window.location.href = "index.html";
}

function loginCheck(){
    if(localStorage.getItem("account")){
        document.getElementById("account").textContent = localStorage.getItem("account");
    }
}

loginCheck();