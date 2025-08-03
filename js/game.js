function gameQuit(){
    confirm("本当にゲームを中断しますか？");
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
    
    const newComment = document.createElement("div");
    newComment.textContent = "解答確認中";
    const comment = document.createElement("span");
    comment.textContent = ".";

    newComment.classList.add("loading2");

    for (let i = 0; i < 3; i++) {
        const clone = comment.cloneNode(true);
        newComment.appendChild(clone);
    }

    const comments = document.getElementById("comments");
    comments.innerHTML = "";
    comments.style.justifyContent = "center";
    comments.appendChild(newComment);
    comments.scrollTop = document.getElementById("comments").scrollHeight;

    answerFormClose();
    document.getElementById("buttons").style.display = "none";

    setTimeout(() => {
        correctAnswer();
    }, 2000);
}

function correctAnswer(){
    const comments = document.getElementById("comments");
    comments.innerHTML = "";
    comments.textContent = "🎊正解🎊";

    const images = ["images/responser.png", "images/smiler.png"];
    let currentIndex = 1;
    
    document.getElementById("main-owl").src = images[1];
    setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length; 
        document.getElementById("main-owl").src = images[currentIndex];
    }, 1500);
}


