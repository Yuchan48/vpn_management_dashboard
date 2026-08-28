import {
  createUser as createUserService,
  createAdmin as createAdminService,
  getAllUsers as getAllUsersService,
  deleteUser as deleteUserService,
  changePassword as changePasswordService,
  getUserById as getUserByIdService,
} from "../services/user.service";
import { getClientsByUserId } from "../services/client.service";
import { removePeer } from "../services/wireguard.service";
import { validateUsername, validatePassword } from "../utils/inputValidators";
import { emitIoPerUser } from "../socketio";

import type { Request, Response, NextFunction } from "express";

type CredentialsBody = {
  username?: string;
  password?: string;
};

type ChangePasswordBody = {
  currentPassword?: string;
  newPassword?: string;
};

export async function getCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await getUserByIdService(req.user!.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

export async function createUser(
  req: Request<{}, {}, CredentialsBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }

    validateUsername(username);
    validatePassword(password);

    // check is the user is demo user by checking if the username starts with "demo_"
    const isDemo = username.startsWith("demo_") ? 1 : 0;

    const user = await createUserService(username, password, isDemo);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function createAdmin(
  req: Request<{}, {}, CredentialsBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }

    validateUsername(username);
    validatePassword(password);

    const admin = await createAdminService(username, password);
    res.status(201).json(admin);
  } catch (error) {
    next(error);
  }
}

export async function getAllUsers(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const users = await getAllUsersService();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const targetUserId = Number(req.params.id);
    if (!Number.isInteger(targetUserId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }
    const clients = await getClientsByUserId(targetUserId);

    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    await deleteUserService(req.user, targetUserId);

    if (clients.length > 0) {
      await Promise.all(clients.map((client) => removePeer(client.public_key))); // Remove all clients associated with the deleted user as peers from the WireGuard interface
    }

    // emit updated client list to connected clients via Socket.IO
    try {
      await emitIoPerUser();
    } catch (socketError) {
      console.error("Error emitting Socket.IO event:", socketError);
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

// Change own password. User must provide current password for verification, and new password.
export async function changePassword(
  req: Request<{}, {}, ChangePasswordBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // check if it is demo user, if so, reject the request with 403 status code.
    if (req.user.is_demo) {
      res
        .status(403)
        .json({ error: "Demo users are not allowed to change password" });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res
        .status(400)
        .json({ error: "Both current password and new password are required" });
      return;
    }

    validatePassword(newPassword);

    await changePasswordService(req.user, currentPassword, newPassword);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
}
