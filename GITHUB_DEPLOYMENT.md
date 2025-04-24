# GitHub Deployment Guide

Since we encountered authentication issues, here's a step-by-step guide to manually deploy your code to GitHub:

## 1. Create a GitHub Repository

1. Go to [GitHub New Repository](https://github.com/new) in your browser
2. Name the repository "binance-mcp"
3. Add an optional description: "A Binance MCP server for AI assistants"
4. Choose whether to make it public or private
5. Do NOT initialize with README, .gitignore, or license
6. Click "Create repository"

## 2. Push Your Code to GitHub

GitHub will show you commands to push an existing repository. You'll need to use one of the following methods:

### Option 1: HTTPS (Requires GitHub username and password/token)

```bash
git remote add origin https://github.com/py7hagoras/binance-mcp.git
git push -u origin master
```

When prompted, enter your GitHub username and password. Note that GitHub no longer accepts passwords for command-line operations. You'll need to use a personal access token instead.

### Option 2: SSH (If you have SSH keys set up)

```bash
git remote add origin git@github.com:py7hagoras/binance-mcp.git
git push -u origin master
```

### Option 3: GitHub CLI (If installed)

```bash
gh repo create py7hagoras/binance-mcp --source=. --private --push
```

## 3. Creating a Personal Access Token (If using HTTPS)

If you're using HTTPS and don't have a personal access token:

1. Go to [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token" and select "Generate new token (classic)"
3. Give it a name like "Binance MCP Deployment"
4. Set an expiration date
5. Select the "repo" scope (full control of private repositories)
6. Click "Generate token"
7. Copy the token immediately (you won't be able to see it again)
8. Use this token as your password when pushing to GitHub

## 4. Verify Deployment

After successfully pushing your code:

1. Go to https://github.com/py7hagoras/binance-mcp
2. Verify that all your files are there
3. Check that the README.md is displayed correctly

## 5. Enable GitHub Actions (Optional)

If you want to use the CI/CD workflow:

1. Go to your repository on GitHub
2. Click on the "Actions" tab
3. You should see the workflow ready to be used
4. For Docker image publishing to work, you may need to:
   - Go to your repository settings
   - Navigate to "Packages" settings
   - Ensure GitHub Packages is enabled for this repository
