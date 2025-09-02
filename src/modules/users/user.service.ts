import { userRepo } from "./user.repository";

export const userService = {
  async get(id: number) {
    return await userRepo.findById(id, {
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        profilePict: true,
        roles: { select: { name: true } },
      },
    });
  },
};
