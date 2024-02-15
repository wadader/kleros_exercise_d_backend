export type EthAddress = `0x${string & { length: 40 }}`;

export function isEthAddress(value: unknown): value is EthAddress {
  const isString = typeof value === "string";
  return isString && /^0x[a-fA-F0-9]{40}$/.test(value);
}

export type Hash = `0x${string & { length: 64 }}`;

export function isHash(value: string): value is Hash {
  return /^0x[a-fA-F0-9]{64}$/.test(value);
}

export function areEthereumHashesEqual(hash1: string, hash2: string): boolean {
  const normalizedHash1 = hash1.startsWith("0x")
    ? hash1.slice(2).toLowerCase()
    : hash1.toLowerCase();
  const normalizedHash2 = hash2.startsWith("0x")
    ? hash2.slice(2).toLowerCase()
    : hash2.toLowerCase();

  return normalizedHash1 === normalizedHash2;
}
