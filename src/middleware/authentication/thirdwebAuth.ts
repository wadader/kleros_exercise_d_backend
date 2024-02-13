import { ThirdwebAuth } from "@thirdweb-dev/auth/express";
import { PrivateKeyWallet } from "@thirdweb-dev/auth/evm";
import { env_Vars } from "../../config/init";
import { Login } from "./login";

const logins = new Login();

const { authRouter, authMiddleware, getUser } = ThirdwebAuth({
  domain: env_Vars.Auth.THIRDWEB_AUTH_DOMAIN,
  wallet: new PrivateKeyWallet(env_Vars.Auth.THIRDWEB_AUTH_PRIVATE_KEY),
  authOptions: {
    validateNonce: async (nonce: string) => {
      console.log("nonce:", nonce);

      const doesNonceExist = await logins.getDoesNonceExist(nonce);
      if (doesNonceExist) {
        throw new Error("Nonce has already been used!");
      }
      // Otherwise save nonce in database or storage for later validation
      logins.saveNonce(nonce);
    },
  },
});

export { authMiddleware, authRouter, getUser };
