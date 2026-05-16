#!/bin/bash
set -e

ACCOUNT_ID="000000000000"
REGION="us-east-1"

MAIN_QUEUE_NAME="schedule-event-queue"
DLQ_NAME="schedule-event-dlq"
RULE_NAME="schedule-event-rule"
EVENT_BUS_NAME="schedule-event-bus"

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

awslocal events create-event-bus \
  --name "$EVENT_BUS_NAME"

awslocal events put-rule \
  --name "$RULE_NAME" \
  --event-bus-name "$EVENT_BUS_NAME" \
  --event-pattern '{"source":["schedule.backend"],"detail-type": [
      "ScheduleEntryCreated",
      "ScheduleEntryUpdated",
      "ScheduleEntryDeleted"
  ]}'

awslocal sqs set-queue-attributes \
  --queue-url "$MAIN_QUEUE_URL" \
  --attributes "{
    \"Policy\": \"{\\\"Version\\\":\\\"2012-10-17\\\",\\\"Statement\\\":[{\\\"Effect\\\":\\\"Allow\\\",\\\"Principal\\\":{\\\"Service\\\":\\\"events.amazonaws.com\\\"},\\\"Action\\\":\\\"sqs:SendMessage\\\",\\\"Resource\\\":\\\"$MAIN_QUEUE_ARN\\\",\\\"Condition\\\":{\\\"ArnEquals\\\":{\\\"aws:SourceArn\\\":\\\"$RULE_ARN\\\"}}}]}\"
  }"


awslocal events put-targets \
  --rule "$RULE_NAME" \
  --event-bus-name "$EVENT_BUS_NAME" \
  --targets "Id=schedule-event-sqs-target,Arn=$MAIN_QUEUE_ARN"