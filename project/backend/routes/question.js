import express from 'express';
import { Question } from '../../database/models.js';
import fs from 'fs/promises';
const express = require("express");
const router = express.Router();

// 질문 저장
router.post('/', async (req, res) => {
    try {
        const question = new Question({
            text: req.body.question,
            status: 'pending'
        });
        await question.save();
        res.json({ questionId: question._id });
    } catch (err) {
        res.status(500).json({ error: '질문 저장 중 오류가 발생했습니다.' });
    }
});

// 대기 중인 질문 목록 조회
router.get('/pending', async (req, res) => {
    try {
        const questions = await Question.find({ status: 'pending' })
            .sort({ createdAt: -1 });
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: '질문 조회 중 오류가 발생했습니다.' });
    }
});

// 질문 평가
router.post('/:id/evaluate', async (req, res) => {
    try {
        const { id } = req.params;
        const { evaluation } = req.body;
        
        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ error: '질문을 찾을 수 없습니다.' });
        }

        if (evaluation === 'like') {
            const rulesContent = await fs.readFile('./backend/rules.json', 'utf-8');
            const rules = JSON.parse(rulesContent);
            
            // 중복 체크
            const isDuplicate = rules.rules.some(rule => 
                rule.keywords.join(' ') === question.text ||
                rule.answer === question.answer
            );

            if (!isDuplicate) {
                // 새로운 규칙 추가
                rules.rules.push({
                    keywords: question.text.split(' ').filter(word => word.length > 0),
                    answer: question.answer
                });

                // rules.json 파일 업데이트
                await fs.writeFile(
                    './backend/rules.json', 
                    JSON.stringify(rules, null, 2)
                );
            }
            
            question.status = 'approved';
        } else {
            question.status = 'rejected';
        }

        await question.save();
        res.json({ success: true });
    } catch (err) {
        console.error('평가 처리 중 오류:', err);
        res.status(500).json({ error: '평가 처리 중 오류가 발생했습니다.' });
    }
});

export default router;
module.exports = router;


