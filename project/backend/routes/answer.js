const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Question = require('../../database/models').Question;
const Answer = require('../../database/models').Answer;

router.post('/evaluate', async (req, res) => {
  try {
    const { questionId, liked } = req.body;

    // 가장 최근 등록된 답변을 가져옴
    const answers = await Answer.find({ questionId }).sort({ createdAt: -1 });
    if (!answers.length) {
      return res.status(404).json({ error: '답변이 존재하지 않습니다.' });
    }

    const currentAnswer = answers[0];
    currentAnswer.likedByElder = liked;
    await currentAnswer.save();

    // 좋아요일 경우 룰베이스에 추가
    if (liked) {
      const question = await Question.findById(questionId);
      const rulesPath = path.join(__dirname, '../rules.json');
      let rules = [];

      if (fs.existsSync(rulesPath)) {
        rules = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));
      }

      // 중복 방지 (이미 등록된 질문 확인)
      const alreadyExists = rules.some(rule =>
        rule.keywords.join(' ') === question.text.split(' ').join(' ')
      );

      if (!alreadyExists) {
        rules.push({
          keywords: question.text.split(' '),
          response: currentAnswer.text
        });

        fs.writeFileSync(rulesPath, JSON.stringify(rules, null, 2), 'utf-8');
        console.log('✅ rules.json에 새로운 규칙이 저장되었습니다.');
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('💥 평가 처리 오류:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

module.exports = router;
