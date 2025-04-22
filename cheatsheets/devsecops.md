# DevSecOps Tools Cheatsheet

*This cheatsheet provides a reference for DevSecOps tools, commands, and best practices.*

*Note: Tool versions listed are current as of April 2025*

## SonarQube
```bash
# Installation (Docker)
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest   # Start SonarQube server in container
                                                              # Expose on port 9000

# Scanner CLI
sonar-scanner \                                               # Run standalone scanner
  -Dsonar.projectKey=my-project \                            # Unique project identifier
  -Dsonar.sources=. \                                        # Source code location
  -Dsonar.host.url=http://localhost:9000 \                   # SonarQube server URL
  -Dsonar.login=myauthtoken                                  # Authentication token

# Maven Integration
mvn clean verify sonar:sonar \                               # Run analysis during Maven build
  -Dsonar.projectKey=my-project \                           # Project identifier
  -Dsonar.host.url=http://localhost:9000 \                  # Server URL
  -Dsonar.login=myauthtoken                                 # Authentication token

# Gradle Integration
./gradlew sonarqube \                                        # Run analysis during Gradle build
  -Dsonar.projectKey=my-project \                           # Project identifier
  -Dsonar.host.url=http://localhost:9000 \                  # Server URL
  -Dsonar.login=myauthtoken                                 # Authentication token
```

## OWASP ZAP
```bash
# Installation (Docker)
docker pull owasp/zap2docker-stable

# Baseline Scan
docker run -t owasp/zap2docker-stable zap-baseline.py \      # Quick security assessment
  -t https://example.com -g gen.conf -r report.html          # Generate HTML report

# Full Scan
docker run -t owasp/zap2docker-stable zap-full-scan.py \     # Comprehensive security scan
  -t https://example.com -g gen.conf -r report.html          # Including active attacks

# API Scan
docker run -t owasp/zap2docker-stable zap-api-scan.py \      # Test API endpoints
  -t https://example.com/api/v1/swagger.json -f openapi \    # Using OpenAPI/Swagger spec
  -r api-report.html                                         # Generate API scan report

# Desktop UI
docker run -u zap -p 8080:8080 -p 8090:8090 -i owasp/zap2docker-stable zap-webswing.sh  # Launch web interface
```

## Trivy
```bash
# Installation
brew install aquasecurity/trivy/trivy  # macOS
apt-get install trivy                  # Debian/Ubuntu

# Image Scanning
trivy image nginx:latest                                     # Scan container image for vulnerabilities
trivy image --severity HIGH,CRITICAL nginx:latest            # Only show high and critical issues
trivy image --format json --output results.json nginx:latest # Export results in JSON format

# Filesystem Scanning
trivy fs --security-checks vuln,config /path/to/project      # Scan local files for vulnerabilities
                                                           # and misconfigurations

# Git Repository Scanning
trivy repo https://github.com/user/repo                      # Scan remote Git repository

# Container Scanning
trivy container --rm -t high nginx:latest                    # Scan running container
                                                           # Remove after scanning

# Kubernetes Scanning
trivy k8s --report summary cluster                           # Scan Kubernetes cluster
                                                           # Generate summary report
```

## Clair
```bash
# Installation (Docker Compose)
# docker-compose.yml
version: '3'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_PASSWORD: password
  clair:
    image: quay.io/projectquay/clair:v4.6.0
    ports:
      - "6060:6060"
    depends_on:
      - postgres

# Clairctl (CLI)
clairctl report --host http://localhost:6060 --format json nginx:latest

# Integration with Registry
# Example with Harbor
docker run -d \
  --name harbor \
  -p 80:80 \
  -e HARBOR_ADMIN_PASSWORD=password \
  goharbor/harbor:v2.7.0
```

## Snyk
```bash
# Installation
npm install -g snyk

# Authentication
snyk auth

# Vulnerability Scanning
snyk test                           # Check current directory for vulnerabilities
snyk test --all-projects           # Scan all projects in workspace
snyk test --docker nginx:latest    # Analyze Docker image for security issues
snyk test --file=requirements.txt  # Check specific dependency file

# Monitoring
snyk monitor                       # Track project for new vulnerabilities
snyk monitor --docker nginx:latest # Continuously monitor Docker image

# Fix Vulnerabilities
snyk wizard                        # Interactive vulnerability remediation
snyk fix                          # Automatically apply security patches

# Reporting
snyk test --json > report.json     # Export results in JSON format
snyk test --sarif > report.sarif   # Generate SARIF for code scanning tools
```

