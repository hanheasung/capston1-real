const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

// 라우터 불러오기
const ruleCheckRouter = require('./routes/ruleCheck');
const questionRouter = require('./routes/question');
const answerRouter = require('./routes/answer');

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
