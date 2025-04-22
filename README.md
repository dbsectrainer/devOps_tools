# DevOps Certification Labs - 18 Day Training Plan

## Project Overview
This project covers a wide range of DevOps and DevSecOps skills, including:

- Version Control: GitHub fundamentals and GitHub Actions.
- Infrastructure as Code: Terraform for infrastructure provisioning.
- Containerization: Docker for container management.
- Orchestration: Kubernetes for managing containerized applications.
- Observability: Grafana for monitoring and visualization.
- Secrets Management: HashiCorp Vault for secure secret storage.
- Cloud Platforms: AWS, Azure, and GCP for cloud computing.
- Configuration Management: Ansible for automating configuration tasks.
- DevSecOps: Tools like SonarQube, OWASP ZAP, Trivy, and Snyk for security integration.
- Service Mesh: Traffic management and security with service mesh technologies.
- Compliance and Chaos Engineering: Open Policy Agent (OPA) for compliance and Chaos Mesh for resilience testing.

Each skill is reinforced through hands-on labs and daily cheatsheets, as outlined below.

```mermaid
graph TD
    A[GitHub] --> B[Terraform]
    B --> C[Docker]
    C --> D[Kubernetes]
    D --> E[Grafana]
    E --> F[Vault]
    F --> G[Cloud Providers]
    G --> H1[AWS]
    G --> H2[Azure]
    G --> H3[GCP]
    H3 --> I[Ansible]
    I --> J[DevSecOps Tools]
    J --> K[Service Mesh]
    K --> L[Compliance & Chaos]

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#dff,stroke:#333,stroke-width:2px
    style D fill:#fdf,stroke:#333,stroke-width:2px
    style E fill:#ffd,stroke:#333,stroke-width:2px
    style F fill:#dfd,stroke:#333,stroke-width:2px
    style G fill:#fdd,stroke:#333,stroke-width:2px
    style I fill:#f9f,stroke:#333,stroke-width:2px
    style J fill:#bbf,stroke:#333,stroke-width:2px
    style K fill:#dff,stroke:#333,stroke-width:2px
    style L fill:#fdf,stroke:#333,stroke-width:2px
```

## Course Overview
This intensive 18-day training program covers essential DevOps and DevSecOps certifications through hands-on labs using GitHub and VSCode. Each day contains 15 labs distributed across different certification areas.

### Prerequisites
- VSCode + GitHub + Terraform + Docker
- Cloud CLIs: AWS CLI + Azure CLI + gcloud
- Kubernetes tools: kubectl + Minikube
- HashiCorp Vault
- GitHub and DockerHub accounts
- Cloud Provider Free Tier accounts (AWS, Azure, GCP)

### Daily Structure
```mermaid
graph LR
    A[Daily Labs] --> B[15 Labs per Day]
    B --> C[Step-by-Step Instructions]
    B --> D[Hands-on Exercises]
    B --> E[Daily Cheatsheet]
    
    style A fill:#f96,stroke:#333,stroke-width:2px
    style B fill:#69f,stroke:#333,stroke-width:2px
    style C fill:#9f6,stroke:#333,stroke-width:2px
    style D fill:#f69,stroke:#333,stroke-width:2px
    style E fill:#96f,stroke:#333,stroke-width:2px
```

## Learning Path Progress Tracker
```mermaid
gantt
    title 18-Day Training Timeline
    dateFormat  YYYY-MM-DD
    section GitHub
    Basics & Actions    :2025-04-22, 2d
    section HashiCorp
    Terraform     :2025-04-24, 2d
    Vault         :2025-04-30, 2d
    section Containers
    Docker        :2025-04-26, 2d
    Kubernetes    :2025-04-28, 2d
    section Observability
    Grafana       :2025-05-01, 2d
    section Cloud
    AWS          :2025-05-03, 2d
    Azure        :2025-05-05, 1d
    GCP          :2025-05-06, 1d
    section DevOps Advanced
    Ansible      :2025-05-07, 1d
    DevSecOps    :2025-05-08, 1d
    Service Mesh :2025-05-09, 1d
    Compliance & Chaos :2025-05-10, 1d
```

## Directory Structure
```
devops-labs/
├── README.md
├── index.html          # Web interface for browsing content
├── css/                # Styling for web interface
├── js/                 # JavaScript for web interface functionality
├── days/
│   ├── day-01/
│   ├── day-02/
│   ├── ...
│   ├── day-14/
│   ├── day-15/
│   ├── day-16/
│   ├── day-17/
│   └── day-18/
└── cheatsheets/
    ├── github.md
    ├── terraform.md
    ├── docker.md
    ├── kubernetes.md
    ├── grafana.md
    ├── vault.md
    ├── aws.md
    ├── azure.md
    ├── gcp.md
    ├── ansible.md
    ├── devsecops.md
    ├── service-mesh.md
    └── compliance-chaos.md
```

## Web Interface
The project includes a web-based interface for easier navigation of content:
- Interactive navigation through cheatsheets and daily lessons
- Mermaid diagram rendering
- Responsive design for desktop and mobile viewing
- Quick access to popular tools and getting started guides

To use the web interface, open `index.html` in a web browser or serve the project directory using a local web server.
