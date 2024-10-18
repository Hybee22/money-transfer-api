import { DataSource } from "typeorm";
import { User, UserRole } from "../entities/User";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { AppError } from "../utils/customErrors";
import logger from "../utils/logger";

dotenv.config();

export async function seedSuperAdmin(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);

  // Check if superadmin already exists
  const existingSuperAdmin = await userRepository.findOne({
    where: { role: UserRole.SUPER_ADMIN },
  });

  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!existingSuperAdmin) {
    if (!superAdminPassword) {
      throw new AppError(
        "SUPER_ADMIN_PASSWORD is not set in the environment variables",
        400
      );
    }
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

    const superAdmin = userRepository.create({
      username: "superadmin",
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      balance: 0, // Superadmins don't need a balance, but we'll set it to 0
    });

    await userRepository.save(superAdmin);
    logger.info("Superadmin user created successfully");
  } else {
    logger.info("Superadmin user already exists");
  }
}
