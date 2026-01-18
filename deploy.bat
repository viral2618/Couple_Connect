@echo off
echo Building Couple Connect for deployment...

echo.
echo Installing dependencies...
call npm install
cd client
call npm install
cd ../server  
call npm install
cd ..

echo.
echo Building client...
cd client
call npm run build
cd ..

echo.
echo Copying client build to server...
xcopy client\.next server\client-build\ /E /I /H /Y
if exist client\public xcopy client\public server\public\ /E /I /H /Y

echo.
echo Build complete! 
echo To start the server: cd server && npm start
echo Server will run on port 3000 with both client and server
pause