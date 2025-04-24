@echo off
echo Creating GitHub repository and pushing code...
echo.

echo Step 1: Creating a new GitHub repository...
echo Please go to https://github.com/new in your browser
echo Name the repository "binance-mcp"
echo Do NOT initialize with README, .gitignore, or license
echo Click "Create repository"
echo.
echo Press any key when you've created the repository...
pause > nul

echo.
echo Step 2: Adding GitHub as a remote and pushing code...
git remote add origin https://github.com/py7hagoras/binance-mcp.git
echo.

echo Step 3: Pushing code to GitHub...
git push -u origin master
echo.

echo Done! Your code should now be available at:
echo https://github.com/py7hagoras/binance-mcp
echo.
echo Press any key to exit...
pause > nul
