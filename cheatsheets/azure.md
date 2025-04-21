# Azure Cheatsheet
# Note: Azure CLI 2.71.0 is the latest version as of April 2025

## Azure CLI Configuration
```bash
# Login and Account Management
az login
az account show
az account list
az account set --subscription "subscription_name"

# Environment Configuration
az configure
az config set defaults.location=eastus
az config set defaults.group=myResourceGroup
```

## Resource Groups
```bash
# Create and Manage Resource Groups
az group create --name myResourceGroup --location eastus
az group list
az group delete --name myResourceGroup
az group update --name myResourceGroup --tags environment=prod

# Resource Management
az resource list
az resource show --resource-group myResourceGroup --name myResource
az resource delete --resource-group myResourceGroup --name myResource
```

## Virtual Machines
```bash
# Create VM
az vm create \
    --resource-group myResourceGroup \
    --name myVM \
    --image UbuntuLTS \
    --admin-username azureuser \
    --generate-ssh-keys

# VM Operations
az vm start --resource-group myResourceGroup --name myVM
az vm stop --resource-group myResourceGroup --name myVM
az vm deallocate --resource-group myResourceGroup --name myVM
az vm delete --resource-group myResourceGroup --name myVM

# VM Extensions
az vm extension set \
    --resource-group myResourceGroup \
    --vm-name myVM \
    --name customScript \
    --publisher Microsoft.Azure.Extensions \
    --settings ./script-config.json
```

## Storage Accounts
```bash
# Create Storage Account
az storage account create \
    --name mystorageaccount \
    --resource-group myResourceGroup \
    --location eastus \
    --sku Standard_LRS

# Container Operations
az storage container create \
    --name mycontainer \
    --account-name mystorageaccount

# Blob Operations
az storage blob upload \
    --container-name mycontainer \
    --name myblob \
    --file myfile.txt \
    --account-name mystorageaccount

az storage blob list \
    --container-name mycontainer \
    --account-name mystorageaccount
```

## Azure Active Directory
```bash
# User Management
az ad user create \
    --display-name "John Doe" \
    --password "Password123!" \
    --user-principal-name john@contoso.com

az ad user list
az ad user show --id john@contoso.com
az ad user delete --id john@contoso.com

# Group Management
az ad group create \
    --display-name "Developers" \
    --mail-nickname "devs"

az ad group member add \
    --group "Developers" \
    --member-id "user_object_id"

# Role Assignment
az role assignment create \
    --assignee "john@contoso.com" \
    --role "Contributor" \
    --scope "/subscriptions/subscription_id"
```

## App Service
```bash
# Create App Service Plan
az appservice plan create \
    --name myAppServicePlan \
    --resource-group myResourceGroup \
    --sku S1

# Create Web App
az webapp create \
    --name myWebApp \
    --resource-group myResourceGroup \
    --plan myAppServicePlan

# Deployment
az webapp deployment source config \
    --name myWebApp \
    --resource-group myResourceGroup \
    --repo-url https://github.com/username/repo \
    --branch master \
    --manual-integration

# Configuration
az webapp config set \
    --name myWebApp \
    --resource-group myResourceGroup \
    --php-version 7.4
```

## Networking
```bash
# Virtual Network
az network vnet create \
    --name myVNet \
    --resource-group myResourceGroup \
    --subnet-name default \
    --address-prefix 10.0.0.0/16 \
    --subnet-prefix 10.0.0.0/24

# Network Security Group
az network nsg create \
    --name myNSG \
    --resource-group myResourceGroup

az network nsg rule create \
    --name allow-ssh \
    --nsg-name myNSG \
    --priority 100 \
    --resource-group myResourceGroup \
    --access Allow \
    --source-address-prefixes '*' \
    --source-port-ranges '*' \
    --direction Inbound \
    --destination-port-ranges 22
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
