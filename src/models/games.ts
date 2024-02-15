import { EthAddress, Hash } from "../types/web3";
import { drizzleDb, salt } from "../config/init";
import { rpslzGames } from "../database/drizzle/schema/schema";
import { RPS_ARTIFACT } from "../artifacts/RPS";
import { getPublicClient } from "../config/ethClients";
import { PublicClient } from "viem";

export class Game {
  constructor(infuraEndpoint: string) {
    console.log(
      "constructing game class- this message should only appear once"
    );

    this.publicClient = getPublicClient(infuraEndpoint);
  }

  insertGame = async (
    gameCreationTxHash: Hash,
    _salt: string,
    createdGameAddress: EthAddress
  ) => {
    try {
      const saltId = await salt.getSaltId(_salt);

      if (saltId === undefined) throw "salt not found";

      const joinerAddress = await this.getContractJoiner(createdGameAddress);

      console.log("joinerAddress:", joinerAddress);

      await drizzleDb.insert(rpslzGames).values({
        txHash: gameCreationTxHash,
        createdContractAddress: createdGameAddress,
        saltId,
        joinerAddress,
      });
    } catch (e) {
      console.error("insertGame:", e);
      throw e;
    }
  };

  private getContractJoiner = async (contractAddress: EthAddress) => {
    return await this.publicClient.readContract({
      address: contractAddress,
      abi: RPS_ARTIFACT.abi,
      functionName: "j2",
    });
  };

  publicClient: PublicClient;
}
