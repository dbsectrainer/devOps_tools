# HashiCorp Vault Cheatsheet

*This cheatsheet provides a reference for HashiCorp Vault commands, configuration, and best practices.*

*Note: Vault 1.15.1 is the latest version as of April 2025*

## Basic Commands
```bash
# Server Operations
vault server -dev                  # Start development server for testing
vault operator init               # Initialize vault and generate root keys
vault operator unseal            # Provide key share to unseal vault
vault status                     # Display health and seal status

# Authentication
vault login                      # Start interactive authentication
vault login -method=userpass username=admin  # Authenticate with username/password
vault token create              # Generate new access token
vault token lookup             # Display token metadata and policies
vault token revoke             # Invalidate and remove token

# Secret Management
vault kv put secret/app key=value    # Store new secret at specified path
vault kv get secret/app              # Retrieve secret and metadata
vault kv list secret/                # Show all secrets in path
vault kv delete secret/app           # Remove secret from storage
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
vault auth enable userpass                    # Enable username/password authentication
vault write auth/userpass/users/admin \       # Create admin user with password
    password=password \                       # Set user's password
    policies=admin                           # Assign admin policy to user

# AppRole Auth
vault auth enable approle                     # Enable application authentication method
vault write auth/approle/role/my-role \       # Configure role for application
    secret_id_ttl=10m \                      # Secret ID expires after 10 minutes
    token_num_uses=10 \                      # Token can be used 10 times
    token_ttl=20m \                          # Token expires after 20 minutes
    token_max_ttl=30m \                      # Token cannot be renewed beyond 30 minutes
    secret_id_num_uses=40                    # Secret ID can be used 40 times

# Get Role ID and Secret ID
vault read auth/approle/role/my-role/role-id    # Get static role identifier
vault write -f auth/approle/role/my-role/secret-id  # Generate dynamic secret identifier
```

## Secret Engines
```bash
# KV Version 2
vault secrets enable -version=2 kv             # Enable versioned key-value store
vault kv put kv/my-secret foo=bar             # Store new secret version
vault kv get kv/my-secret                     # Retrieve latest version
vault kv metadata get kv/my-secret            # Show version history and metadata

# Database Secrets
vault secrets enable database                  # Enable dynamic database credentials
vault write database/config/my-postgresql \    # Configure PostgreSQL connection
    plugin_name=postgresql-database-plugin \   # Specify database type
    allowed_roles="my-role" \                 # Roles allowed to generate credentials
    connection_url="postgresql://{{username}}:{{password}}@localhost:5432/mydb" \  # Connection string
    username="root" \                         # Admin username
    password="rootpassword"                   # Admin password

# AWS Secrets
vault secrets enable aws                      # Enable AWS credential generation
vault write aws/config/root \                 # Configure AWS root credentials
    access_key=AKIAEXAMPLE \                 # Root AWS access key
    secret_key=secret \                      # Root AWS secret key
    region=us-east-1                         # Default AWS region

# PKI Secrets
vault secrets enable pki                      # Enable certificate authority
vault write pki/root/generate/internal \      # Generate root certificate
    common_name=example.com \                # Domain for certificate
    ttl=8760h                               # Valid for one year
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
vault kv put -wrap-ttl=30m secret/app key=value   # Create secret with temporary access token
                                                 # that expires in 30 minutes

# Unwrap Secret
vault unwrap <wrapping_token>                    # Retrieve and destroy wrapped secret
                                                # Can only be used once

# Look up Wrap Info
vault token lookup <wrapping_token>              # Check wrapping token status and metadata
```

## Audit Logging
```bash
# Enable File Audit
vault audit enable file file_path=/var/log/vault/audit.log  # Log all requests to file
                                                          # Includes authentication and data access

# Enable Syslog Audit
vault audit enable syslog                                  # Send audit logs to system logger
                                                          # Integrates with log management tools

# List Audit Devices
vault audit list                                          # Show enabled audit logging methods
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
curl \                                          # Authenticate via REST API
    --request POST \                            # Send POST request
    --data '{"password": "password"}' \         # Provide credentials
    http://127.0.0.1:8200/v1/auth/userpass/login/admin  # Login endpoint

# Write Secret
curl \                                          # Store secret via REST API
    --header "X-Vault-Token: $VAULT_TOKEN" \    # Include authentication token
    --request POST \                            # Send POST request
    --data '{"data": {"password": "secret"}}' \ # Secret data in JSON format
    http://127.0.0.1:8200/v1/secret/data/app   # KV v2 endpoint

# Read Secret
curl \                                          # Retrieve secret via REST API
    --header "X-Vault-Token: $VAULT_TOKEN" \    # Include authentication token
    http://127.0.0.1:8200/v1/secret/data/app   # KV v2 endpoint
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
```

## Additional Resources

- [HashiCorp Vault Documentation](https://www.vaultproject.io/docs)
- [Vault API Documentation](https://www.vaultproject.io/api-docs)
- [Vault Tutorials](https://learn.hashicorp.com/vault)
- [Vault Reference Architecture](https://learn.hashicorp.com/tutorials/vault/reference-architecture)
- [Vault Best Practices](https://learn.hashicorp.com/tutorials/vault/production-hardening)
- [DevOps Glossary](../cheatsheets/devops_glossary.md)
