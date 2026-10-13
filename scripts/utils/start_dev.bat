@echo off
if not exist node_modules (
    echo node_modules folder not found. Installing dependencies first...
    npm install
) else (
    echo node_modules folder found.
)

echo.
echo Starting development server...
npm run dev
pause
