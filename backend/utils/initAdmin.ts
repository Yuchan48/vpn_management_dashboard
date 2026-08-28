import { getAllUsers, createRootAdmin } from "../services/user.service";

export async function ensureRootAdmin(): Promise<void> {
  try {
    const existingAdmin = await getAllUsers();
    if (!existingAdmin || existingAdmin.length === 0) {
      const ROOT_ADMIN_USERNAME = process.env.ROOT_ADMIN_USERNAME;
      const ROOT_ADMIN_PASSWORD = process.env.ROOT_ADMIN_PASSWORD;

      if (!ROOT_ADMIN_USERNAME || !ROOT_ADMIN_PASSWORD) {
        console.error(
          "Error: ROOT_ADMIN_USERNAME and ROOT_ADMIN_PASSWORD must be set in environment variables.",
        );
        return;
      }

      const createdAdmin = await createRootAdmin(
        ROOT_ADMIN_USERNAME,
        ROOT_ADMIN_PASSWORD,
      );

      if (!createdAdmin) {
        console.error("Error: Failed to create root admin user.");
        return;
      }

      // check if the id of the created admin is 1, if not log a warning
      if (createdAdmin.id !== 1) {
        console.warn(
          `Warning: Root admin user created with id ${createdAdmin.id} instead of 1. This may cause issues with the application. Please check the database and ensure the root admin user has id 1.`,
        );
      } else {
        console.log("Root admin user created with id 1.");
      }
    }
  } catch (err) {
    console.error("Error ensuring root admin user:", err);
  }
}
