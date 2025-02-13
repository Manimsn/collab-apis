// seeds/seedDatabase.js
import { seedUsers } from "./seedUsers.js";
import { seedProjects } from "./seedProjects.js";
import { seedProjectLevelAccess } from "./seedProjectLevelAccess.js";
import { seedCategoryLevelAccess } from "./seedCategoryLevelAccess.js";
import { seedPostFolders } from "./seedPostFolders.js";
import { updateUserProjectMappingsForFiles } from "./updateUserProjectMappingsForFiles.js";

export const seedDatabase = async () => {
  await seedUsers();
  await seedProjects();
  await seedProjectLevelAccess();
  await seedCategoryLevelAccess();
  await seedPostFolders();
  await updateUserProjectMappingsForFiles();
};
