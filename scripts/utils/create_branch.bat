@echo off
echo Creating branch feature-pradip...
git checkout -b feature-pradip
if %ERRORLEVEL% NEQ 0 (
    echo Failed to create local branch, checking if it already exists...
    git checkout feature-pradip
)
echo Pushing branch feature-pradip to remote origin...
git push -u origin feature-pradip
if %ERRORLEVEL% EQU 0 (
    echo Branch feature-pradip successfully created and pushed!
) else (
    echo Failed to push branch. Please check your credentials/network.
)
pause
