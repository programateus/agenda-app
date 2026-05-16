import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
} from "@aws-sdk/client-sqs";
import { sqs } from "@src/infra/sqs";
import { env } from "@src/config/env";
import { handler } from "@src/lambdas/processScheduleEvent";

const queueUrl = env.SCHEDULE_ORCHESTRATOR_EVENTS_QUEUE_URL;

if (!queueUrl) {
  throw new Error("SCHEDULE_ORCHESTRATOR_EVENTS_QUEUE_URL is required");
}

async function poll(): Promise<void> {
  const response = await sqs.send(
    new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 10,
    }),
  );

  for (const message of response.Messages ?? []) {
    const result = await handler({
      Records: [
        {
          messageId: message.MessageId ?? "",
          receiptHandle: message.ReceiptHandle ?? "",
          body: message.Body ?? "",
          attributes: {} as never,
          messageAttributes: {},
          md5OfBody: message.MD5OfBody ?? "",
          eventSource: "aws:sqs",
          eventSourceARN: "",
          awsRegion: process.env.AWS_REGION ?? "us-east-1",
        },
      ],
    });

    if (result.batchItemFailures.length === 0 && message.ReceiptHandle) {
      await sqs.send(
        new DeleteMessageCommand({
          QueueUrl: queueUrl,
          ReceiptHandle: message.ReceiptHandle,
        }),
      );
    }
  }
}

while (true) {
  await poll();
}
