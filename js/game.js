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

    answerAdd();
}

let questionNokori = 2;

function questionCounter(){

    document.getElementById("question-remain").textContent = questionNokori;
    questionNokori --;

    if(questionNokori < 0){
        document.getElementById("question-button").style.backgroundColor = "gray";
        document.getElementById("question-button").textContent = "質問終了";
    }
}

questionCounter();

function answerAdd(){
    const newComment = document.createElement("div");

    const comment = document.createElement("span");

    comment.textContent = "・";

    newComment.classList.add("answer");
    newComment.classList.add("loading");

    for (let i = 0; i < 5; i++) {
        const clone = comment.cloneNode(true);
        newComment.appendChild(clone);
    }

    const comments = document.getElementById("comments");

    comments.appendChild(newComment);

    comments.scrollTop = document.getElementById("comments").scrollHeight;

    setTimeout(() => {
        const lastComment = document.querySelector("#comments .answer:last-child");
        lastComment.innerHTML = "";
        lastComment.textContent = "そうです";
    }, 2000);
}

