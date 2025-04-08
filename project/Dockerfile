# Node.js 베이스 이미지 사용
FROM node:18

# 작업 디렉토리 생성
WORKDIR /app

# package.json 복사 및 의존성 설치
COPY package*.json ./
RUN npm install

# 전체 프로젝트 복사
COPY . .

# 환경 변수 파일 포함
COPY .env .env

# 3000번 포트 열기
EXPOSE 3000

# 서버 실행
CMD ["node", "backend/server.js"]
