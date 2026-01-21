import json


def normalize_headers(headers):
    if not headers:
        return {}
    return {k.lower(): v for k, v in headers.items()}


def json_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "content-type": "application/json",
            "access-control-allow-origin": "*",
            "access-control-allow-headers": (
                "content-type,x-datadog-trace-id,x-datadog-parent-id,"
                "x-datadog-sampling-priority,x-datadog-origin,"
                "traceparent,tracestate,"
                "x-action-name,x-action-raw-id"
            ),
            "access-control-allow-methods": "GET,POST,OPTIONS",
        },
        "body": json.dumps(body, default=str),
    }


def maybe_handle_options(event):
    method = (
        event.get("requestContext", {})
        .get("http", {})
        .get("method", "")
        .upper()
    )
    if method != "OPTIONS":
        return None

    return {
        "statusCode": 204,
        "headers": {
            "access-control-allow-origin": "*",
            "access-control-allow-headers": (
                "content-type,x-datadog-trace-id,x-datadog-parent-id,"
                "x-datadog-sampling-priority,x-datadog-origin,"
                "traceparent,tracestate,"
                "x-action-name,x-action-raw-id"
            ),
            "access-control-allow-methods": "GET,POST,OPTIONS",
        },
        "body": "",
    }
