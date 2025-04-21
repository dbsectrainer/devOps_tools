# DevOps Certification Labs - 14 Day Training Plan

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

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#dff,stroke:#333,stroke-width:2px
    style D fill:#fdf,stroke:#333,stroke-width:2px
    style E fill:#ffd,stroke:#333,stroke-width:2px
    style F fill:#dfd,stroke:#333,stroke-width:2px
    style G fill:#fdd,stroke:#333,stroke-width:2px
```

## Course Overview
This intensive 14-day training program covers essential DevOps certifications through hands-on labs using GitHub and VSCode. Each day contains 15 labs distributed across different certification areas.

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
    title 14-Day Training Timeline
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
```

## Directory Structure
```
devops-labs/
├── README.md
├── days/
│   ├── day-01/
│   ├── day-02/
│   ├── ...
│   └── day-14/
└── cheatsheets/
    ├── github.md
    ├── terraform.md
    ├── docker.md
    ├── kubernetes.md
    ├── grafana.md
    ├── vault.md
    ├── aws.md
    ├── azure.md
    └── gcp.md
