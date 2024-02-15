import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

const CHAINS = {
  sepolia: {
    viemChain: sepolia,
    getHttpSocketUrl: (infuraEndpoint: string) => http(infuraEndpoint),
  },
} as const;

const SELECTED_CHAIN = CHAINS.sepolia;

export const getPublicClient = (infuraEndpoint: string) =>
  createPublicClient({
    chain: SELECTED_CHAIN.viemChain,
    transport: SELECTED_CHAIN.getHttpSocketUrl(infuraEndpoint),
  });
