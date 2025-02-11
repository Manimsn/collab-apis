import { expect } from "chai";
import { z } from "zod";
import { updateStatusSchema } from "../../controllers/posts/updatePostStatus.js";

describe("Zod Validation - updateStatusSchema", () => {
  describe("✅ Positive Test Cases", () => {
    it("should pass when only isBlocker is provided with a boolean value", () => {
      const input = { isBlocker: true };
      expect(() => updateStatusSchema.parse(input)).to.not.throw();
    });

    it("should pass when only isFeed is provided with a boolean value", () => {
      const input = { isFeed: false };
      expect(() => updateStatusSchema.parse(input)).to.not.throw();
    });
  });

  describe("❌ Negative Test Cases", () => {
    it("should fail if both isBlocker and isFeed are provided", () => {
      const input = { isBlocker: true, isFeed: false };
      expect(() => updateStatusSchema.parse(input)).to.throw(
        "Only one field (isBlocker or isFeed) should be provided."
      );
    });

    it("should fail if neither isBlocker nor isFeed is provided", () => {
      const input = {};
      expect(() => updateStatusSchema.parse(input)).to.throw();
    });

    it("should fail if isBlocker is not a boolean", () => {
      const input = { isBlocker: "true" };
      expect(() => updateStatusSchema.parse(input)).to.throw();
    });

    it("should fail if isFeed is not a boolean", () => {
      const input = { isFeed: "false" };
      expect(() => updateStatusSchema.parse(input)).to.throw();
    });
  });
});
