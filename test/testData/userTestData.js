import faker from "faker";
import User from "../../models/User.js";

export const generateUser = (overrides = {}) => {
  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    passwordHash: faker.internet.password(12),
    designation: faker.name.jobTitle(),
    location: faker.address.city(),
    plan: faker.random.arrayElement(["FREE", "BASIC", "PREMIUM"]),
    planType: faker.random.arrayElement(["Monthly", "Yearly", null]),
    credits: faker.datatype.number({ min: 0, max: 100 }),
    totalCredits: faker.datatype.number({ min: 100, max: 500 }),
    balanceCredits: faker.datatype.number({ min: 0, max: 100 }),
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
