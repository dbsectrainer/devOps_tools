# HashiCorp Vault Cheatsheet

## Basic Commands
```bash
# Server Operations
vault server -dev                  # Start dev server
vault operator init               # Initialize vault
vault operator unseal            # Unseal vault
vault status                     # Check vault status

# Authentication
vault login                      # Login to vault
vault login -method=userpass username=admin  # Login with username
vault token create              # Create new token
vault token lookup             # Look up token info
vault token revoke             # Revoke token

# Secret Management
vault kv put secret/app key=value    # Write secret
vault kv get secret/app              # Read secret
vault kv list secret/                # List secrets
vault kv delete secret/app           # Delete secret
```

## Configuration Files
```hcl
# config.hcl
storage "file" {
  path = "/vault/data"
}

listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = 1
}

api_addr = "http://127.0.0.1:8200"
ui = true

# Policy Definition
path "secret/data/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

path "auth/token/create" {
  capabilities = ["create", "update"]
}
```

## Authentication Methods
```bash
# UserPass Auth
vault auth enable userpass
vault write auth/userpass/users/admin \
    password=password \
    policies=admin

# AppRole Auth
vault auth enable approle
vault write auth/approle/role/my-role \
    secret_id_ttl=10m \
    token_num_uses=10 \
    token_ttl=20m \
    token_max_ttl=30m \
    secret_id_num_uses=40

# Get Role ID and Secret ID
vault read auth/approle/role/my-role/role-id
vault write -f auth/approle/role/my-role/secret-id
```

## Secret Engines
```bash
# KV Version 2
vault secrets enable -version=2 kv
vault kv put kv/my-secret foo=bar
vault kv get kv/my-secret
vault kv metadata get kv/my-secret

# Database Secrets
vault secrets enable database
vault write database/config/my-postgresql \
    plugin_name=postgresql-database-plugin \
    allowed_roles="my-role" \
    connection_url="postgresql://{{username}}:{{password}}@localhost:5432/mydb" \
    username="root" \
    password="rootpassword"

# AWS Secrets
vault secrets enable aws
vault write aws/config/root \
    access_key=AKIAEXAMPLE \
    secret_key=secret \
    region=us-east-1

# PKI Secrets
vault secrets enable pki
vault write pki/root/generate/internal \
    common_name=example.com \
    ttl=8760h
```

## Policy Management
```hcl
# Policy File (policy.hcl)
path "secret/data/app/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

path "auth/token/create" {
  capabilities = ["create", "update"]
}

path "sys/auth/*" {
  capabilities = ["create", "read", "update", "delete", "sudo"]
}

# Policy Commands
vault policy write my-policy policy.hcl
vault policy read my-policy
vault policy list
vault policy delete my-policy
```

## Response Wrapping
```bash
# Create Wrapped Secret
vault kv put -wrap-ttl=30m secret/app key=value

# Unwrap Secret
vault unwrap <wrapping_token>

# Look up Wrap Info
vault token lookup <wrapping_token>
```

## Audit Logging
```bash
# Enable File Audit
vault audit enable file file_path=/var/log/vault/audit.log

# Enable Syslog Audit
vault audit enable syslog

# List Audit Devices
vault audit list
```

## Environment Variables
```bash
# Basic Configuration
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='s.duHrQAtzfFBpHK4FIJ8v2mln'
export VAULT_NAMESPACE='admin'

# TLS Configuration
export VAULT_CACERT='/etc/vault/ca.pem'
export VAULT_CLIENT_CERT='/etc/vault/cert.pem'
export VAULT_CLIENT_KEY='/etc/vault/key.pem'
```

## API Examples
```bash
# Authentication
curl \
    --request POST \
    --data '{"password": "password"}' \
    http://127.0.0.1:8200/v1/auth/userpass/login/admin

# Write Secret
curl \
    --header "X-Vault-Token: $VAULT_TOKEN" \
    --request POST \
    --data '{"data": {"password": "secret"}}' \
    http://127.0.0.1:8200/v1/secret/data/app

# Read Secret
curl \
    --header "X-Vault-Token: $VAULT_TOKEN" \
    http://127.0.0.1:8200/v1/secret/data/app
```

## Best Practices

1. **Security Configuration**
```hcl
# Secure Listener
listener "tcp" {
  address         = "0.0.0.0:8200"
  tls_cert_file   = "/etc/vault/cert.pem"
  tls_key_file    = "/etc/vault/key.pem"
  tls_client_ca_file = "/etc/vault/ca.pem"
}

# Secure Storage
storage "raft" {
  path = "/vault/data"
  node_id = "node1"
  retry_join {
    leader_api_addr = "https://vault1:8200"
  }
}
```

2. **High Availability Setup**
```hcl
# HA Configuration
storage "consul" {
  address = "127.0.0.1:8500"
  path    = "vault/"
}

api_addr = "https://vault.example.com:8200"
cluster_addr = "https://vault.example.com:8201"
```

3. **Seal/Unseal Management**
```bash
# Auto Unseal with AWS KMS
seal "awskms" {
  region     = "us-east-1"
  kms_key_id = "alias/vault-key"
}

# Shamir Seal
vault operator init -key-shares=5 -key-threshold=3
vault operator unseal <key1>
vault operator unseal <key2>
vault operator unseal <key3>
```

4. **Token Management**
```hcl
# Token Configuration
token_policies = ["default", "app-policy"]
token_ttl = "1h"
token_max_ttl = "24h"
token_bound_cidrs = ["127.0.0.1/32"]

# Create Service Token
vault token create \
    -policy=app-policy \
    -ttl=1h \
    -explicit-max-ttl=24h \
    -use-limit=10
```

5. **Monitoring Setup**
```hcl
# Telemetry Configuration
telemetry {
  statsite_address = "statsite.example.com:8125"
  disable_hostname = true
  
  prometheus_retention_time = "30s"
  enable_hostname_label = true
}

# Health Check
curl http://127.0.0.1:8200/v1/sys/health
```

## Common Patterns
```bash
# Dynamic Database Credentials
vault write database/roles/my-role \
    db_name=postgresql \
    creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; \
        GRANT SELECT ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
    default_ttl="1h" \
    max_ttl="24h"

# Certificate Issuance
vault write pki/roles/example-dot-com \
    allowed_domains="example.com" \
    allow_subdomains="true" \
    max_ttl="72h"

# AWS Dynamic Access
vault write aws/roles/my-role \
    credential_type=iam_user \
    policy_document=@policy.json
