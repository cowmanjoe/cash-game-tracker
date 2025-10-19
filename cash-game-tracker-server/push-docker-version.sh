#!/usr/bin/env bash

set -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# AWS Configuration
AWS_REGION="us-west-2"
ECR_REGISTRY="904932056538.dkr.ecr.us-west-2.amazonaws.com"
IMAGE_NAME="cash-game-tracker-server"
ECS_CLUSTER="cash-game-tracker-cluster"
ECS_SERVICE="cash-game-tracker-server-service-cxl8pybg"
TASK_DEFINITION_FAMILY="cash-game-tracker-server"

echo "Building Docker image..."
docker build -t $IMAGE_NAME $SCRIPT_DIR

echo "Tagging Docker image..."
docker tag $IMAGE_NAME:latest $ECR_REGISTRY/$IMAGE_NAME:latest

echo "Pushing Docker image to ECR..."
docker push $ECR_REGISTRY/$IMAGE_NAME:latest

echo "Retrieving current task definition..."
TASK_DEFINITION=$(aws ecs describe-task-definition \
  --task-definition $TASK_DEFINITION_FAMILY \
  --region $AWS_REGION \
  --query 'taskDefinition' \
  --output json)

echo "Creating new task definition revision..."
NEW_TASK_DEFINITION=$(echo $TASK_DEFINITION | jq --arg IMAGE "$ECR_REGISTRY/$IMAGE_NAME:latest" '
  .containerDefinitions[0].image = $IMAGE |
  del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy)
')

NEW_TASK_INFO=$(aws ecs register-task-definition \
  --region $AWS_REGION \
  --cli-input-json "$NEW_TASK_DEFINITION")

NEW_REVISION=$(echo $NEW_TASK_INFO | jq -r '.taskDefinition.revision')

echo "Registered new task definition revision: $NEW_REVISION"

echo "Updating ECS service to use new task definition..."
aws ecs update-service \
  --cluster $ECS_CLUSTER \
  --service $ECS_SERVICE \
  --task-definition $TASK_DEFINITION_FAMILY:$NEW_REVISION \
  --force-new-deployment \
  --region $AWS_REGION

echo "Deployment initiated successfully!"
echo "Monitor deployment status with: aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE --region $AWS_REGION"
