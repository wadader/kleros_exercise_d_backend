import { EthAddress, Hash } from "../types/web3";
import { drizzleDb, encryptor, salt } from "../config/init";
import { rpslzGames } from "../database/drizzle/schema/schema";
import { RPS_ARTIFACT } from "../artifacts/RPS";
import { getPublicClient } from "../config/ethClients";
import { PublicClient } from "viem";
import { and, eq, isNull } from "drizzle-orm";

export class Game {
  constructor(infuraEndpoint: string) {
    console.log(
      "constructing game class- this message should only appear once"
    );

    this.publicClient = getPublicClient(infuraEndpoint);
  }

  insertGameAndGetCreatorIdentifier = async (
    gameCreationTxHash: Hash,
    _salt: string,
    createdGameAddress: EthAddress,
    creatorAddress: EthAddress
  ): Promise<string> => {
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

      const creatorIdentifier = this.generateIdentifier(
        createdGameAddress,
        creatorAddress
      );

      this.saveCreatorIdentifier(createdGameAddress, creatorIdentifier);

      return creatorIdentifier;
    } catch (e) {
      console.error("insertGame:", e);
      throw e;
    }
  };

  getGamesForJoinerAddress = async (joinerAddress: EthAddress) => {
    const gamesForJoinerAddress = await drizzleDb
      .select({ contractAddress: rpslzGames.createdContractAddress })
      .from(rpslzGames)
      .where(
        and(
          eq(rpslzGames.joinerAddress, joinerAddress),
          eq(rpslzGames.didCreatorTimeout, false),
          eq(rpslzGames.didJoinerTimeout, false),
          isNull(rpslzGames.winnerAddress)
        )
      );

    return gamesForJoinerAddress;
  };

  private getContractJoiner = async (contractAddress: EthAddress) => {
    return await this.publicClient.readContract({
      address: contractAddress,
      abi: RPS_ARTIFACT.abi,
      functionName: "j2",
    });
  };

  private saveCreatorIdentifier = (
    contractAddress: EthAddress,
    creatorIdentifier: string
  ) => {
    const gameIdentifier: GameIdentifiers = {
      creatorIdentifier,
      joinerIdentifier: undefined,
    };

    this.gameIdentifers.set(contractAddress, gameIdentifier);
  };

  private generateIdentifier = (
    contractAddress: EthAddress,
    playerAddress: EthAddress
  ): string => {
    const gameIdentifierString = `${contractAddress}_${playerAddress}`;
    return encryptor.encrypt(Buffer.from(gameIdentifierString));
  };

  publicClient: PublicClient;

  gameIdentifers = new Map<EthAddress, GameIdentifiers>();
}

interface GameIdentifiers {
  creatorIdentifier: string;
  joinerIdentifier: string | undefined;
}
