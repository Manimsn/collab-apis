import { faker } from "@faker-js/faker";
import Project from "../../models/Project.js";

export const generateProject = async (
  createdBy,
  ownerEmail,
  overrides = {}
) => {
  return {
    name: faker.company.name(),
    description: faker.lorem.sentence(),
    location: faker.location.city(),
    createdBy,
    ownerEmail,
    ...overrides,
  };
};

export const createProject = async (createdBy, ownerEmail, overrides = {}) => {
  const projectData = await generateProject(createdBy, ownerEmail, overrides);
  return await Project.create(projectData);
};
