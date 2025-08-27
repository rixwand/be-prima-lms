/* prettier-ignore-start */
import { mockRoleRepo } from "../mocks/roleRepo.mock";
import { mockSessionRepo } from "../mocks/sessionRepo.mock";
import { mockUserRepo } from "../mocks/userRepo.mock";
const getSessionRepoSpies = mockSessionRepo();
const getUserRepoSpies = mockUserRepo();
const getRoleRepoSpies = mockRoleRepo();
/* prettier-ignore-end */
import { RefreshSession } from "@prisma/client";
import supertest from "supertest";
import web from "../../src/app/web";
import { hashPassword } from "../../src/common/utils/hash";
import { newJti } from "../../src/common/utils/jwt";
import { IUserGetEntity } from "../../src/modules/users/user.types";

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

const userData = {
  username: "risu",
  fullName: "Arisu",
  email: "risu@mail.com",
};

const roleData = {
  id: 1,
  name: "member",
};

const getUser: Omit<IUserGetEntity, "passwordHash"> = {
  id: 2,
  email: "test@mail.com",
  fullName: "Test user",
  username: "test",
  profilePict: "user.jpg",
  roleId: 1,
  status: "NOT_VERIFIED",
};

describe("POST /api/auth/register", () => {
  it("should can register new user", async () => {
    const { create } = getUserRepoSpies();
    const { findByName } = getRoleRepoSpies();
    create.mockResolvedValue(userData);
    findByName.mockResolvedValue(roleData);
    const res = await supertest(web)
      .post("/api/auth/register")
      .send({
        ...userData,
        password: "test1234",
      });
    console.log(res.body);
    expect(findByName).toHaveBeenCalledWith("member");
    expect(create).toHaveBeenCalledWith(expect.objectContaining(userData));
    expect(res.status).toBe(200);
  });

  test("validation error", async () => {
    const { create } = getUserRepoSpies();
    const res = await supertest(web)
      .post("/api/auth/register")
      .send({
        ...userData,
        password: "testtest",
      });
    console.log("response body", res.body);
    expect(res.status).toBe(400);
    expect(create).not.toHaveBeenCalledWith(expect.objectContaining(userData));
  });
});

describe("POST /api/auth/login", () => {
  it("should can login existing user", async () => {
    const { findByEmail } = getUserRepoSpies();
    const { create } = getSessionRepoSpies();
    findByEmail.mockResolvedValue({
      ...getUser,
      passwordHash: await hashPassword("test4321"),
    } as IUserGetEntity);
    const res = await supertest(web).post("/api/auth/login").send({
      email: getUser.email,
      password: "test4321",
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("accessToken");
    expect(findByEmail).toHaveBeenCalledWith(getUser.email);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: expect.any(Number),
        jti: expect.any(String),
        expiresAt: expect.any(Date),
      })
    );
  });

  test("wrong credential", async () => {
    const { findByEmail } = getUserRepoSpies();
    const { create } = getSessionRepoSpies();
    findByEmail.mockResolvedValue({
      ...getUser,
      passwordHash: await hashPassword("test1234"),
    } as IUserGetEntity);
    const res = await supertest(web).post("/api/auth/login").send({
      email: getUser.email,
      password: "test4321",
    });
    console.log("login error: ", res.body);
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
    expect(findByEmail).toHaveBeenCalledWith(getUser.email);
    expect(create).not.toHaveBeenCalled();
  });
});

describe("POST /api/auth/refresh", () => {
  it("should can get a new access token", async () => {
    const jti = newJti();
    const { findByEmail } = getUserRepoSpies();
    const { get: getSession } = getSessionRepoSpies();
    getSession.mockResolvedValue({
      userId: 12,
      jti,
      revokedAt: null,
      replacedByJti: null,
      expiresAt: new Date(Date.now() + 10 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as RefreshSession);
    findByEmail.mockResolvedValue({
      ...getUser,
      passwordHash: await hashPassword("test1234"),
    } as IUserGetEntity);
    const login = await supertest(web).post("/api/auth/login").send({
      email: getUser.email,
      password: "test1234",
    });
    console.log("login status: ", login.status, " res body: ", login.body);
    const cookie = login.headers["set-cookie"];
    if (!cookie) throw new Error("cookie not found");
    const res = await supertest(web).post("/api/auth/refresh").set("Cookie", cookie);
    console.log(res.body);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("accessToken");
    const newCookie = res.headers["set-cookie"];
    if (!newCookie) throw new Error("new cookie not found");
    expect(newCookie).not.toBe(cookie);
  });
});
