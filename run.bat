@echo off
setlocal
echo ===================================================
echo   AETHER // LAUNCHING COGNITIVE SANCTUARY
echo ===================================================

where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java is not detected in your system PATH.
    echo Please install Java 11 or higher (e.g. from https://adoptium.net)
    echo or run using Docker: docker build -t aether . ^&^& docker run -p 8080:8080 aether
    pause
    exit /b 1
)

echo [*] Compiling AetherServer.java...
if not exist "bin" mkdir bin
javac -d bin AetherServer.java

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Compilation failed.
    pause
    exit /b 1
)

echo [*] Starting Server on http://localhost:8080 ...
java -cp bin com.aether.AetherServer
pause
