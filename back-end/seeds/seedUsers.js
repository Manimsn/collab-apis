// seeds/seedUsers.js

import mongoose from "mongoose";
import User from "../models/User.js";
import { faker } from "@faker-js/faker";

const plans = ["FREE", "BASIC", "PREMIUM"];
const locations = [
  "New York",
  "Paris",
  "Tokyo",
  "Dubai",
  "London",
  "Los Angeles",
  "Berlin",
  "Toronto",
  "Sydney",
  "Singapore",
];

export const seedUsers = async () => {
  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) return console.log("Users already seeded.");

  const users = Array.from({ length: 50 }).map(() => {
    const plan = plans[Math.floor(Math.random() * plans.length)];
    return {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      passwordHash: faker.internet.password(),
      location: locations[Math.floor(Math.random() * locations.length)],
      plan,
      credits: plan === "FREE" ? 0 : plan === "BASIC" ? 10 : 20,
      totalCredits: plan === "FREE" ? 0 : plan === "BASIC" ? 10 : 20,
      balanceCredits: plan === "FREE" ? 0 : plan === "BASIC" ? 10 : 20,
    };
  });

  await User.insertMany(users);
  console.log("Users seeded successfully.");
};
