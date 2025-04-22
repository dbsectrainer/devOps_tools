# Google Cloud Platform (GCP) Cheatsheet

*This cheatsheet provides a reference for Google Cloud Platform (GCP) commands and services.*

*Note: gcloud CLI 469.0.0 is the latest version as of April 2025*

## gcloud Configuration
```bash
# Authentication
gcloud auth login                                    # Start interactive login process for user account
gcloud auth list                                     # Show all authenticated accounts
gcloud config list                                   # Display current configuration settings
gcloud auth application-default login                # Set up application default credentials

# Project Management
gcloud projects list                                 # Show all accessible GCP projects
gcloud config set project PROJECT_ID                 # Switch to specific project
gcloud config set compute/region us-central1         # Set default region for resources
gcloud config set compute/zone us-central1-a         # Set default zone within region
```

## Compute Engine
```bash
# Instance Management
gcloud compute instances create my-instance \        # Create new Compute Engine VM
    --machine-type=e2-medium \                      # VM size (CPU/memory)
    --image-family=debian-10 \                      # OS image to use
    --image-project=debian-cloud \                  # Project hosting the image
    --boot-disk-size=10GB                          # Size of main disk

# Instance Operations
gcloud compute instances list                        # Show all VMs in project
gcloud compute instances describe my-instance        # Get detailed VM information
gcloud compute instances start my-instance           # Start stopped VM
gcloud compute instances stop my-instance            # Stop running VM (still billed for disk)
gcloud compute instances delete my-instance          # Permanently delete VM

# SSH Access
gcloud compute ssh my-instance                       # Start SSH session to VM
gcloud compute scp local-file my-instance:~/remote-file  # Copy files to/from VM
```

## Cloud Storage
```bash
# Bucket Management
gsutil mb gs://my-bucket                            # Create new storage bucket
gsutil ls                                           # List all buckets
gsutil ls gs://my-bucket                            # List contents of bucket
gsutil rm gs://my-bucket/**                         # Delete all files in bucket
gsutil rb gs://my-bucket                            # Delete empty bucket

# File Operations
gsutil cp local-file gs://my-bucket/                # Upload file to bucket
gsutil cp -r local-dir gs://my-bucket/              # Upload directory recursively
gsutil cp gs://my-bucket/file .                     # Download file from bucket
gsutil rsync -r local-dir gs://my-bucket/dir        # Sync directory with bucket

# Access Control
gsutil iam ch user:john@example.com:objectViewer gs://my-bucket  # Grant read access to bucket
gsutil acl ch -u john@example.com:R gs://my-bucket/file          # Grant read access to specific file
```

## Kubernetes Engine (GKE)
```bash
# Cluster Management
gcloud container clusters create my-cluster \        # Create new GKE cluster
    --num-nodes=3 \                                 # Number of nodes in default pool
    --machine-type=e2-medium \                      # Node VM size
    --zone=us-central1-a                           # Zone for cluster nodes

gcloud container clusters get-credentials my-cluster # Configure kubectl for cluster access
gcloud container clusters list                      # Show all GKE clusters
gcloud container clusters delete my-cluster         # Delete cluster and all its resources

# Node Pool Management
gcloud container node-pools create pool-2 \         # Add new group of nodes to cluster
    --cluster my-cluster \                          # Target cluster
    --num-nodes=2                                  # Nodes in new pool

gcloud container node-pools list --cluster my-cluster    # List all node pools in cluster
gcloud container node-pools delete pool-2 --cluster my-cluster  # Remove node pool
```

## Cloud Run
```bash
# Service Deployment
gcloud run deploy my-service \                      # Deploy container to Cloud Run
    --image gcr.io/project/image \                 # Container image to deploy
    --platform managed \                           # Use fully managed platform
    --region us-central1 \                        # Region to deploy in
    --allow-unauthenticated                      # Allow public access

# Service Management
gcloud run services list                           # Show all Cloud Run services
gcloud run services describe my-service            # Get service configuration details
gcloud run services update my-service --memory 512Mi  # Update service resources
gcloud run services delete my-service              # Remove service

# Revision Management
gcloud run revisions list                          # Show all service versions
gcloud run revisions delete my-service-00001       # Delete specific revision
```

## IAM & Security
```bash
# IAM Management
gcloud iam service-accounts create my-sa \          # Create new service account
    --display-name "My Service Account"             # Human-readable name

gcloud iam service-accounts keys create key.json \   # Create key for service account
    --iam-account my-sa@project.iam.gserviceaccount.com  # Service account email

# Role Management
gcloud projects add-iam-policy-binding PROJECT_ID \  # Grant role to user/service account
    --member="user:john@example.com" \              # Identity to grant role to
    --role="roles/editor"                          # Role to grant (predefined or custom)

gcloud projects get-iam-policy PROJECT_ID           # View all IAM bindings for project
```

## Cloud SQL
```bash
# Instance Creation
gcloud sql instances create my-instance \           # Create new Cloud SQL instance
    --database-version=MYSQL_8_0 \                 # Database engine and version
    --tier=db-f1-micro \                          # Instance size (CPU/memory)
    --region=us-central1                          # Region for instance

# Database Management
gcloud sql databases create my-database \           # Create new database
    --instance=my-instance                         # Target SQL instance

gcloud sql users create my-user \                   # Create database user
    --instance=my-instance \                       # Target SQL instance
    --password=my-password                        # User's password

# Connection
gcloud sql connect my-instance --user=my-user       # Start interactive SQL session
```

## VPC Networks
```bash
# Network Creation
gcloud compute networks create my-network \         # Create new VPC network
    --subnet-mode=custom                           # Enable custom subnet creation

gcloud compute networks subnets create my-subnet \  # Create subnet in VPC
    --network=my-network \                         # Parent VPC network
    --region=us-central1 \                        # Region for subnet
    --range=10.0.0.0/24                          # IP range for subnet

# Firewall Rules
gcloud compute firewall-rules create allow-http \   # Create firewall rule
    --network=my-network \                         # Network to apply rule to
    --allow=tcp:80 \                              # Allow HTTP traffic
    --source-ranges=0.0.0.0/0                     # Allow from any IP
```

## Cloud Functions
```bash
# Function Deployment
gcloud functions deploy my-function \               # Deploy new Cloud Function
    --runtime python39 \                           # Runtime environment
    --trigger-http \                              # HTTP trigger type
    --entry-point function_name                   # Function to execute

# Function Management
gcloud functions list                              # Show all Cloud Functions
gcloud functions describe my-function              # Get function configuration
gcloud functions logs read my-function             # View function execution logs
gcloud functions delete my-function                # Remove function
```

## Monitoring & Logging
```bash
# Logging
gcloud logging read "resource.type=gce_instance"    # Query logs for VM instances
gcloud logging write my-log "Log entry"             # Write custom log entry

# Monitoring
gcloud monitoring dashboards create \               # Create monitoring dashboard
    --config-from-file=dashboard.json              # Dashboard configuration file

gcloud monitoring policies create \                 # Create alerting policy
    --policy-from-file=alert-policy.json           # Alert policy configuration
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
```

## Additional Resources

- [Google Cloud Documentation](https://cloud.google.com/docs)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Cloud Architecture Center](https://cloud.google.com/architecture)
- [Google Cloud SDK Documentation](https://cloud.google.com/sdk/docs)
- [Google Cloud Pricing Calculator](https://cloud.google.com/products/calculator)
- [DevOps Glossary](../cheatsheets/devops_glossary.md)
