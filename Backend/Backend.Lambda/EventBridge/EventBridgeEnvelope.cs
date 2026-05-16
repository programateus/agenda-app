using System.Text.Json;
using System.Text.Json.Serialization;

namespace Backend.Lambda.EventBridge;

public sealed record EventBridgeEnvelope(
    string Id,
    string Source,
    [property: JsonPropertyName("detail-type")]
    string DetailType,
    JsonElement Detail
);
