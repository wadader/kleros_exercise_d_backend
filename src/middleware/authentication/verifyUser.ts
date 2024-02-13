import { NextFunction, Request, Response } from "express";
import { getUser } from "./thirdwebAuth";

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await getUser(req);

  if (!user) {
    return res.status(401).json({
      message: "Not signed in.",
    });
  }

  req.body.userAddress = user.address;

  next();
};
