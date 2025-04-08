import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// 라우터 불러오기
import ruleCheckRouter from './routes/ruleCheck.js';
import questionRouter from './routes/question.js';
import answerRouter from './routes/answer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 정적 파일 제공 (프론트엔드)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// 라우터 연결
app.use('/api/rule-check', ruleCheckRouter);
app.use('/api/question', questionRouter);
app.use('/api/answer', answerRouter);

// 서버 시작
const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('MongoDB connection failed:', err);
  process.exit(1);
});
