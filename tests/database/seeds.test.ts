import { DataSource } from "typeorm";
import { User, UserRole } from "../../src/entities/User";
import bcrypt from "bcrypt";
import { AppError } from "../../src/utils/customErrors";
import logger from "../../src/utils/logger";
import { seedSuperAdmin } from "../../src/database/seed";

jest.mock("bcrypt");
jest.mock("dotenv", () => ({
  config: jest.fn(),
}));
jest.mock("../../src/utils/logger");

const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockDataSource = {
  getRepository: jest.fn().mockReturnValue(mockUserRepository),
} as unknown as DataSource;

describe("seedSuperAdmin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a superadmin if one does not exist", async () => {
    // Mock no existing superadmin and a valid password
    mockUserRepository.findOne.mockResolvedValue(null);
    process.env.SUPER_ADMIN_PASSWORD = "supersecret";
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");

    const mockSuperAdmin = {
      username: "superadmin",
      password: "hashedPassword",
      role: UserRole.SUPER_ADMIN,
      balance: 0,
    };
    mockUserRepository.create.mockReturnValue(mockSuperAdmin);

    // Call the function
    await seedSuperAdmin(mockDataSource);

    // Expectations
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { role: UserRole.SUPER_ADMIN },
    });
    expect(bcrypt.hash).toHaveBeenCalledWith("supersecret", 10);
    expect(mockUserRepository.create).toHaveBeenCalledWith(mockSuperAdmin);
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockSuperAdmin);
    expect(logger.info).toHaveBeenCalledWith("Superadmin user created successfully");
  });

  it("should not create a superadmin if one already exists", async () => {
    const existingSuperAdmin = { id: 1, username: "superadmin" };
    mockUserRepository.findOne.mockResolvedValue(existingSuperAdmin);

    await seedSuperAdmin(mockDataSource);

    // Expect no further actions if the superadmin exists
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { role: UserRole.SUPER_ADMIN },
    });
    expect(mockUserRepository.create).not.toHaveBeenCalled();
    expect(mockUserRepository.save).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith("Superadmin user already exists");
  });

  it("should throw an error if SUPER_ADMIN_PASSWORD is not set", async () => {
    mockUserRepository.findOne.mockResolvedValue(null);
    process.env.SUPER_ADMIN_PASSWORD = "";

    await expect(seedSuperAdmin(mockDataSource)).rejects.toThrow(
      new AppError("SUPER_ADMIN_PASSWORD is not set in the environment variables", 400)
    );

    // Ensure no superadmin is created if password is missing
    expect(mockUserRepository.create).not.toHaveBeenCalled();
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });
});
