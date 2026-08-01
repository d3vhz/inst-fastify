type FormatTimestamps<T> = {
  [K in keyof T]: K extends "createdAt" | "updatedAt" ? string : T[K];
};

const formatTimestamps = <T extends { createdAt: Date; updatedAt: Date }>(
  data: T,
): FormatTimestamps<T> =>
  ({
    ...data,
    createdAt: data.createdAt.toISOString(),
    updatedAt: data.updatedAt.toISOString(),
  }) as FormatTimestamps<T>;

export { formatTimestamps };
