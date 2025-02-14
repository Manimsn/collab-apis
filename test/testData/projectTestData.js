import faker from "faker";
import Project from "../models/Project.js";
import { createUser } from "./userTestData.js";

export const generateProject = async (overrides = {}) => {
  const user = await createUser();
  return {
    name: faker.company.companyName(),
    description: faker.lorem.sentence(),
    location: faker.address.city(),
    createdBy: user._id,
    ownerEmail: user.email,
    ...overrides,
  };
};

export const createProject = async (overrides = {}) => {
  const projectData = await generateProject(overrides);
  return await Project.create(projectData);
};
