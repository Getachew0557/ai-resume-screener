@echo off
echo Killing existing node/python processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1

echo Starting Auth Service (3000)...
start "Auth Service" cmd /k "cd services/auth-service && npm run start"

echo Starting Recruitment Service (3001)...
start "Recruitment Service" cmd /k "cd services/recruitment-service && npm run dev"

echo Starting Employee Service (3002)...
start "Employee Service" cmd /k "cd services/employee-service && npm run dev"

echo Starting Leave Service (3003)...
start "Leave Service" cmd /k "cd services/leave-service && npm run dev"

echo Starting Attendance Service (3004)...
start "Attendance Service" cmd /k "cd services/attendance-service && npm run dev"

echo Starting Org Structure Service (3006)...
start "Org Structure Service" cmd /k "cd services/org-structure-service && npm start"

echo Starting Training Service (3007)...
start "Training Service" cmd /k "cd services/training-service && npm start"

echo Starting Benefits Service (3008)...
start "Benefits Service" cmd /k "cd services/benefits-service && npm start"

echo Starting Reporting Service (3009)...
start "Reporting Service" cmd /k "cd services/reporting-service && npm start"

echo Starting Chatbot Service (5006)...
start "Chatbot Service" cmd /k "cd services/chatbot-service && python server.py"

echo Starting AI Agent Service (5005)...
echo NOTE: Since you are using Conda, make sure python resolves to the corect environment.
start "AI Agent Service" cmd /k "cd services/ai-agent-service && python src/server.py"

echo Starting Frontend (5173)...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo All services launched in separate windows.
pause
