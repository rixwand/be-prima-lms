import { comparePassword, hashPassword } from "../../common/utils/hash";
import { ApiError } from "../../common/utils/http";
import { userRepo } from "./user.repository";
import { IPasswordUpdate, IUserUpdate } from "./user.types";

const selectUserData = {
  id: true,
  fullName: true,
  username: true,
  email: true,
  profilePict: true,
  roles: { select: { name: true } },
};

export const userService = {
  async get(id: number) {
    return userRepo.findById(id, {
      select: selectUserData,
    });
  },

  async update(id: number, data: IUserUpdate) {
    return userRepo.updateById(id, data, selectUserData);
  },

  async updatePassword(id: number, data: IPasswordUpdate) {
    const user = await userRepo.findById(id, { select: { passwordHash: true } });
    const passwordMatch = await comparePassword(data.oldPassword, user!.passwordHash);
    if (!passwordMatch) throw new ApiError(400, "Invalid old password");
    const newPasswordHash = await hashPassword(data.newPassword);
    await userRepo.updatePassword(id, newPasswordHash);
  },

  async list(page: number = 1, limit: number = 10) {
    const [users, total] = await Promise.all([userRepo.list(page, limit), userRepo.count()]);
    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit),
      },
    };
  },
};
