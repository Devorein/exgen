/**
 * Delete keys from an object
 * @param object Object to delete keys from
 * @param fields Keys to delete from object
 */
export function deleteKeys(object: Record<string, any>, fields: string[]) {
  fields.forEach(field => {
    delete object[field as keyof typeof object];
  });
}