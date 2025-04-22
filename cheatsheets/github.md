# GitHub & GitHub Actions Cheatsheet

*This cheatsheet covers topics from [Day 1 - GitHub Fundamentals](../days/day-01/README.md) and [Day 2 - Advanced GitHub Actions](../days/day-02/README.md).*

## Git Basic Commands
```bash
# Repository Operations
git init                           # Create new Git repository in current directory
git clone <url>                    # Download remote repository to local machine
git remote add origin <url>        # Connect local repository to remote GitHub repo
git remote -v                      # List all configured remote repositories

# Basic Operations
git add <file>                     # Stage specific file for commit
git add .                          # Stage all modified and new files
git commit -m "message"            # Create commit with staged changes
git push origin <branch>           # Upload local commits to remote repository
git pull origin <branch>           # Download and merge remote changes

# Branch Operations
git branch                         # Show all local branches
git branch <name>                  # Create new branch from current position
git checkout <branch>              # Switch to different branch
git checkout -b <branch>           # Create new branch and switch to it
git merge <branch>                 # Combine specified branch into current branch
git branch -d <branch>             # Remove local branch
git push origin --delete <branch>  # Remove remote branch

# Status & History
git status                         # Show working tree status and staged changes
git log                           # Display commit history with details
git diff                          # Show changes between working directory and last commit
git blame <file>                  # Show who changed each line of a file
```

## GitHub Actions Workflow Syntax
```yaml
name: CI Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  workflow_dispatch:      # Manual trigger

env:
  GLOBAL_VAR: value      # Global environment variable

jobs:
  build:
    runs-on: ubuntu-latest
    environment: production
    
    env:
      JOB_VAR: value    # Job-level environment variable
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '22'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
```

## Advanced GitHub Actions Features
```yaml
# Matrix Strategy
jobs:
  test:
    strategy:
      matrix:
        node: [18, 20, 22]
        os: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}

# Conditional Steps
steps:
  - name: Step with condition
    if: github.event_name == 'push'
    run: echo "Triggered by push"

# Environment Protection Rules
environment:
  name: production
  url: https://production.myapp.com
  protection_rules:
    required_reviewers: 2
    wait_timer: 15

# Reusable Workflows
on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
    secrets:
      deploy_key:
        required: true

# Environment Deployments
jobs:
  deploy:
    name: Deploy to ${{ matrix.environment }}
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [development, staging, production]
    environment:
      name: ${{ matrix.environment }}
    steps:
      - uses: actions/checkout@v4
      - name: Deploy
        run: ./deploy.sh
        env:
          ENVIRONMENT: ${{ matrix.environment }}
```

## GitHub Security Features
```yaml
# Branch Protection Rules
branches:
  - name: main
    protection:
      required_pull_request_reviews:
        required_approving_review_count: 2
      required_status_checks:
        strict: true
        contexts: ["ci/build"]
      enforce_admins: true

# Code Scanning
name: "CodeQL"
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * 0'

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
    - name: Initialize CodeQL
      uses: github/codeql-action/init@v2
    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v2
```

## GitHub CLI Commands
```bash
# Authentication
gh auth login                      # Start interactive GitHub authentication
gh auth status                     # Display current authentication state

# Repository Management
gh repo create                     # Create new GitHub repository
gh repo clone <repository>         # Clone repository to local machine
gh repo view                       # Show repository information and metadata

# Pull Request Management
gh pr create                       # Create new pull request
gh pr checkout <number>            # Switch to PR's branch locally
gh pr review                       # Add review comments to PR
gh pr merge                        # Merge pull request into base branch

# Issue Management
gh issue create                    # Create new GitHub issue
gh issue list                      # Show all repository issues
gh issue view <number>            # Display issue details
gh issue close <number>           # Close specified issue

# Workflow Management
gh workflow list                   # Show all GitHub Actions workflows
gh workflow run                    # Manually trigger workflow
gh workflow view                   # Display workflow details
gh run list                       # Show recent workflow runs
```

## Best Practices
1. **Commit Messages**
   - Use present tense ("Add feature" not "Added feature")
   - Start with a capital letter
   - Keep it short (50 chars or less)
   - Use imperative mood

2. **Branch Strategy**
   - main/master: production-ready code
   - develop: integration branch
   - feature/*: new features
   - hotfix/*: urgent fixes
   - release/*: release preparation

3. **Actions Security**
   - Use specific versions for actions
   - Limit permissions using GITHUB_TOKEN
   - Use secrets for sensitive data
   - Implement environment protection rules

4. **Workflow Optimization**
   - Use caching for dependencies
   - Implement matrix builds efficiently
   - Use conditional steps
   - Optimize Docker layers
   - Implement proper timeout values

## Additional Resources

- [Official GitHub Documentation](https://docs.github.com/en)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [GitHub GraphQL API Documentation](https://docs.github.com/en/graphql)
