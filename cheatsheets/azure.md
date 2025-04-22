# Azure Cheatsheet

*This cheatsheet provides a reference for Azure CLI commands and services.*

*Note: Azure CLI 2.71.0 is the latest version as of April 2025*

## Azure CLI Configuration
```bash
# Login and Account Management
az login                                         # Start interactive login process for Azure CLI
az account show                                  # Display details of current active subscription
az account list                                  # Show all subscriptions for your account
az account set --subscription "subscription_name" # Switch to a different subscription

# Environment Configuration
az configure                                     # Interactive tool to set common configuration values
az config set defaults.location=eastus           # Set default region for resource creation
az config set defaults.group=myResourceGroup     # Set default resource group for commands
```

## Resource Groups
```bash
# Create and Manage Resource Groups
az group create --name myResourceGroup --location eastus    # Create new resource group in specified region
az group list                                              # Show all resource groups in subscription
az group delete --name myResourceGroup                     # Delete resource group and all its resources
az group update --name myResourceGroup --tags environment=prod  # Add or update resource group tags

# Resource Management
az resource list                                           # List all resources in subscription
az resource show --resource-group myResourceGroup --name myResource    # Get details of specific resource
az resource delete --resource-group myResourceGroup --name myResource  # Delete individual resource
```

## Virtual Machines
```bash
# Create VM
az vm create \                                             # Create new virtual machine
    --resource-group myResourceGroup \                     # Resource group to contain VM
    --name myVM \                                         # Name for the new VM
    --image UbuntuLTS \                                   # OS image to use (Ubuntu LTS in this case)
    --admin-username azureuser \                          # Admin account username
    --generate-ssh-keys                                   # Auto-generate SSH keys for access

# VM Operations
az vm start --resource-group myResourceGroup --name myVM   # Start a stopped VM
az vm stop --resource-group myResourceGroup --name myVM    # Stop VM but maintain allocated resources
az vm deallocate --resource-group myResourceGroup --name myVM  # Stop VM and release compute resources
az vm delete --resource-group myResourceGroup --name myVM  # Permanently delete the VM

# VM Extensions
az vm extension set \                                      # Add extension to existing VM
    --resource-group myResourceGroup \                     # Resource group containing VM
    --vm-name myVM \                                      # Target VM name
    --name customScript \                                 # Extension type to add
    --publisher Microsoft.Azure.Extensions \              # Extension publisher
    --settings ./script-config.json                       # Extension configuration file
```

## Storage Accounts
```bash
# Create Storage Account
az storage account create \                                # Create new storage account
    --name mystorageaccount \                             # Globally unique storage account name
    --resource-group myResourceGroup \                    # Resource group to contain account
    --location eastus \                                   # Region for the storage account
    --sku Standard_LRS                                    # Performance and replication level

# Container Operations
az storage container create \                             # Create blob container
    --name mycontainer \                                  # Container name (unique within account)
    --account-name mystorageaccount                      # Storage account to create in

# Blob Operations
az storage blob upload \                                  # Upload file to blob storage
    --container-name mycontainer \                        # Target container
    --name myblob \                                      # Name for blob in storage
    --file myfile.txt \                                  # Local file to upload
    --account-name mystorageaccount                      # Storage account name

az storage blob list \                                    # List all blobs in container
    --container-name mycontainer \                        # Container to list
    --account-name mystorageaccount                      # Storage account name
```

## Azure Active Directory
```bash
# User Management
az ad user create \                                       # Create new Azure AD user
    --display-name "John Doe" \                          # User's full name
    --password "Password123!" \                          # Initial password (should be changed)
    --user-principal-name john@contoso.com               # User's login email

az ad user list                                          # List all users in Azure AD
az ad user show --id john@contoso.com                    # Get details of specific user
az ad user delete --id john@contoso.com                  # Remove user from Azure AD

# Group Management
az ad group create \                                     # Create new security group
    --display-name "Developers" \                        # Group display name
    --mail-nickname "devs"                              # Email nickname for group

az ad group member add \                                 # Add user to security group
    --group "Developers" \                              # Target group name
    --member-id "user_object_id"                       # User's object ID to add

# Role Assignment
az role assignment create \                              # Grant Azure RBAC role to user
    --assignee "john@contoso.com" \                     # User to grant role to
    --role "Contributor" \                              # Role to assign (built-in or custom)
    --scope "/subscriptions/subscription_id"            # Scope of the role assignment
```

