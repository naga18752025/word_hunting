document.getElementById("check-answer-text2").textContent = "フクロウ";

function gameQuit(){
    const result = confirm("本当にゲームを中断しますか？");
    if(result){
        window.location.href = "index.html";
    }
}

function questionFormOpen(){
    if(questionNokori <0){
        return;
    }
    document.getElementById("buttons").style.display = "none";
    document.getElementById("question-form").style.display = "flex";
}

function questionFormClose(){
    document.getElementById("buttons").style.display = "flex";
    document.getElementById("question-form").style.display = "none";
    document.getElementById("question-input").value = "";
}

function answerFormOpen(){
    document.getElementById("buttons").style.display = "none";
    document.getElementById("answer-form").style.display = "flex";
}

function answerFormClose(){
    document.getElementById("buttons").style.display = "flex";
    document.getElementById("answer-form").style.display = "none";
    document.getElementById("answer-input").value = "";
}

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

    questionCounter();
    questionFormClose();
    document.getElementById("buttons").style.display = "none";
    responseAdd();
}

let questionNokori = 15;

function questionCounter(){

    document.getElementById("question-remain").textContent = questionNokori;
    questionNokori --;

    if(questionNokori < 0){
        document.getElementById("question-button").style.backgroundColor = "gray";
        document.getElementById("question-button").textContent = "質問終了";
    }
}

questionCounter();

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
    comments.scrollTop = document.getElementById("comments").scrollHeight;

    questionCheck();
}

function questionCheck(){
    setTimeout(() => {
        const lastComment = document.querySelector("#comments .response:last-child");
        lastComment.innerHTML = "";
        lastComment.textContent = "はい";
        document.getElementById("buttons").style.display = "flex";
    }, 2000);
}

function answerCheck(){
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

    document.getElementById("checked-answer").textContent = document.getElementById("answer-input").value;
    answerFormClose();
    document.getElementById("buttons").style.display = "none";
    setTimeout(() => {
        wrongAnswer();
    }, 2000);
}

function correctAnswer(){
    document.getElementById("answer-checking").style.display = "none";
    document.getElementById("check-answer-box").style.display = "flex";
    document.getElementById("success").style.display = "flex";

    const comments = document.getElementById("comments");

    const images = ["images/responser.png", "images/smiler.png"];
    let currentIndex = 1;
    
    document.getElementById("main-owl").src = images[1];
    setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length; 
        document.getElementById("main-owl").src = images[currentIndex];
    }, 1500);
}

function wrongAnswer(){
    document.getElementById("answer-checking").style.display = "none";
    document.getElementById("check-answer-box").style.display = "flex";
    document.getElementById("failure").style.display = "flex";

    const comments = document.getElementById("comments");

    const images = ["images/responser.png", "images/sadder.png"];
    let currentIndex = 1;
    
    document.getElementById("main-owl").src = images[1];
    const Interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length; 
        document.getElementById("main-owl").src = images[currentIndex];
    }, 1500);

    setTimeout(() => {
        clearInterval(Interval);
    }, 6000);
}


