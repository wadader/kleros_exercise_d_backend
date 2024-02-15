import { NextFunction, Request, Response } from "express";

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session.siwe) {
    console.error("not auth verifyUser:", req.session);
    return res.status(401).json({
      message: "Not signed in.",
    });
  }

  req.body.userAddress = req.session.siwe.data.address;
  next();
};