## App Service
```bash
# Create App Service Plan
az appservice plan create \                               # Create hosting plan for web apps
    --name myAppServicePlan \                            # Name of the service plan
    --resource-group myResourceGroup \                   # Resource group to contain plan
    --sku S1                                            # Performance tier and pricing level

# Create Web App
az webapp create \                                       # Create new web application
    --name myWebApp \                                   # Globally unique app name
    --resource-group myResourceGroup \                  # Resource group for the app
    --plan myAppServicePlan                            # Service plan to host the app

# Deployment
az webapp deployment source config \                     # Configure source control deployment
    --name myWebApp \                                   # Target web app
    --resource-group myResourceGroup \                  # Resource group containing app
    --repo-url https://github.com/username/repo \       # Git repository URL
    --branch master \                                   # Branch to deploy from
    --manual-integration                               # Disable automatic sync

# Configuration
az webapp config set \                                  # Update app configuration
    --name myWebApp \                                  # Target web app
    --resource-group myResourceGroup \                 # Resource group containing app
    --php-version 7.4                                 # Set PHP runtime version
```

## Networking
```bash
# Virtual Network
az network vnet create \                                 # Create virtual network
    --name myVNet \                                     # VNet name
    --resource-group myResourceGroup \                  # Resource group for VNet
    --subnet-name default \                            # Name of initial subnet
    --address-prefix 10.0.0.0/16 \                     # VNet address space
    --subnet-prefix 10.0.0.0/24                        # Subnet address range

# Network Security Group
az network nsg create \                                 # Create network security group
    --name myNSG \                                     # NSG name
    --resource-group myResourceGroup                   # Resource group for NSG

az network nsg rule create \                           # Add security rule to NSG
    --name allow-ssh \                                # Rule name
    --nsg-name myNSG \                               # Target NSG
    --priority 100 \                                 # Rule priority (lower = higher priority)
    --resource-group myResourceGroup \               # Resource group containing NSG
    --access Allow \                                # Allow or deny traffic
    --source-address-prefixes '*' \                 # Source IP addresses/ranges
    --source-port-ranges '*' \                      # Source ports
    --direction Inbound \                          # Traffic direction
    --destination-port-ranges 22                   # Destination ports (SSH)
```

## Database Services
```bash
# Azure SQL Database
az sql server create \
    --name myserver \
    --resource-group myResourceGroup \
    --location eastus \
    --admin-user myadmin \
    --admin-password Password123!

az sql db create \
    --name mydb \
    --resource-group myResourceGroup \
    --server myserver \
    --service-objective S0

# Cosmos DB
az cosmosdb create \
    --name mycosmosdb \
    --resource-group myResourceGroup \
    --kind MongoDB
```

## Monitoring & Diagnostics
```bash
# Application Insights
az monitor app-insights component create \
    --app myapp \
    --location eastus \
    --resource-group myResourceGroup

# Alerts
az monitor alert create \
    --name cpu-alert \
    --resource-group myResourceGroup \
    --condition "max percentage CPU > 80" \
    --window-size 5m \
    --evaluation-frequency 1m

# Log Analytics
az monitor log-analytics workspace create \
    --resource-group myResourceGroup \
    --workspace-name myworkspace
```

## Best Practices

1. **Resource Organization**
```bash
# Naming Convention
az group create \
    --name rg-prod-eastus-001 \
    --location eastus \
    --tags environment=production project=myapp

# Lock Resources
az lock create \
    --name mylock \
    --resource-group myResourceGroup \
    --lock-type CanNotDelete
```

2. **Security**
```bash
# Enable Managed Identity
az webapp identity assign \
    --name myWebApp \
    --resource-group myResourceGroup

# Key Vault Integration
az keyvault create \
    --name mykeyvault \
    --resource-group myResourceGroup

az keyvault secret set \
    --vault-name mykeyvault \
    --name mysecret \
    --value myvalue
```

3. **Cost Management**
```bash
# Budget Creation
az consumption budget create \
    --name mybudget \
    --amount 1000 \
    --time-grain monthly \
    --start-date 2023-01-01 \
    --end-date 2023-12-31

# Cost Analysis
az consumption usage list \
    --start-date 2023-01-01 \
    --end-date 2023-01-31
```

4. **Backup & Recovery**
```bash
# VM Backup
az backup vault create \
    --name myVault \
    --resource-group myResourceGroup

az backup protection enable-for-vm \
    --resource-group myResourceGroup \
    --vault-name myVault \
    --vm myVM \
    --policy-name DefaultPolicy
```

5. **Automation**
```bash
# ARM Template Deployment
az deployment group create \
    --resource-group myResourceGroup \
    --template-file template.json \
    --parameters parameters.json

# Automation Account
az automation account create \
    --name myAutomationAccount \
    --resource-group myResourceGroup \
    --location eastus
```

## Additional Resources

- [Azure CLI Documentation](https://docs.microsoft.com/en-us/cli/azure/)
- [Azure Portal](https://portal.azure.com/)
- [Azure Architecture Center](https://docs.microsoft.com/en-us/azure/architecture/)
- [Azure Well-Architected Framework](https://docs.microsoft.com/en-us/azure/architecture/framework/)
- [Azure Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/)
- [DevOps Glossary](../cheatsheets/devops_glossary.md)
