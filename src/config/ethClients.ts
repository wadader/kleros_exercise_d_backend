import { createPublicClient, defineChain, http } from "viem";
import { sepolia } from "viem/chains";

const ganache = defineChain({
  id: 1337,
  name: "Ganache",
  nativeCurrency: {
    decimals: 18,
    name: "Ganache Ether",
    symbol: "GETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:7545"],
    },
  },
});

const CHAINS = {
  sepolia: {
    viemChain: sepolia,
    getHttpSocketUrl: (infuraEndpoint: string) => http(infuraEndpoint),
  },
} as const;

const SELECTED_CHAIN = CHAINS.sepolia;

export const getPublicClient = (infuraEndpoint: string) => {
  if (process.env.NODE_ENV == "dev")
    return createPublicClient({
      chain: ganache,
      transport: http(),
    });

  return createPublicClient({
    chain: SELECTED_CHAIN.viemChain,
    transport: SELECTED_CHAIN.getHttpSocketUrl(infuraEndpoint),
  });
};