## GitHub Security Features
```yaml
# CodeQL Analysis
name: "CodeQL"                     # Static analysis security testing
on:
  push:                           # Run on push to main
    branches: [ main ]
  pull_request:                   # Run on PRs to main
    branches: [ main ]
  schedule:                       # Weekly scheduled scan
    - cron: '0 0 * * 0'          # Run at midnight on Sundays

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout repository    # Get source code
      uses: actions/checkout@v4
    - name: Initialize CodeQL      # Set up analysis tools
      uses: github/codeql-action/init@v2
      with:
        languages: javascript, python  # Languages to analyze
    - name: Perform CodeQL Analysis   # Run security scan
      uses: github/codeql-action/analyze@v2

# Dependency Scanning
name: "Dependency Review"          # Check dependencies for vulnerabilities
on: [pull_request]                # Run on all pull requests

jobs:
  dependency-review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository  # Get source code
        uses: actions/checkout@v4
      - name: Dependency Review    # Analyze dependencies
        uses: actions/dependency-review-action@v3
```

## GitLab Security Features
```yaml
# Security Scanning
include:
  - template: Security/SAST.gitlab-ci.yml
  - template: Security/DAST.gitlab-ci.yml
  - template: Security/Dependency-Scanning.gitlab-ci.yml
  - template: Security/Container-Scanning.gitlab-ci.yml
  - template: Security/Secret-Detection.gitlab-ci.yml

variables:
  SAST_EXCLUDED_PATHS: "spec, test, tests, tmp"
  DAST_WEBSITE: https://example.com
  DAST_AUTH_URL: https://example.com/login
  SCAN_KUBERNETES_MANIFESTS: "true"
```

## CI/CD Security Integration
```yaml
# GitHub Actions Example
name: Security Scan

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: SonarQube Scan
        uses: SonarSource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
      
      - name: Trivy Scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'my-image:latest'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Snyk Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

## Jenkins Pipeline Example
```groovy
pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh 'sonar-scanner'
                }
            }
        }
        
        stage('Container Scan') {
            steps {
                sh 'trivy image --severity HIGH,CRITICAL my-image:latest'
            }
        }
        
        stage('Dependency Scan') {
            steps {
                withCredentials([string(credentialsId: 'snyk-token', variable: 'SNYK_TOKEN')]) {
                    sh 'snyk test'
                }
            }
        }
        
        stage('DAST Testing') {
            steps {
                sh 'docker run -t owasp/zap2docker-stable zap-baseline.py -t https://example.com -r zap-report.html'
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: '**/zap-report.html', allowEmptyArchive: true
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: '.',
                reportFiles: 'zap-report.html',
                reportName: 'ZAP Report'
            ])
        }
    }
}
```

## SonarQube Quality Gates
```json
{
  "name": "Security Gate",
  "conditions": [
    {
      "metric": "new_security_rating",
      "op": "GT",
      "error": "1"
    },
    {
      "metric": "new_reliability_rating",
      "op": "GT",
      "error": "1"
    },
    {
      "metric": "new_maintainability_rating",
      "op": "GT",
      "error": "1"
    },
    {
      "metric": "new_coverage",
      "op": "LT",
      "error": "80"
    }
  ]
}
```

## Best Practices

1. **Shift Left Security**
   - Integrate security scanning in early development stages
   - Implement pre-commit hooks for security checks
   - Automate security testing in CI/CD pipelines
   - Make security part of developer workflow

2. **Container Security**
   ```bash
   # Use minimal base images
   FROM alpine:3.18

   # Scan during build
   RUN trivy filesystem --exit-code 1 --severity HIGH,CRITICAL .

   # Run as non-root user
   USER 1000

   # Use distroless images
   FROM gcr.io/distroless/java17-debian11
   ```

3. **Secret Management**
   ```yaml
   # Use environment variables
   environment:
     - DB_PASSWORD=${SECRET_DB_PASSWORD}

   # Use secret management tools
   - name: Load secrets
     uses: azure/key-vault-secrets-action@v1
     with:
       keyvault: "my-key-vault"
       secrets: "db-password, api-key"

   # Scan for leaked secrets
   - name: Detect secrets
     uses: gitleaks/gitleaks-action@v2
   ```

4. **Compliance Automation**
   ```yaml
   # Compliance checks
   - name: Run compliance checks
     run: |
       inspec exec compliance-profile -t ssh://user@host --reporter json:results.json

   # Policy as code
   - name: OPA policy check
     run: |
       conftest test k8s/ --policy policy/
   ```

5. **Vulnerability Management**
   ```yaml
   # Regular scanning
   schedule:
     - cron: '0 0 * * *'  # Daily at midnight

   # Risk-based prioritization
   trivy image --severity CRITICAL --ignore-unfixed nginx:latest

   # Automated patching
   dependabot:
     updates:
       - package-ecosystem: "npm"
         directory: "/"
         schedule:
           interval: "daily"
   ```

## Additional Resources

- [SonarQube Documentation](https://docs.sonarqube.org/)
- [OWASP ZAP Documentation](https://www.zaproxy.org/docs/)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [Snyk Documentation](https://docs.snyk.io/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [DevSecOps Best Practices](https://www.synopsys.com/blogs/software-security/devsecops-best-practices/)
- [DevOps Glossary](../cheatsheets/devops_glossary.md)
