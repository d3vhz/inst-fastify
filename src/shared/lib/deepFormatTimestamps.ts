type FormatTimestampsDeep<T> = T extends Date
  ? T
  : T extends Array<infer U>
    ? Array<FormatTimestampsDeep<U>>
    : T extends object
      ? T extends Function
        ? T
        : {
            [K in keyof T]: K extends "createdAt" | "updatedAt"
              ? T[K] extends Date
                ? string
                : FormatTimestampsDeep<T[K]>
              : FormatTimestampsDeep<T[K]>;
          }
      : T;

const deepFormatTimestamps = <T>(data: T): FormatTimestampsDeep<T> => {
  if (data === null || data === undefined) {
    return data as FormatTimestampsDeep<T>;
  }

  if (typeof data === "function") {
    return data as FormatTimestampsDeep<T>;
  }

  if (data instanceof Date) {
    return data as FormatTimestampsDeep<T>;
  }

  if (Array.isArray(data)) {
    return data.map((item) => deepFormatTimestamps(item)) as FormatTimestampsDeep<T>;
  }

  if (typeof data === "object") {
    const result: Record<string, unknown> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = (data as Record<string, unknown>)[key];
        if ((key === "createdAt" || key === "updatedAt") && value instanceof Date) {
          result[key] = value.toISOString();
        } else {
          result[key] = deepFormatTimestamps(value);
        }
      }
    }
    return result as FormatTimestampsDeep<T>;
  }

  return data as FormatTimestampsDeep<T>;
};

export { deepFormatTimestamps };
