# AWS Cheatsheet

## AWS CLI Configuration
```bash
# Configure AWS CLI
aws configure
aws configure --profile prod
aws configure list

# Environment Variables
export AWS_ACCESS_KEY_ID="your_access_key"
export AWS_SECRET_ACCESS_KEY="your_secret_key"
export AWS_DEFAULT_REGION="us-west-2"
export AWS_PROFILE="prod"
```

## EC2 Commands
```bash
# Instance Management
aws ec2 run-instances \
    --image-id ami-12345678 \
    --instance-type t2.micro \
    --key-name my-key \
    --security-group-ids sg-12345678

aws ec2 describe-instances
aws ec2 start-instances --instance-ids i-1234567890abcdef0
aws ec2 stop-instances --instance-ids i-1234567890abcdef0
aws ec2 terminate-instances --instance-ids i-1234567890abcdef0

# Security Groups
aws ec2 create-security-group \
    --group-name my-sg \
    --description "My security group"

aws ec2 authorize-security-group-ingress \
    --group-id sg-12345678 \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0

# Key Pairs
aws ec2 create-key-pair --key-name my-key
aws ec2 delete-key-pair --key-name my-key
```

## S3 Commands
```bash
# Bucket Operations
aws s3 mb s3://my-bucket
aws s3 rb s3://my-bucket
aws s3 ls
aws s3 ls s3://my-bucket

# File Operations
aws s3 cp file.txt s3://my-bucket/
aws s3 cp s3://my-bucket/file.txt ./
aws s3 sync . s3://my-bucket
aws s3 sync s3://my-bucket .
aws s3 rm s3://my-bucket/file.txt
aws s3 rm s3://my-bucket --recursive

# Bucket Policy
aws s3api put-bucket-policy \
    --bucket my-bucket \
    --policy file://policy.json

# Website Configuration
aws s3 website s3://my-bucket/ \
    --index-document index.html \
    --error-document error.html
```

## IAM Commands
```bash
# User Management
aws iam create-user --user-name bob
aws iam delete-user --user-name bob
aws iam list-users

# Group Management
aws iam create-group --group-name developers
aws iam add-user-to-group \
    --user-name bob \
    --group-name developers

# Policy Management
aws iam create-policy \
    --policy-name my-policy \
    --policy-document file://policy.json

aws iam attach-user-policy \
    --user-name bob \
    --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

# Role Management
aws iam create-role \
    --role-name my-role \
    --assume-role-policy-document file://trust-policy.json

aws iam attach-role-policy \
    --role-name my-role \
    --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
```

## RDS Commands
```bash
# Instance Management
aws rds create-db-instance \
    --db-instance-identifier my-instance \
    --db-instance-class db.t3.micro \
    --engine mysql \
    --master-username admin \
    --master-user-password secret123

aws rds describe-db-instances
aws rds start-db-instance --db-instance-identifier my-instance
aws rds stop-db-instance --db-instance-identifier my-instance

# Snapshot Management
aws rds create-db-snapshot \
    --db-instance-identifier my-instance \
    --db-snapshot-identifier my-snapshot

aws rds restore-db-instance-from-db-snapshot \
    --db-instance-identifier my-new-instance \
    --db-snapshot-identifier my-snapshot
```

## VPC Commands
```bash
# VPC Creation
aws ec2 create-vpc --cidr-block 10.0.0.0/16
aws ec2 create-subnet \
    --vpc-id vpc-12345678 \
    --cidr-block 10.0.1.0/24

# Internet Gateway
aws ec2 create-internet-gateway
aws ec2 attach-internet-gateway \
    --vpc-id vpc-12345678 \
    --internet-gateway-id igw-12345678

# Route Tables
aws ec2 create-route-table --vpc-id vpc-12345678
aws ec2 create-route \
    --route-table-id rtb-12345678 \
    --destination-cidr-block 0.0.0.0/0 \
    --gateway-id igw-12345678
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
aws logs create-log-group --log-group-name my-logs
aws logs create-log-stream \
    --log-group-name my-logs \
    --log-stream-name stream1

# Metrics
aws cloudwatch put-metric-data \
    --namespace "MyApp" \
    --metric-name "Requests" \
    --value 42

# Alarms
aws cloudwatch put-metric-alarm \
    --alarm-name cpu-mon \
    --alarm-description "CPU utilization" \
    --metric-name CPUUtilization \
    --namespace AWS/EC2 \
    --statistic Average \
    --period 300 \
    --threshold 70 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2
```

## Best Practices

1. **Security**
```bash
# Enable MFA
aws iam enable-mfa-device \
    --user-name bob \
    --serial-number arn:aws:iam::account-id:mfa/bob \
    --authentication-code1 123456 \
    --authentication-code2 789012

# Use Roles Instead of Keys
aws sts assume-role \
    --role-arn arn:aws:iam::account-id:role/my-role \
    --role-session-name my-session

# Encrypt Data
aws kms create-key
aws kms encrypt \
    --key-id 1234abcd-12ab-34cd-56ef-1234567890ab \
    --plaintext fileb://secret.txt
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
