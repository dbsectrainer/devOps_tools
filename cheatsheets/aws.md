# AWS Cheatsheet

*This cheatsheet provides a reference for AWS CLI commands and services.*

## AWS CLI Configuration
```bash
# Configure AWS CLI
aws configure                    # Interactive setup of AWS credentials and region
aws configure --profile prod     # Configure a named profile for different AWS accounts
aws configure list              # Display current configuration settings

# Environment Variables
export AWS_ACCESS_KEY_ID="your_access_key"         # Set access key for AWS API authentication
export AWS_SECRET_ACCESS_KEY="your_secret_key"     # Set secret key for AWS API authentication
export AWS_DEFAULT_REGION="us-west-2"              # Set default region for AWS operations
export AWS_PROFILE="prod"                          # Switch to a specific named profile
```

## EC2 Commands
```bash
# Instance Management
aws ec2 run-instances \                            # Launch new EC2 instances with specified configuration
    --image-id ami-12345678 \                     # AMI ID determines OS and pre-installed software
    --instance-type t2.micro \                    # Instance size affects CPU, memory, and cost
    --key-name my-key \                          # SSH key pair for secure access
    --security-group-ids sg-12345678             # Network security rules

aws ec2 describe-instances                        # List all EC2 instances with detailed information
aws ec2 start-instances --instance-ids i-1234567890abcdef0   # Start stopped instances
aws ec2 stop-instances --instance-ids i-1234567890abcdef0    # Stop running instances (maintains data)
aws ec2 terminate-instances --instance-ids i-1234567890abcdef0   # Permanently delete instances

# Security Groups
aws ec2 create-security-group \                   # Create virtual firewall for EC2 instances
    --group-name my-sg \                         # Unique name for the security group
    --description "My security group"            # Description for identification

aws ec2 authorize-security-group-ingress \        # Add inbound rules to security group
    --group-id sg-12345678 \                     # Security group to modify
    --protocol tcp \                             # Network protocol (tcp, udp, icmp)
    --port 22 \                                  # Port number for the rule
    --cidr 0.0.0.0/0                            # IP range allowed to connect

# Key Pairs
aws ec2 create-key-pair --key-name my-key        # Create new SSH key pair for instance access
aws ec2 delete-key-pair --key-name my-key        # Remove key pair when no longer needed
```

## S3 Commands
```bash
# Bucket Operations
aws s3 mb s3://my-bucket                         # Create new S3 bucket for storage
aws s3 rb s3://my-bucket                         # Remove empty bucket
aws s3 ls                                        # List all buckets in account
aws s3 ls s3://my-bucket                         # List contents of specific bucket

# File Operations
aws s3 cp file.txt s3://my-bucket/               # Upload file to S3 bucket
aws s3 cp s3://my-bucket/file.txt ./             # Download file from S3 bucket
aws s3 sync . s3://my-bucket                     # Upload directory contents to bucket
aws s3 sync s3://my-bucket .                     # Download bucket contents to directory
aws s3 rm s3://my-bucket/file.txt                # Delete single file from bucket
aws s3 rm s3://my-bucket --recursive             # Delete all contents of bucket

# Bucket Policy
aws s3api put-bucket-policy \                    # Set permissions policy for bucket
    --bucket my-bucket \                         # Target bucket name
    --policy file://policy.json                  # JSON file containing policy rules

# Website Configuration
aws s3 website s3://my-bucket/ \                 # Configure bucket for static website hosting
    --index-document index.html \                # Default page for root/subdirectories
    --error-document error.html                  # Custom error page
```

