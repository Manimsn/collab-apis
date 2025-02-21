export const validUser = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  password: "Password123",
  plan: "BASIC",
  planType: "Monthly",
};

export const invalidEmailUser = {
  ...validUser,
  email: "invalid-email", // Invalid email format
};

export const weakPasswordUser = {
  ...validUser,
  password: "weak", // Weak password
};

export const invalidPlanUser = {
  ...validUser,
  plan: "INVALID_PLAN", // Invalid plan type
};

export const hashedPasswordUser = {
  ...validUser,
  passwordHash: "hashed-password", // Already hashed password case
};

export const duplicateEmailUser = {
  firstName: "Jane",
  lastName: "Smith",
  email: "john.doe@example.com", // Duplicate email
  password: "Password123",
  plan: "FREE",
};

// export const anotherValidUser = { ...validUser, planType: null };
export const anotherValidUser = (({ planType, ...rest }) => rest)(validUser);
