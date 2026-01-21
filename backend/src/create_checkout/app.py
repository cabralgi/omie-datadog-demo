import json
from datetime import datetime, timezone

from datadog_lambda.wrapper import datadog_lambda_wrapper
from ddtrace import tracer

from lib.http import json_response, maybe_handle_options, normalize_headers
from lib.mongo import get_db


@datadog_lambda_wrapper
def handler(event, context):
    options_response = maybe_handle_options(event)
    if options_response:
        return options_response

    headers = normalize_headers(event.get("headers"))
    action_name = headers.get("x-action-name", "create-checkout")
    action_raw_id = headers.get("x-action-raw-id", "unknown")
    body = json.loads(event.get("body") or "{}")

    span = tracer.current_span()
    if span is not None:
        span.resource = action_name

    print(
        json.dumps(
            {
                "message": "action",
                "action_name": action_name,
                "action_raw_id": action_raw_id,
            }
        )
    )

    try:
        db = get_db()
        result = db["checkouts"].insert_one(
            {"createdAt": datetime.now(timezone.utc).isoformat(), "payload": body}
        )
    except Exception as exc:
        print(json.dumps({"message": "mongo_error", "error": str(exc)}))
        return json_response(
            500,
            {
                "action": action_name,
                "error": "MongoDB connection failed",
            },
        )

    return json_response(
        201,
        {
            "action": action_name,
            "checkoutId": str(result.inserted_id),
        },
    )
