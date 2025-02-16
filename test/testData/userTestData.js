import { faker } from "@faker-js/faker";
import User from "../../models/User.js";

export const generateUser = (overrides = {}) => {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    passwordHash: faker.internet.password(12),
    designation: faker.person.jobTitle(),
    location: faker.location.city(),
    plan: faker.helpers.arrayElement(["FREE", "BASIC", "PREMIUM"]),
    planType: faker.helpers.arrayElement(["Monthly", "Yearly", null]),
    credits: faker.number.int({ min: 0, max: 100 }),
    totalCredits: faker.number.int({ min: 100, max: 500 }),
    balanceCredits: faker.number.int({ min: 0, max: 100 }),
    downloadedModels: [],
    refreshTokens: [],
    passwordHistory: [],
    ...overrides,
  };
};

export const createUser = async (overrides = {}) => {
  const userData = generateUser(overrides);
  return await User.create(userData);
};
