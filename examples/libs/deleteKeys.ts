/**
 * Delete keys from an object
 * @param object Object to delete keys from
 * @param fields Keys to delete from object
 */
export function deleteKeys(object: Omit<Record<string, any>, "a" | "b">, fields: string[]) {
  fields.forEach(field => {
    delete object[field as keyof typeof object];
  });
}