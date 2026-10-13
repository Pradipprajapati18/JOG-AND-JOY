@echo off
echo Committing logo animation changes...

:: Stage the BrandLogo changes
git add src/components/ui/BrandLogo.jsx

:: Commit
git commit -m "feat: implement premium toy block assembly logo animation in header"

:: Push to origin (fork)
echo.
echo Pushing to origin/feature-pradip...
git push origin feature-pradip

:: Push to upstream (main repo)
echo.
echo Pushing to upstream/feature-pradip...
git push upstream feature-pradip

echo.
echo Changes successfully committed and pushed!
pause
