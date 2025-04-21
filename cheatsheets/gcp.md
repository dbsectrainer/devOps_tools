# Google Cloud Platform (GCP) Cheatsheet
# Note: gcloud CLI 469.0.0 is the latest version as of April 2025

## gcloud Configuration
```bash
# Authentication
gcloud auth login
gcloud auth list
gcloud config list
gcloud auth application-default login

# Project Management
gcloud projects list
gcloud config set project PROJECT_ID
gcloud config set compute/region us-central1
gcloud config set compute/zone us-central1-a
```

## Compute Engine
```bash
# Instance Management
gcloud compute instances create my-instance \
    --machine-type=e2-medium \
    --image-family=debian-10 \
    --image-project=debian-cloud \
    --boot-disk-size=10GB

# Instance Operations
gcloud compute instances list
gcloud compute instances describe my-instance
gcloud compute instances start my-instance
gcloud compute instances stop my-instance
gcloud compute instances delete my-instance

# SSH Access
gcloud compute ssh my-instance
gcloud compute scp local-file my-instance:~/remote-file
```

## Cloud Storage
```bash
# Bucket Management
gsutil mb gs://my-bucket
gsutil ls
gsutil ls gs://my-bucket
gsutil rm gs://my-bucket/**
gsutil rb gs://my-bucket

# File Operations
gsutil cp local-file gs://my-bucket/
gsutil cp -r local-dir gs://my-bucket/
gsutil cp gs://my-bucket/file .
gsutil rsync -r local-dir gs://my-bucket/dir

# Access Control
gsutil iam ch user:john@example.com:objectViewer gs://my-bucket
gsutil acl ch -u john@example.com:R gs://my-bucket/file
```

## Kubernetes Engine (GKE)
```bash
# Cluster Management
gcloud container clusters create my-cluster \
    --num-nodes=3 \
    --machine-type=e2-medium \
    --zone=us-central1-a

gcloud container clusters get-credentials my-cluster
gcloud container clusters list
gcloud container clusters delete my-cluster

# Node Pool Management
gcloud container node-pools create pool-2 \
    --cluster my-cluster \
    --num-nodes=2

gcloud container node-pools list --cluster my-cluster
gcloud container node-pools delete pool-2 --cluster my-cluster
```

## Cloud Run
```bash
# Service Deployment
gcloud run deploy my-service \
    --image gcr.io/project/image \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated

# Service Management
gcloud run services list
gcloud run services describe my-service
gcloud run services update my-service --memory 512Mi
gcloud run services delete my-service

# Revision Management
gcloud run revisions list
gcloud run revisions delete my-service-00001
```

## IAM & Security
```bash
# IAM Management
gcloud iam service-accounts create my-sa \
    --display-name "My Service Account"

gcloud iam service-accounts keys create key.json \
    --iam-account my-sa@project.iam.gserviceaccount.com

# Role Management
gcloud projects add-iam-policy-binding PROJECT_ID \
    --member="user:john@example.com" \
    --role="roles/editor"

gcloud projects get-iam-policy PROJECT_ID
```

## Cloud SQL
```bash
# Instance Creation
gcloud sql instances create my-instance \
    --database-version=MYSQL_8_0 \
    --tier=db-f1-micro \
    --region=us-central1

# Database Management
gcloud sql databases create my-database \
    --instance=my-instance

gcloud sql users create my-user \
    --instance=my-instance \
    --password=my-password

# Connection
gcloud sql connect my-instance --user=my-user
```

## VPC Networks
```bash
# Network Creation
gcloud compute networks create my-network \
    --subnet-mode=custom

gcloud compute networks subnets create my-subnet \
    --network=my-network \
    --region=us-central1 \
    --range=10.0.0.0/24

# Firewall Rules
gcloud compute firewall-rules create allow-http \
    --network=my-network \
    --allow=tcp:80 \
    --source-ranges=0.0.0.0/0
```

## Cloud Functions
```bash
# Function Deployment
gcloud functions deploy my-function \
    --runtime python39 \
    --trigger-http \
    --entry-point function_name

# Function Management
gcloud functions list
gcloud functions describe my-function
gcloud functions logs read my-function
gcloud functions delete my-function
```

## Monitoring & Logging
```bash
# Logging
gcloud logging read "resource.type=gce_instance"
gcloud logging write my-log "Log entry"

# Monitoring
gcloud monitoring dashboards create \
    --config-from-file=dashboard.json

gcloud monitoring policies create \
    --policy-from-file=alert-policy.json
```

## Best Practices

1. **Project Organization**
```bash
# Resource Hierarchy
gcloud resource-manager folders create \
    --display-name="Production" \
    --organization=ORGANIZATION_ID

# Labels
gcloud compute instances add-labels my-instance \
    --labels=environment=prod,team=devops
```

2. **Security**
```bash
# Security Command Center
gcloud scc notifications create my-notification \
    --organization=ORGANIZATION_ID \
    --pubsub-topic=projects/PROJECT_ID/topics/TOPIC_ID

# Identity-Aware Proxy
gcloud iap web add-iam-policy-binding \
    --resource-type=backend-services \
    --member="user:john@example.com" \
    --role="roles/iap.httpsResourceAccessor"
```

3. **Cost Management**
```bash
# Budget Alerts
gcloud billing budgets create \
    --billing-account=BILLING_ACCOUNT_ID \
    --display-name="Monthly Budget" \
    --budget-amount=1000USD \
    --threshold-rules=percent=90

# Cost Export
gcloud billing export bq enable \
    --billing-account=BILLING_ACCOUNT_ID \
    --dataset=billing_dataset
```

4. **Deployment Manager**
```yaml
# config.yaml
resources:
- name: my-instance
  type: compute.v1.instance
  properties:
    machineType: zones/us-central1-a/machineTypes/e2-medium
    zone: us-central1-a
    disks:
    - deviceName: boot
      type: PERSISTENT
      boot: true
      autoDelete: true
      initializeParams:
        sourceImage: projects/debian-cloud/global/images/debian-10
```

5. **Automation**
```bash
# Cloud Build
gcloud builds submit --config cloudbuild.yaml .

# Container Registry
gcloud container images list
gcloud container images delete gcr.io/project/image:tag

# Scheduler
gcloud scheduler jobs create http my-job \
    --schedule="0 * * * *" \
    --uri="https://example.com/task" \
    --http-method=POST
