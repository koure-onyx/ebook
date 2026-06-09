/** Strip MongoDB/ObjectId values so props are safe for Client Components. */
export function serializeForClient<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
