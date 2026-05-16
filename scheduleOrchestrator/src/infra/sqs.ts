import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { env } from "@src/config/env";

export const sqs = new SQSClient({
  region: env.AWS_REGION,
  endpoint: env.AWS_ENDPOINT_URL,
});

export async function publishJsonMessage(
  queueUrl: string,
  message: unknown,
): Promise<void> {
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(message),
    }),
  );
}
