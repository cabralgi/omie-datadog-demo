const generateId = () => {
  const buffer = new Uint32Array(2);
  crypto.getRandomValues(buffer);
  const id = (BigInt(buffer[0]) << 32n) | BigInt(buffer[1]);
  return id.toString();
};

export const buildTraceHeaders = () => {
  return {
    "x-datadog-trace-id": generateId(),
    "x-datadog-parent-id": generateId(),
    "x-datadog-sampling-priority": "1"
  };
};
