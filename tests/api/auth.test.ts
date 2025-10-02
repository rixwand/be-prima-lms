/* prettier-ignore-start */
import { mockAuthRepo } from "../mocks/authRepo.mock";
import { mockRoleRepo } from "../mocks/roleRepo.mock";
import { mockSessionRepo } from "../mocks/sessionRepo.mock";
import { mockUserRepo } from "../mocks/userRepo.mock";
const getSessionRepoSpies = mockSessionRepo();
const getUserRepoSpies = mockUserRepo();
const getRoleRepoSpies = mockRoleRepo();
const getAuthRepoSpies = mockAuthRepo();
/* prettier-ignore-end */

import { RefreshSession } from "@prisma/client";
import supertest from "supertest";
import web from "../../src/app/web";
import { hashPassword } from "../../src/common/utils/hash";
import { newJti } from "../../src/common/utils/jwt";
import type { IUserGetEntity } from "../../src/modules/users/user.types";

jest.mock("nodemailer");
jest.mock("ejs");

/* ----------------------------- Fixtures ----------------------------- */

const roleMember = { id: 1, name: "member" } as const;

const userData = {
  username: "risu",
  fullName: "Arisu",
  email: "risu@mail.com",
};

const baseUserNoHash: Omit<IUserGetEntity, "passwordHash"> = {
  id: 2,
  email: "test@mail.com",
  fullName: "Test user",
  username: "test",
  profilePict: "user.jpg",
  roleId: 1,
  status: "NOT_VERIFIED",
};

/* ----------------------- Builders / Small helpers ----------------------- */

// Build a full IUserGetEntity with a hashed password
async function fakeUserWithPassword(password: string): Promise<IUserGetEntity> {
  return {
    ...baseUserNoHash,
    passwordHash: await hashPassword(password),
  };
}

// Build a RefreshSession that expires in `msFromNow` milliseconds
function fakeRefreshSession(msFromNow: number, patch: Partial<RefreshSession> = {}): RefreshSession {
  const jti = newJti();
  const now = new Date();
  return {
    userId: 12,
    jti,
    revokedAt: null,
    replacedByJti: null,
    expiresAt: new Date(Date.now() + msFromNow),
    createdAt: now,
    updatedAt: now,
    ...patch,
  } as RefreshSession;
}

// Log in and return cookie and response (keeps tests DRY)
async function loginAs(email: string, password: string) {
  const res = await supertest(web).post("/api/auth/login").send({ email, password });
  const cookie = res.headers["set-cookie"];
  if (!cookie) throw new Error("cookie not found");
  return { res, cookie };
}

/* ---------------------------- Repo Spies ---------------------------- */

let authSpies: ReturnType<ReturnType<typeof mockAuthRepo>>;
let roleSpies: ReturnType<ReturnType<typeof mockRoleRepo>>;
let userSpies: ReturnType<ReturnType<typeof mockUserRepo>>;
let sessionSpies: ReturnType<ReturnType<typeof mockSessionRepo>>;

beforeEach(() => {
  // Fresh, isolated spies every test
  authSpies = getAuthRepoSpies();
  roleSpies = getRoleRepoSpies();
  userSpies = getUserRepoSpies();
  sessionSpies = getSessionRepoSpies();
});

/* ------------------------------- Tests ------------------------------- */

describe("POST /api/auth/register", () => {
  it("registers a new user", async () => {
    authSpies.createActivationToken.mockResolvedValue({ id: 1 });
    userSpies.create.mockResolvedValue(userData);
    roleSpies.findByName.mockResolvedValue(roleMember);

    const res = await supertest(web)
      .post("/api/auth/register")
      .send({
        ...userData,
        password: "test1234",
      });
    console.log(res.body);

    expect(res.status).toBe(200);
    expect(roleSpies.findByName).toHaveBeenCalledWith("member");
    expect(userSpies.create).toHaveBeenCalledWith(expect.objectContaining(userData));
  });

  it("returns 400 on validation error", async () => {
    const res = await supertest(web)
      .post("/api/auth/register")
      .send({
        ...userData,
        password: "testtest", // intentionally invalid
      });

    expect(res.status).toBe(400);
    expect(userSpies.create).not.toHaveBeenCalled();
  });
});

describe("POST /api/auth/login", () => {
  it("logs in an existing user", async () => {
    userSpies.findByEmail.mockResolvedValue(await fakeUserWithPassword("test4321"));
    sessionSpies.create.mockResolvedValue(Promise.resolve());

    const res = await supertest(web).post("/api/auth/login").send({
      email: baseUserNoHash.email,
      password: "test4321",
    });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("accessToken");
    expect(userSpies.findByEmail).toHaveBeenCalledWith(baseUserNoHash.email);
    expect(sessionSpies.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: expect.any(Number),
        jti: expect.any(String),
        expiresAt: expect.any(Date),
      })
    );
  });

  it("rejects wrong credential", async () => {
    userSpies.findByEmail.mockResolvedValue(await fakeUserWithPassword("test1234"));

    const res = await supertest(web).post("/api/auth/login").send({
      email: baseUserNoHash.email,
      password: "test4321",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
    expect(userSpies.findByEmail).toHaveBeenCalledWith(baseUserNoHash.email);
    expect(sessionSpies.create).not.toHaveBeenCalled();
  });
});

describe("POST /api/auth/refresh", () => {
  it("issues a new access token", async () => {
    sessionSpies.get.mockResolvedValue(fakeRefreshSession(10_000));
    userSpies.findByEmail.mockResolvedValue(await fakeUserWithPassword("test1234"));

    const { cookie } = await loginAs(baseUserNoHash.email, "test1234");
    const res = await supertest(web).post("/api/auth/refresh").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("accessToken");

    const newCookie = res.headers["set-cookie"];
    expect(newCookie).toBeDefined();
    expect(newCookie).not.toBe(cookie);
  });
});
