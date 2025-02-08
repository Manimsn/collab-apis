import FileFolder from "../models/fileFolderModel.js";

export const isFileFolderExists = async (name, parentFolderId) => {
  return await FileFolder.findOne({ name, parentFolderId });
};

export const createFileFolders = async (dataArray) => {
  return await FileFolder.insertMany(dataArray);
};

export const updateFileFolder = async (id, data) => {
  return await FileFolder.findByIdAndUpdate(
    id,
    { ...data, updatedAt: new Date() },
    { new: true }
  );
};

export const getFileFolderById = async (id) => {
  return await FileFolder.findById(id);
};

export const deleteFileFolder = async (id) => {
  return await FileFolder.findByIdAndDelete(id);
};
