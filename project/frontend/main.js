let currentQuestionId = null;

// 역할 선택 시 해당 화면만 보여줌
function selectRole(role) {
  document.getElementById("roleSelection").style.display = "none";
  if (role === "elderly") {
    document.getElementById("elderlySection").style.display = "block";
  } else {
    document.getElementById("youthSection").style.display = "block";
    loadPendingQuestions();
  }
}

// 노인 질문 제출
async function submitQuestion() {
  const questionText = document.getElementById("elderlyQuestionInput").value;
  if (!questionText.trim()) return;

  // 1단계: 룰베이스 확인
  const ruleRes = await fetch("/api/rule-check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: questionText })
  });

  const ruleData = await ruleRes.json();

  const answerDiv = document.getElementById("answerArea");
  if (ruleData.answer) {
    answerDiv.innerText = ruleData.answer;
    currentQuestionId = null;
  } else {
    // 2단계: 질문 저장 후 응답 대기
    const saveRes = await fetch("/api/question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: questionText })
    });

    const saveData = await saveRes.json();
    currentQuestionId = saveData.questionId;
    answerDiv.innerText = "답변을 기다리는 중입니다.";
  }
}

// 답변 평가: 좋아요 or 별로예요
async function evaluateAnswer(isGood) {
  if (!currentQuestionId) return;

  await fetch(`/api/answer/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      questionId: currentQuestionId,
      liked: isGood
    })
  });

  if (isGood) {
    document.getElementById("answerArea").innerText = "감사합니다. 답변이 저장되었습니다.";
  } else {
    document.getElementById("answerArea").innerText = "다른 청년의 답변을 불러오는 중...";

    const next = await fetch(`/api/answer/next/${currentQuestionId}`);
    const data = await next.json();

    if (data.answer) {
      document.getElementById("answerArea").innerText = data.answer;
    } else {
      document.getElementById("answerArea").innerText = "더 이상 등록된 답변이 없습니다.";
    }
  }
}

// 청년용 질문 불러오기
async function loadPendingQuestions() {
  const res = await fetch("/api/question/pending");
  const data = await res.json();

  const pendingDiv = document.getElementById("pendingQuestions");
  pendingDiv.innerHTML = "";

  data.questions.forEach(q => {
    const qDiv = document.createElement("div");
    qDiv.innerHTML = `
      <p><strong>질문:</strong> ${q.text}</p>
      <textarea id="answerInput-${q._id}" placeholder="답변 작성"></textarea>
      <button onclick="submitAnswer('${q._id}')">답변 제출</button>
      <hr/>
    `;
    pendingDiv.appendChild(qDiv);
  });
}

// 청년이 답변 제출
async function submitAnswer(questionId) {
  const text = document.getElementById(`answerInput-${questionId}`).value;

  await fetch("/api/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      questionId,
      text
    })
  });

  alert("답변이 등록되었습니다!");
  loadPendingQuestions(); // 새로고침
}