## IAM Commands
```bash
# User Management
aws iam create-user --user-name bob              # Create new IAM user for access management
aws iam delete-user --user-name bob              # Remove IAM user and their access
aws iam list-users                               # Display all IAM users in account

# Group Management
aws iam create-group --group-name developers     # Create group for managing multiple users
aws iam add-user-to-group \                      # Add user to group for shared permissions
    --user-name bob \                            # User to add to group
    --group-name developers                      # Target group name

# Policy Management
aws iam create-policy \                          # Create custom IAM policy for permissions
    --policy-name my-policy \                    # Name of the new policy
    --policy-document file://policy.json         # JSON file defining permissions

aws iam attach-user-policy \                     # Attach existing policy to user
    --user-name bob \                            # Target user
    --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess  # Policy to attach

# Role Management
aws iam create-role \                            # Create role for service-to-service access
    --role-name my-role \                        # Name of the new role
    --assume-role-policy-document file://trust-policy.json  # Who can assume this role

aws iam attach-role-policy \                     # Attach permissions policy to role
    --role-name my-role \                        # Target role
    --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess  # Permissions to grant
```

## RDS Commands
```bash
# Instance Management
aws rds create-db-instance \                     # Launch new managed database instance
    --db-instance-identifier my-instance \       # Unique identifier for the database
    --db-instance-class db.t3.micro \           # Instance size (affects performance/cost)
    --engine mysql \                            # Database engine type
    --master-username admin \                   # Admin username for database
    --master-user-password secret123           # Admin password (use secure password)

aws rds describe-db-instances                    # List all RDS instances and their details
aws rds start-db-instance --db-instance-identifier my-instance   # Start stopped database
aws rds stop-db-instance --db-instance-identifier my-instance    # Stop running database

# Snapshot Management
aws rds create-db-snapshot \                     # Create backup of database
    --db-instance-identifier my-instance \       # Source database instance
    --db-snapshot-identifier my-snapshot         # Name for the snapshot

aws rds restore-db-instance-from-db-snapshot \   # Create new instance from snapshot
    --db-instance-identifier my-new-instance \   # Name for new instance
    --db-snapshot-identifier my-snapshot         # Source snapshot to restore from
```

## VPC Commands
```bash
# VPC Creation
aws ec2 create-vpc --cidr-block 10.0.0.0/16     # Create isolated network environment
aws ec2 create-subnet \                          # Create subnet within VPC
    --vpc-id vpc-12345678 \                     # Parent VPC ID
    --cidr-block 10.0.1.0/24                    # IP range for subnet

# Internet Gateway
aws ec2 create-internet-gateway                  # Create gateway for internet access
aws ec2 attach-internet-gateway \                # Connect gateway to VPC
    --vpc-id vpc-12345678 \                     # VPC to attach to
    --internet-gateway-id igw-12345678          # Gateway to attach

# Route Tables
aws ec2 create-route-table --vpc-id vpc-12345678 # Create routing rules table for VPC
aws ec2 create-route \                           # Add route for internet access
    --route-table-id rtb-12345678 \             # Route table to modify
    --destination-cidr-block 0.0.0.0/0 \        # All external traffic
    --gateway-id igw-12345678                   # Send through internet gateway
```

## CloudFormation
```yaml
# Basic Template
AWSTemplateFormatVersion: '2010-09-09'
Description: 'My CloudFormation template'

Parameters:
  InstanceType:
    Type: String
    Default: t2.micro
    AllowedValues:
      - t2.micro
      - t2.small

Resources:
  MyEC2Instance:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: !Ref InstanceType
      ImageId: ami-xxxxxxxxxxxxxxxxx
      SecurityGroups:
        - !Ref MySG

  MySG:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Allow SSH
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 22
          ToPort: 22
          CidrIp: 0.0.0.0/0

Outputs:
  InstanceId:
    Description: Instance ID
    Value: !Ref MyEC2Instance
```

## Lambda Functions
```bash
# Function Management
aws lambda create-function \
    --function-name my-function \
    --runtime nodejs14.x \
    --role arn:aws:iam::account-id:role/lambda-role \
    --handler index.handler \
    --zip-file fileb://function.zip

aws lambda update-function-code \
    --function-name my-function \
    --zip-file fileb://function.zip

aws lambda invoke \
    --function-name my-function \
    --payload '{"key": "value"}' \
    output.txt
```

