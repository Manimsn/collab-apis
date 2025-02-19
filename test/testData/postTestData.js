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
    length: faker.number.int({ min: 1, max: fileCount }),
  }).map(() => ({
    name: faker.system.fileName(),
    fileType: faker.helpers.arrayElement(fileTypes),
    description: faker.lorem.sentence(),
  }));
};

export const generatePost = async (
  projectId,
  createdBy,
  taggedEmails,
  type,
  parentFolderId,
  newcategory,
  newfiles,
  hasDifferentParent,
  overrides
) => {
  // const category = faker.random.arrayElement(Object.values(categories));
  const category =
    newcategory !== null && newcategory !== undefined
      ? newcategory
      : faker.helpers.arrayElement(Object.values(categories));

  const files =
    newfiles && newfiles.length > 0
      ? newfiles
      : type === "FOLDER"
      ? []
      : generateFiles(category);

  return {
    type: type ? type : faker.helpers.arrayElement(["POST", "FOLDER"]),
    name: faker.lorem.words(3),
    description: faker.lorem.sentence(),
    isBlocker: faker.datatype.boolean(),
    isFeed: faker.datatype.boolean(),
    hasDifferentParent,
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
  projectId,
  createdBy,
  taggedEmails,
  type,
  parentFolderId = null,
  newcategory = null,
  newfiles = [],
  hasDifferentParent = null,
  overrides = {}
) => {
  const postData = await generatePost(
    projectId,
    createdBy,
    taggedEmails,
    type,
    parentFolderId,
    newcategory,
    newfiles,
    hasDifferentParent,
    overrides
  );
  return await PostFolder.create(postData);
};
