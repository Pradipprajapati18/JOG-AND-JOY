@echo off
echo Adding upstream remote for https://github.com/sbs-prospects-in/JOG-AND-JOY.git...
git remote add upstream https://github.com/sbs-prospects-in/JOG-AND-JOY.git 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Remote 'upstream' already exists, setting its URL...
    git remote set-url upstream https://github.com/sbs-prospects-in/JOG-AND-JOY.git
)

echo Pushing branch feature-pradip to upstream...
git push -u upstream feature-pradip
if %ERRORLEVEL% EQU 0 (
    echo Branch feature-pradip successfully pushed to sbs-prospects-in/JOG-AND-JOY!
) else (
    echo.
    echo [ERROR] Failed to push branch.
    echo Please make sure you have push/write permissions on the sbs-prospects-in/JOG-AND-JOY repository.
    echo If you do not have write access, you may need to open a Pull Request from your fork instead.
)
pause
