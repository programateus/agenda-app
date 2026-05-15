#!/bin/bash
set -e

ACCOUNT_ID="000000000000"
REGION="us-east-1"

MAIN_QUEUE_NAME="entry-created-queue"
DLQ_NAME="entry-created-dlq"
RULE_NAME="entry-created-rule"

awslocal sqs create-queue \
  --queue-name "$DLQ_NAME"

DLQ_URL=$(awslocal sqs get-queue-url \
  --queue-name "$DLQ_NAME" \
  --query "QueueUrl" \
  --output text)

DLQ_ARN=$(awslocal sqs get-queue-attributes \
  --queue-url "$DLQ_URL" \
  --attribute-names QueueArn \
  --query "Attributes.QueueArn" \
  --output text)

awslocal sqs create-queue \
  --queue-name "$MAIN_QUEUE_NAME" \
  --attributes "{
    \"VisibilityTimeout\": \"5\",
    \"RedrivePolicy\": \"{\\\"deadLetterTargetArn\\\":\\\"$DLQ_ARN\\\",\\\"maxReceiveCount\\\":\\\"3\\\"}\"
  }"

MAIN_QUEUE_URL=$(awslocal sqs get-queue-url \
  --queue-name "$MAIN_QUEUE_NAME" \
  --query "QueueUrl" \
  --output text)

MAIN_QUEUE_ARN=$(awslocal sqs get-queue-attributes \
  --queue-url "$MAIN_QUEUE_URL" \
  --attribute-names QueueArn \
  --query "Attributes.QueueArn" \
  --output text)

awslocal events put-rule \
  --name "$RULE_NAME" \
  --event-pattern '{"source":["schedule.entries"],"detail-type":["EntryCreated"]}'

awslocal events put-targets \
  --rule "$RULE_NAME" \
  --targets "Id=entry-created-sqs-target,Arn=$MAIN_QUEUE_ARN"