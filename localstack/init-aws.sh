#!/bin/bash
set -e

ACCOUNT_ID="000000000000"
REGION="us-east-1"

EVENT_BUS_NAME="schedule-event-bus"

SCHEDULER_QUEUE_NAME="schedule-event-queue"
SCHEDULER_DLQ_NAME="schedule-event-dlq"
SCHEDULER_RULE_NAME="schedule-event-rule"

BACKEND_CHAT_QUEUE_NAME="backend-chat-response-queue"
BACKEND_CHAT_DLQ_NAME="backend-chat-response-dlq"
BACKEND_CHAT_RULE_NAME="backend-chat-response-rule"

create_queue_with_dlq() {
  local queue_name="$1"
  local dlq_name="$2"

  awslocal sqs create-queue \
    --queue-name "$dlq_name" >/dev/null

  local dlq_url
  dlq_url=$(awslocal sqs get-queue-url \
    --queue-name "$dlq_name" \
    --query "QueueUrl" \
    --output text)

  local dlq_arn
  dlq_arn=$(awslocal sqs get-queue-attributes \
    --queue-url "$dlq_url" \
    --attribute-names QueueArn \
    --query "Attributes.QueueArn" \
    --output text)

  awslocal sqs create-queue \
    --queue-name "$queue_name" \
    --attributes "{
      \"VisibilityTimeout\": \"5\",
      \"RedrivePolicy\": \"{\\\"deadLetterTargetArn\\\":\\\"$dlq_arn\\\",\\\"maxReceiveCount\\\":\\\"3\\\"}\"
    }" >/dev/null

  local queue_url
  queue_url=$(awslocal sqs get-queue-url \
    --queue-name "$queue_name" \
    --query "QueueUrl" \
    --output text)

  local queue_arn
  queue_arn=$(awslocal sqs get-queue-attributes \
    --queue-url "$queue_url" \
    --attribute-names QueueArn \
    --query "Attributes.QueueArn" \
    --output text)

  echo "$queue_url|$queue_arn"
}

awslocal events create-event-bus \
  --name "$EVENT_BUS_NAME" >/dev/null 2>&1 || true

scheduler_queue=$(create_queue_with_dlq "$SCHEDULER_QUEUE_NAME" "$SCHEDULER_DLQ_NAME")
SCHEDULER_QUEUE_URL="${scheduler_queue%%|*}"
SCHEDULER_QUEUE_ARN="${scheduler_queue##*|}"

backend_chat_queue=$(create_queue_with_dlq "$BACKEND_CHAT_QUEUE_NAME" "$BACKEND_CHAT_DLQ_NAME")
BACKEND_CHAT_QUEUE_URL="${backend_chat_queue%%|*}"
BACKEND_CHAT_QUEUE_ARN="${backend_chat_queue##*|}"

awslocal events put-rule \
  --name "$SCHEDULER_RULE_NAME" \
  --event-bus-name "$EVENT_BUS_NAME" \
  --event-pattern '{
    "source": ["schedule.backend"],
    "detail-type": [
      "ScheduleEntryCreated",
      "ScheduleEntryUpdated",
      "ScheduleEntryDeleted",
      "ScheduleEntryOccurrenceUpserted",
      "ScheduleChatMessageCreated"
    ]
  }'

SCHEDULER_RULE_ARN="arn:aws:events:$REGION:$ACCOUNT_ID:rule/$EVENT_BUS_NAME/$SCHEDULER_RULE_NAME"

awslocal sqs set-queue-attributes \
  --queue-url "$SCHEDULER_QUEUE_URL" \
  --attributes "{
    \"Policy\": \"{\\\"Version\\\":\\\"2012-10-17\\\",\\\"Statement\\\":[{\\\"Effect\\\":\\\"Allow\\\",\\\"Principal\\\":{\\\"Service\\\":\\\"events.amazonaws.com\\\"},\\\"Action\\\":\\\"sqs:SendMessage\\\",\\\"Resource\\\":\\\"$SCHEDULER_QUEUE_ARN\\\",\\\"Condition\\\":{\\\"ArnEquals\\\":{\\\"aws:SourceArn\\\":\\\"$SCHEDULER_RULE_ARN\\\"}}}]}\"
  }"

awslocal events put-targets \
  --rule "$SCHEDULER_RULE_NAME" \
  --event-bus-name "$EVENT_BUS_NAME" \
  --targets "Id=schedule-event-sqs-target,Arn=$SCHEDULER_QUEUE_ARN"

awslocal events put-rule \
  --name "$BACKEND_CHAT_RULE_NAME" \
  --event-bus-name "$EVENT_BUS_NAME" \
  --event-pattern '{
    "source": ["schedule.orchestrator"],
    "detail-type": [
      "ScheduleAssistantMessageCreated"
    ]
  }'

BACKEND_CHAT_RULE_ARN="arn:aws:events:$REGION:$ACCOUNT_ID:rule/$EVENT_BUS_NAME/$BACKEND_CHAT_RULE_NAME"

awslocal sqs set-queue-attributes \
  --queue-url "$BACKEND_CHAT_QUEUE_URL" \
  --attributes "{
    \"Policy\": \"{\\\"Version\\\":\\\"2012-10-17\\\",\\\"Statement\\\":[{\\\"Effect\\\":\\\"Allow\\\",\\\"Principal\\\":{\\\"Service\\\":\\\"events.amazonaws.com\\\"},\\\"Action\\\":\\\"sqs:SendMessage\\\",\\\"Resource\\\":\\\"$BACKEND_CHAT_QUEUE_ARN\\\",\\\"Condition\\\":{\\\"ArnEquals\\\":{\\\"aws:SourceArn\\\":\\\"$BACKEND_CHAT_RULE_ARN\\\"}}}]}\"
  }"

awslocal events put-targets \
  --rule "$BACKEND_CHAT_RULE_NAME" \
  --event-bus-name "$EVENT_BUS_NAME" \
  --targets "Id=backend-chat-response-sqs-target,Arn=$BACKEND_CHAT_QUEUE_ARN"

echo "Scheduler queue URL: $SCHEDULER_QUEUE_URL"
echo "Backend chat queue URL: $BACKEND_CHAT_QUEUE_URL"