import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { seedSuperAdmin } from "../database/seed";

dotenv.config();

/**
 * AppDataSource is the main database connection configuration for the application.
 * It uses TypeORM to connect to a PostgreSQL database.
 */
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? "5432", 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ["src/entities/**/*.ts"],
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV !== "production",
});

/**
 * Initializes the database connection and seeds the super admin user.
 * @throws {Error} If there's an error during database initialization.
 */
export const connectDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Data Source has been initialized!");
    await seedSuperAdmin(AppDataSource);
  } catch (error) {
    console.error("Error during Data Source initialization:", error);
    throw error;
  }
};
