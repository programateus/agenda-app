import { EventBridgeClient } from "@aws-sdk/client-eventbridge";
import { env } from "@src/config/env";

export const eventBridge = new EventBridgeClient({
  region: env.AWS_REGION,
  endpoint: env.AWS_ENDPOINT_URL,
});
