import express from "express";
import upload from "../middlewares/multer.js";

import {
  registerFamily,
  loginFamily,
  getProfile,
  updateProfile,
  addMember,
  completeProfile,
  editProfile,
  deleteProfile,
} from "../controllers/FamilyController.js";
import authFamily from "../middlewares/authFamily.js";

const familyRouter = express.Router();

familyRouter.post("/register", registerFamily);
familyRouter.post("/login", loginFamily);
familyRouter.get("/get-profile", authFamily, getProfile);
familyRouter.post("/update-profile", upload.none(), authFamily, updateProfile);
familyRouter.post("/add-member", upload.none(), authFamily, addMember);
familyRouter.post(
  "/complete-profile",
  upload.none(),
  authFamily,
  completeProfile
);
familyRouter.post("/edit-profile", upload.none(), authFamily, editProfile);
familyRouter.delete("/delete-member", upload.none(), authFamily, deleteProfile);

export default familyRouter;
