export function safeJSONparse(json: string) {
  try {
    return { error: null, value: JSON.parse(json) };
  } catch (error) {
    return { error: error || true, value: undefined };
  }
}

export function safeJSONstringify(
  json: any,
  replacer?: (key: string, value: any) => any,
  space?: string | number
) {
  try {
    return { error: null, value: JSON.stringify(json, replacer, space) };
  } catch (error) {
    console.error(error);
    return { error: error || true, value: undefined };
  }
}
