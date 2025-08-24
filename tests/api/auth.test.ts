import { mockUserRepo } from "../mocks/userRepo.mock";
import { mockSessionRepo } from "../mocks/sessionRepo.mock";
const getSessionRepoSpies = mockSessionRepo();
const getUserRepoSpies = mockUserRepo();
import supertest from "supertest";
import web from "../../src/app/web";
import { IUserGetEntity } from "../../src/modules/users/user.types";
import { hashPassword } from "../../src/common/utils/hash";
// import { UserRepo } from "../../src/modules/users/user.repository";

// const createMock = jest
//   .spyOn(UserRepo, "create")
//   .mockImplementation(async (entity: IUserCreateEntity) => ({
//     username: "risu",
//     fullName: "Arisu",
//     email: "risu@mail.com",
//   }));

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

const userData = {
  username: "risu",
  fullName: "Arisu",
  email: "risu@mail.com",
};

const getUser: Omit<IUserGetEntity, "passwordHash"> = {
  id: 2,
  email: "test@mail.com",
  fullName: "Test user",
  username: "test",
  profilePict: "user.jpg",
  status: "NOT_VERIFIED",
};

describe("POST /api/auth/register", () => {
  it("should can register new user", async () => {
    const { create } = getUserRepoSpies();
    create.mockResolvedValue(userData);
    const res = await supertest(web)
      .post("/api/auth/register")
      .send({
        ...userData,
        password: "test1234",
      });
    console.log(res.body);
    expect(res.status).toBe(200);

    expect(create).toHaveBeenCalledWith(expect.objectContaining(userData));
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
});
