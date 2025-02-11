import { expect } from "chai";
import { updateNewPostSchema } from "../../validations/updatePostValidataion.js";

describe("Zod Validation - updateNewPostSchema", () => {
  describe("✅ Positive Test Cases", () => {
    it("should pass with valid ObjectId in existingFiles and deleteFileIds", () => {
      const input = {
        existingFiles: [{ _id: "60d21b4667d0d8992e610c85", name: "File1" }],
        deleteFileIds: ["60d21b4667d0d8992e610c85"],
      };
      expect(() => updateNewPostSchema.parse(input)).to.not.throw();
    });

    it("should pass with only description", () => {
      const input = { description: "This is a valid post description" };
      expect(() => updateNewPostSchema.parse(input)).to.not.throw();
    });

    it("should pass with only taggedUsers", () => {
      const input = { taggedUsers: ["user@example.com"] };
      expect(() => updateNewPostSchema.parse(input)).to.not.throw();
    });

    it("should pass with valid newUploadedFiles", () => {
      const input = {
        newUploadedFiles: [
          { name: "File1", description: "Desc1", fileType: "mp4" },
        ],
      };
      expect(() => updateNewPostSchema.parse(input)).to.not.throw();
    });

    it("should pass with only deleteFileIds", () => {
      const input = { deleteFileIds: ["60d21b4667d0d8992e610c85"] };
      expect(() => updateNewPostSchema.parse(input)).to.not.throw();
    });

    it("should pass with valid existingFiles (description only)", () => {
      const input = {
        existingFiles: [
          { _id: "60d21b4667d0d8992e610c85", description: "Valid description" },
        ],
      };
      expect(() => updateNewPostSchema.parse(input)).to.not.throw();
    });

    it("should pass with a mix of valid fields", () => {
      const input = {
        description: "Testing",
        newUploadedFiles: [{ name: "New File", fileType: "mp4" }],
        deleteFileIds: ["60d21b4667d0d8992e610c85"],
      };
      expect(() => updateNewPostSchema.parse(input)).to.not.throw();
    });
  });

  describe("❌ Negative Test Cases", () => {
    it("should fail with an empty object", () => {
      expect(() => updateNewPostSchema.parse({})).to.throw();
    });

    it("should fail with invalid ObjectId in deleteFileIds", () => {
      const input = { deleteFileIds: ["12345"] };
      expect(() => updateNewPostSchema.parse(input)).to.throw(
        "Invalid ObjectId format"
      );
    });

    it("should fail if existingFiles is missing _id", () => {
      const input = { existingFiles: [{ name: "File1" }] };
      expect(() => updateNewPostSchema.parse(input)).to.throw();
    });

    it("should fail with invalid _id format in existingFiles", () => {
      const input = { existingFiles: [{ _id: "invalid_id", name: "File1" }] };
      expect(() => updateNewPostSchema.parse(input)).to.throw(
        "Invalid ObjectId format"
      );
    });

    it("should fail if existingFiles has neither name nor description", () => {
      const input = { existingFiles: [{ _id: "60d21b4667d0d8992e610c85" }] };
      expect(() => updateNewPostSchema.parse(input)).to.throw();
    });

    it("should fail if deleteFileIds is empty", () => {
      const input = { deleteFileIds: [] };
      expect(() => updateNewPostSchema.parse(input)).to.throw();
    });

    it("should fail if newUploadedFiles is empty", () => {
      const input = { newUploadedFiles: [] };
      expect(() => updateNewPostSchema.parse(input)).to.throw();
    });

    it("should fail if taggedUsers contains invalid emails", () => {
      const input = { taggedUsers: ["invalid_email"] };
      expect(() => updateNewPostSchema.parse(input)).to.throw();
    });

    it("should fail if description is too short", () => {
      const input = { description: "Hi" };
      expect(() => updateNewPostSchema.parse(input)).to.throw();
    });

    // it("should fail if existingFiles contains duplicate _id values", () => {
    //   const input = {
    //     existingFiles: [
    //       { _id: "60d21b4667d0d8992e610c85", name: "File1" },
    //       { _id: "60d21b4667d0d8992e610c85", name: "File2" },
    //     ],
    //   };
    //   expect(() => updateNewPostSchema.parse(input)).to.throw();
    // });
  });
});
