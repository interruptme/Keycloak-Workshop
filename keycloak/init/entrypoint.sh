#!/bin/bash
set -e

echo "Initializing Terraform..."
terraform init

echo "Creating Terraform plan..."
terraform plan -out=tfplan

echo "Applying Terraform plan..."
terraform apply -auto-approve tfplan

echo "Terraform execution completed successfully."