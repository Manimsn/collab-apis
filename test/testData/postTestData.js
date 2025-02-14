import faker from "faker";
import PostFolder from "../models/PostFolder.js";
import { createUser } from "./userTestData.js";
import { createProject } from "./projectTestData.js";
import { categories, categoryFileTypes } from "../../config/constants.js";

/**
 * Get random file types based on category
 */
const getFileTypesForCategory = (category) => {
  const categoryMapping = categoryFileTypes.find(
    (item) => item.categoryName === category
  );
  return categoryMapping ? categoryMapping.fileTypes.flat() : []; // Flatten array in case of multiple file types
};

/**
 * Generate file objects for posts
 */
const generateFiles = (category, fileCount = 5) => {
  const fileTypes = getFileTypesForCategory(category);
  if (!fileTypes.length) return []; // No files allowed for this category

  return Array.from({
    length: faker.datatype.number({ min: 1, max: fileCount }),
  }).map(() => ({
    name: faker.system.fileName(),
    fileType: faker.random.arrayElement(fileTypes),
    description: faker.lorem.sentence(),
  }));
};

export const generatePost = async (overrides = {}) => {
  const user = await createUser();
  const project = await createProject();
  const category = faker.random.arrayElement(Object.values(categories));
  const files = generateFiles(category);

  return {
    type: faker.random.arrayElement(["POST", "FOLDER"]),
    name: faker.lorem.words(3),
    description: faker.lorem.sentence(),
    isBlocker: faker.datatype.boolean(),
    isFeed: faker.datatype.boolean(),
    projectId: project._id,
    createdBy: user._id,
    category,
    parentFolderId: null,
    taggedEmails: [user.email],
    files,
    ...overrides,
  };
};

export const createPost = async (overrides = {}) => {
  const postData = await generatePost(overrides);
  return await PostFolder.create(postData);
};
