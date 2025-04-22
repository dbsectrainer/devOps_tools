# GitHub & GitHub Actions Cheatsheet

*This cheatsheet covers topics from [Day 1 - GitHub Fundamentals](../days/day-01/README.md) and [Day 2 - Advanced GitHub Actions](../days/day-02/README.md).*

## Git Basic Commands
```bash
# Repository Operations
git init                           # Initialize a new repository
git clone <url>                    # Clone a repository
git remote add origin <url>        # Add remote repository
git remote -v                      # View remote repositories

# Basic Operations
git add <file>                     # Stage changes
git add .                          # Stage all changes
git commit -m "message"            # Commit changes
git push origin <branch>           # Push changes
git pull origin <branch>           # Pull changes

# Branch Operations
git branch                         # List branches
git branch <name>                  # Create branch
git checkout <branch>              # Switch branch
git checkout -b <branch>           # Create and switch branch
git merge <branch>                 # Merge branch
git branch -d <branch>             # Delete branch
git push origin --delete <branch>  # Delete remote branch

# Status & History
git status                         # Check repository status
git log                           # View commit history
git diff                          # View changes
git blame <file>                  # View file changes history
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
gh auth login                      # Login to GitHub
gh auth status                     # Check auth status

# Repository Management
gh repo create                     # Create repository
gh repo clone <repository>         # Clone repository
gh repo view                       # View repository details

# Pull Request Management
gh pr create                       # Create PR
gh pr checkout <number>            # Checkout PR
gh pr review                       # Review PR
gh pr merge                        # Merge PR

# Issue Management
gh issue create                    # Create issue
gh issue list                      # List issues
gh issue view <number>            # View issue
gh issue close <number>           # Close issue

# Workflow Management
gh workflow list                   # List workflows
gh workflow run                    # Run workflow
gh workflow view                   # View workflow
gh run list                       # List workflow runs
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
