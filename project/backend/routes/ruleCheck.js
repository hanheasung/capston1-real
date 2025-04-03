import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

// 키워드 매칭 점수 계산 함수
function calculateMatchScore(questionWords, ruleKeywords) {
    const normalizedQuestion = questionWords.map(word => word.toLowerCase());
    const normalizedKeywords = ruleKeywords.map(word => word.toLowerCase());
    
    let matchCount = 0;
    normalizedQuestion.forEach(word => {
        if (normalizedKeywords.includes(word)) {
            matchCount++;
        }
    });

    // 매칭 점수 계산 (0 ~ 1 사이의 값)
    return matchCount / ruleKeywords.length;
}

router.post('/', async (req, res) => {
    try {
        const { question } = req.body;
        const rulesContent = await fs.readFile('./backend/rules.json', 'utf-8');
        const rules = JSON.parse(rulesContent);

        // 질문을 단어 단위로 분리
        const questionWords = question.split(' ').filter(word => word.length > 0);

        // 가장 높은 매칭 점수를 가진 규칙 찾기
        let bestMatch = null;
        let highestScore = 0;

        rules.rules.forEach(rule => {
            const score = calculateMatchScore(questionWords, rule.keywords);
            if (score > highestScore) {
                highestScore = score;
                bestMatch = rule;
            }
        });

        // 매칭 점수가 60% 이상인 경우에만 응답 반환
        if (bestMatch && highestScore >= 0.6) {
            res.json({ 
                match: true, 
                answer: bestMatch.answer,
                score: Math.round(highestScore * 100) // 매칭 점수를 퍼센트로 변환
            });
        } else {
            res.json({ 
                match: false,
                score: Math.round(highestScore * 100) // 매칭 실패 시에도 점수 반환
            });
        }
    } catch (err) {
        console.error('룰 체크 중 오류:', err);
        res.status(500).json({ error: '룰 체크 중 오류가 발생했습니다.' });
    }
});

export default router;