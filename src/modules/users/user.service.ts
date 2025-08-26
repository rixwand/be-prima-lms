import { flattenObject } from "../../common/utils/function";
import { userRepo } from "./user.repository";

export const userService = {
  async get(id: number) {
    const user = await userRepo.findById(id, {
      username: true,
      email: true,
      fullName: true,
      profilePict: true,
      roles: { select: { role: { select: { name: true } } } },
    });
    return flattenObject(user);
  },
};
