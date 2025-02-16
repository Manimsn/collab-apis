import { faker } from "@faker-js/faker";
import { categories, categoryFileTypes } from "../../config/constants.js";
import PostFolder from "../../models/postFolderModel.js";

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
  const category = faker.random.arrayElement(Object.values(categories));
  const files = generateFiles(category);

  return {
    type: faker.random.arrayElement(["POST", "FOLDER"]),
    name: faker.lorem.words(3),
    description: faker.lorem.sentence(),
    isBlocker: faker.datatype.boolean(),
    isFeed: faker.datatype.boolean(),
    projectId,
    createdBy,
    category,
    parentFolderId,
    taggedEmails,
    files,
    ...overrides,
  };
};

export const createPost = async (
  overrides = {},
  projectId,
  parentFolderId = null,
  createdBy,
  taggedEmails
) => {
  const postData = await generatePost(
    overrides,
    projectId,
    parentFolderId,
    createdBy,
    taggedEmails
  );
  return await PostFolder.create(postData);
};
