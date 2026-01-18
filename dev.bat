@echo off
echo Starting Couple Connect in development mode...

echo Installing dependencies...
call npm install
cd client && call npm install
cd ../server && call npm install
cd ..

echo Starting development servers...
start "Client Dev Server" cmd /k "cd client && npm run dev"
start "Server Dev" cmd /k "cd server && npm run dev"

echo Both servers are starting...
echo Client: http://localhost:3000
echo Server: http://localhost:3001
pause