## CloudWatch Commands
```bash
# Logs
aws logs create-log-group --log-group-name my-logs   # Create container for log streams
aws logs create-log-stream \                         # Create stream for application logs
    --log-group-name my-logs \                      # Parent log group
    --log-stream-name stream1                       # Stream identifier

# Metrics
aws cloudwatch put-metric-data \                    # Send custom metric to CloudWatch
    --namespace "MyApp" \                          # Grouping for related metrics
    --metric-name "Requests" \                     # Name of the metric
    --value 42                                    # Current metric value

# Alarms
aws cloudwatch put-metric-alarm \                  # Create automated alert
    --alarm-name cpu-mon \                        # Name for the alarm
    --alarm-description "CPU utilization" \       # Human-readable description
    --metric-name CPUUtilization \               # Metric to monitor
    --namespace AWS/EC2 \                        # Service namespace
    --statistic Average \                        # How to aggregate data points
    --period 300 \                              # Time between evaluations (seconds)
    --threshold 70 \                            # Trigger threshold
    --comparison-operator GreaterThanThreshold \ # How to compare against threshold
    --evaluation-periods 2                      # Number of periods before alarm
```

## Best Practices

1. **Security**
```bash
# Enable MFA
aws iam enable-mfa-device \                     # Set up multi-factor authentication
    --user-name bob \                          # User to secure
    --serial-number arn:aws:iam::account-id:mfa/bob \  # MFA device identifier
    --authentication-code1 123456 \            # First code from device
    --authentication-code2 789012              # Second code from device

# Use Roles Instead of Keys
aws sts assume-role \                          # Temporarily assume role permissions
    --role-arn arn:aws:iam::account-id:role/my-role \  # Role to assume
    --role-session-name my-session            # Name for audit tracking

# Encrypt Data
aws kms create-key                            # Create encryption key for sensitive data
aws kms encrypt \                             # Encrypt data using KMS
    --key-id 1234abcd-12ab-34cd-56ef-1234567890ab \  # Key to use
    --plaintext fileb://secret.txt           # File to encrypt
```

2. **Cost Management**
```bash
# Cost Explorer
aws ce get-cost-and-usage \
    --time-period Start=2023-01-01,End=2023-01-31 \
    --granularity MONTHLY \
    --metrics "BlendedCost" "UnblendedCost"

# Budget Setup
aws budgets create-budget \
    --account-id 123456789012 \
    --budget file://budget.json \
    --notifications-with-subscribers file://notifications.json
```

3. **Resource Tagging**
```bash
# Tag Resources
aws ec2 create-tags \
    --resources i-1234567890abcdef0 \
    --tags Key=Environment,Value=Production

# Tag Policy
aws organizations put-resource-policy \
    --content file://tag-policy.json
```

4. **Backup Strategy**
```bash
# Create Backup Plan
aws backup create-backup-plan \
    --backup-plan file://backup-plan.json

# Create Recovery Point
aws backup start-backup-job \
    --backup-vault-name my-vault \
    --resource-arn arn:aws:ec2:region:account-id:instance/i-1234567890abcdef0
```

5. **Monitoring Setup**
```bash
# Dashboard Creation
aws cloudwatch put-dashboard \
    --dashboard-name my-dashboard \
    --dashboard-body file://dashboard.json

# Log Insights
aws logs start-query \
    --log-group-name my-logs \
    --start-time 1620000000 \
    --end-time 1620086400 \
    --query-string 'fields @timestamp, @message | sort @timestamp desc'
```

## Additional Resources

- [AWS CLI Documentation](https://docs.aws.amazon.com/cli/latest/reference/)
- [AWS SDK Documentation](https://docs.aws.amazon.com/sdk-for-javascript/index.html)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [AWS Architecture Center](https://aws.amazon.com/architecture/)
- [AWS Glossary](../cheatsheets/devops_glossary.md)
