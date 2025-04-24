# GitHub Repository Setup Instructions

Follow these steps to create a new GitHub repository and push this code to it:

## 1. Create a new GitHub repository

1. Go to [GitHub](https://github.com/) and sign in to your account
2. Click on the "+" icon in the top-right corner and select "New repository"
3. Enter "binance-mcp" as the repository name (or you can create it directly at https://github.com/new)
4. Add a description (optional): "A Binance MCP server for AI assistants"
5. Choose whether to make the repository public or private
6. Do NOT initialize the repository with a README, .gitignore, or license (we already have these files)
7. Click "Create repository"

## 2. Push your local repository to GitHub

After creating the repository, GitHub will show you commands to push an existing repository. Follow these steps:

1. Copy the repository URL shown on the GitHub page (it should look like `https://github.com/py7hagoras/binance-mcp.git`)

2. In your terminal or command prompt, navigate to the project directory if you're not already there:
   ```
   cd path/to/binance-server
   ```

3. Add the GitHub repository as a remote:
   ```
   git remote add origin https://github.com/py7hagoras/binance-mcp.git
   ```

4. Push your code to GitHub:
   ```
   git push -u origin master
   ```
   (or `git push -u origin main` if your default branch is named "main")

5. Refresh your GitHub repository page to see your code

## 3. Enable GitHub Actions (Optional)

If you want to use the CI/CD workflow included in this repository:

1. Go to your repository on GitHub
2. Click on the "Actions" tab
3. You should see the workflow ready to be used
4. For Docker image publishing to work, you may need to:
   - Go to your repository settings
   - Navigate to "Packages" settings
   - Ensure GitHub Packages is enabled for this repository

## 4. Update README

After pushing to GitHub, you may want to update the README.md file to replace:
```
git clone https://github.com/py7hagoras/binance-mcp.git
```
with your actual repository URL if you used a different name:
```
git clone https://github.com/py7hagoras/your-repo-name.git
```

You can do this directly on GitHub by editing the README.md file in the web interface.
