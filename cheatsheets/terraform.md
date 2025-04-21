# Terraform Cheatsheet

## Basic Commands
```bash
# Initialization and Setup
terraform init              # Initialize working directory
terraform get              # Download/update modules
terraform fmt              # Format configuration files
terraform validate        # Validate configuration files

# Planning and Applying
terraform plan            # Show execution plan
terraform apply           # Apply changes
terraform destroy         # Destroy infrastructure

# State Management
terraform show            # Show current state
terraform state list     # List resources in state
terraform state mv       # Move item in state
terraform state rm       # Remove item from state
terraform import         # Import existing resource

# Workspace Management
terraform workspace new    # Create new workspace
terraform workspace list  # List workspaces
terraform workspace select # Switch workspace
terraform workspace delete # Delete workspace
```

## Configuration Syntax
```hcl
# Provider Configuration
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-west-2"
  }
}

# Resource Block
resource "aws_instance" "example" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  
  tags = {
    Name = "example-instance"
  }
}

# Data Source Block
data "aws_ami" "ubuntu" {
  most_recent = true
  
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }
}

# Variables
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

# Outputs
output "instance_ip" {
  value = aws_instance.example.public_ip
}
```

## Module Structure
```hcl
# Module Usage
module "vpc" {
  source = "./modules/vpc"
  
  name = "my-vpc"
  cidr = "10.0.0.0/16"
  
  providers = {
    aws = aws.us-east-1
  }
}

# Module Definition
# modules/vpc/main.tf
resource "aws_vpc" "main" {
  cidr_block = var.cidr
  
  tags = {
    Name = var.name
  }
}

# modules/vpc/variables.tf
variable "name" {
  type = string
}

variable "cidr" {
  type = string
}

# modules/vpc/outputs.tf
output "vpc_id" {
  value = aws_vpc.main.id
}
```

## Common Functions
```hcl
# String Functions
local.uppercase = upper(var.name)
local.lowercase = lower(var.name)
local.joined    = join(",", var.list)

# Numeric Functions
local.floor     = floor(var.number)
local.ceiling   = ceil(var.number)
local.absolute  = abs(var.number)

# Collection Functions
local.first     = element(var.list, 0)
local.contains  = contains(var.list, "value")
local.merged    = merge(var.map1, var.map2)

# Type Conversion
local.to_string = tostring(var.number)
local.to_number = tonumber(var.string)
local.to_list   = tolist(var.set)
```

## Provisioners
```hcl
# Local Exec Provisioner
resource "aws_instance" "web" {
  # ... other configuration ...

  provisioner "local-exec" {
    command = "echo ${self.private_ip} >> private_ips.txt"
  }
}

# Remote Exec Provisioner
resource "aws_instance" "web" {
  # ... other configuration ...

  provisioner "remote-exec" {
    inline = [
      "sudo apt-get update",
      "sudo apt-get install -y nginx"
    ]
  }

  connection {
    type        = "ssh"
    user        = "ubuntu"
    private_key = file("~/.ssh/id_rsa")
    host        = self.public_ip
  }
}
```

## Best Practices
1. **State Management**
   - Use remote state storage
   - Enable state locking
   - Use workspaces for environment separation
   - Implement state backup

2. **Module Organization**
   - Create reusable modules
   - Version modules
   - Document inputs/outputs
   - Keep modules focused

3. **Resource Naming**
   - Use consistent naming conventions
   - Include environment in names
   - Use descriptive names
   - Implement tags

4. **Security**
   - Use variables for sensitive data
   - Implement least privilege
   - Enable encryption
   - Use security groups properly

5. **Code Organization**
   - Separate environments
   - Use consistent formatting
   - Implement version constraints
   - Document configurations

## Common Patterns
```hcl
# Conditional Creation
resource "aws_instance" "example" {
  count = var.create_instance ? 1 : 0
  
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
}

# For Each Loop
resource "aws_instance" "example" {
  for_each = var.instance_config
  
  ami           = each.value.ami
  instance_type = each.value.type
  
  tags = {
    Name = each.key
  }
}

# Dynamic Blocks
resource "aws_security_group" "example" {
  name = "example"
  
  dynamic "ingress" {
    for_each = var.ingress_rules
    content {
      from_port   = ingress.value.from_port
      to_port     = ingress.value.to_port
      protocol    = ingress.value.protocol
      cidr_blocks = ingress.value.cidr_blocks
    }
  }
}
