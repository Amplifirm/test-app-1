const store: Record<string, string> = {};
export async function getItemAsync(k: string): Promise<string | null> {
  return k in store ? store[k] : null;
}
export async function setItemAsync(k: string, v: string): Promise<void> {
  store[k] = v;
}
export async function deleteItemAsync(k: string): Promise<void> {
  delete store[k];
}
