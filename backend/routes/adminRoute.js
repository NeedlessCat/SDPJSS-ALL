import express from "express";
import upload from "../middlewares/multer.js";
import {
  addNotice,
  deleteNotice,
  getAdvertisementList,
  getAvailableYears,
  getDonationList,
  getDonationsByYear,
  getFamilyCount,
  getFamilyList,
  getJobOpeningList,
  getNoticeList,
  getStaffRequirementList,
  getTotalDonation,
  getUserCount,
  getUserList,
  loginAdmin,
  updateNotice,
  updateUserStatus,
} from "../controllers/adminController.js";
import authAdmin from "../middlewares/authAdmin.js";
import {
  addTeamMember,
  deleteTeamMember,
  getAllTeamMembersForAdmin,
  toggleTeamMemberStatus,
  updateTeamMember,
} from "../controllers/teamController.js";

const adminRouter = express.Router();

adminRouter.post("/login", loginAdmin);

adminRouter.get("/family-count", authAdmin, getFamilyCount);
adminRouter.get("/user-count", authAdmin, getUserCount);
adminRouter.get("/donation-by-year", authAdmin, getDonationsByYear);
adminRouter.get("/available-years", authAdmin, getAvailableYears);

adminRouter.get("/family-list", authAdmin, getFamilyList);
adminRouter.get("/user-list", authAdmin, getUserList);
adminRouter.get("/staff-requirement", authAdmin, getStaffRequirementList);
adminRouter.get("/job-opening", authAdmin, getJobOpeningList);
adminRouter.get("/advertisement", authAdmin, getAdvertisementList);

adminRouter.put("/update-user-status", authAdmin, updateUserStatus);

adminRouter.get("/notice-list", authAdmin, getNoticeList);
adminRouter.post("/add-notice", authAdmin, addNotice);
adminRouter.put("/update-notice/:id", authAdmin, updateNotice);
adminRouter.delete("/delete-notice/:id", authAdmin, deleteNotice);

adminRouter.get("/donation-list", authAdmin, getDonationList);
adminRouter.get("/total-donation", authAdmin, getTotalDonation);

adminRouter.get("/all-team-members", authAdmin, getAllTeamMembersForAdmin);
adminRouter.post(
  "/add-team-member",
  authAdmin,
  upload.single("image"),
  addTeamMember
);
adminRouter.put(
  "/update-team-member/:id",
  authAdmin,
  upload.single("image"),
  updateTeamMember
);
adminRouter.delete("/delete-team-member/:id", authAdmin, deleteTeamMember);
adminRouter.put("/team-members/status", authAdmin, toggleTeamMemberStatus);

export default adminRouter;
