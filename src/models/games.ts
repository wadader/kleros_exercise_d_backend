import { EthAddress, EthHash, isEthAddress } from "../types/web3";
import { drizzleDb, encryptor, salt } from "../config/init";
import { rpslzGames } from "../database/drizzle/schema/schema";
import { RPS_ARTIFACT } from "../artifacts/RPS";
import { getPublicClient } from "../config/ethClients";
import { PublicClient } from "viem";
import { and, eq } from "drizzle-orm";

export class Game {
  constructor(infuraEndpoint: string) {
    console.log(
      "constructing game class- this message should only appear once"
    );

    this.publicClient = getPublicClient(infuraEndpoint);
  }

  insertGameAndGetCreatorIdentifier = async (
    gameCreationTxHash: EthHash,
    _salt: string,
    createdGameAddress: EthAddress,
    creatorAddress: EthAddress
  ): Promise<string> => {
    try {
      const saltId = await salt.getSaltId(_salt);

      if (saltId === undefined) throw "salt not found";

      const joinerAddress = await this.getContractJoiner(createdGameAddress);

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
          eq(rpslzGames.isGameOver, false)
        )
      );

    return gamesForJoinerAddress;
  };

  getJoinerAddressForGame = async (
    contractAddress: EthAddress
  ): Promise<null | EthAddress> => {
    const joinerAddressArr = await drizzleDb
      .select({ joinerAddress: rpslzGames.joinerAddress })
      .from(rpslzGames)
      .where(eq(rpslzGames.createdContractAddress, contractAddress));

    if (joinerAddressArr.length === 1) {
      if (isEthAddress(joinerAddressArr[0]?.joinerAddress))
        return joinerAddressArr[0].joinerAddress;
    }

    return null;
  };

  getContractLastAction = async (
    contractAddress: EthAddress
  ): Promise<number> => {
    const lastAction = await this.publicClient.readContract({
      address: contractAddress,
      abi: RPS_ARTIFACT.abi,
      functionName: "lastAction",
    });

    return Number(lastAction);
  };

  getContractCreator = async (contractAddress: EthAddress) => {
    return await this.publicClient.readContract({
      address: contractAddress,
      abi: RPS_ARTIFACT.abi,
      functionName: "j1",
    });
  };

  gameOver = async (contractAddress: EthAddress) => {
    await drizzleDb
      .update(rpslzGames)
      .set({ isGameOver: true })
      .where(eq(rpslzGames.createdContractAddress, contractAddress));
  };

  saveAndReturnJoinerIdentifier = (
    contractAddress: EthAddress,
    joinerAddress: EthAddress
  ): string => {
    const prevIdentifiers = this.gameIdentifers.get(contractAddress);
    if (!prevIdentifiers) throw "identifiers not created yet";

    const joinerIdentifier = this.generateIdentifier(
      contractAddress,
      joinerAddress
    );

    const newIdentifiers = { ...prevIdentifiers, joinerIdentifier };

    this.gameIdentifers.set(contractAddress, newIdentifiers);

    return joinerIdentifier;
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

  // this maps games (contract addresses), to the socket-identifiers of the players.
  // it's in memory here, but could easily be shifted to a database table in a prod environment
  gameIdentifers = new Map<EthAddress, GameIdentifiers>();
}

interface GameIdentifiers {
  creatorIdentifier: string;
  joinerIdentifier: string | undefined;
}
