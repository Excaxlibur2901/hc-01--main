cd@echo off
echo Starting Hospital Queue Dev Environment...
cd /d "%~dp0"
set LOCAL_MONGO=true
set NODE_ENV=development
npm install
npm run dev
pause

