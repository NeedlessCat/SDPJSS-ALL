import express from "express";
import upload from "../middlewares/multer.js";
// import {
//   addMember,
//   getEntry,
//   paymentRazorpay,
//   updateEntry,
//   verifyRazorpay,
// } from "../controllers/userController.js";
import {
  addAdvertisement,
  createDonationOrder,
  createJobOpening,
  createStaffRequirement,
  deleteAdvertisement,
  deleteDonation,
  deleteJobOpening,
  deleteStaffRequirement,
  editAdvertisement,
  editJobOpening,
  editStaffRequirement,
  getAllAdvertisementsWithUserNames,
  getAllDonations,
  getAllJobOpeningsWithUserNames,
  getAllStaffRequirementsWithUserNames,
  getDonationStats,
  getJobOpeningsByUser,
  getMyAdvertisements,
  getStaffRequirementsByUser,
  getUserDonations,
  getUserProfile,
  loginUser,
  retryDonationPayment,
  updateAdvertisementStatus,
  updateJobStatus,
  updateStaffStatus,
  updateUserProfile,
  verifyDonationPayment,
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";

const userRouter = express.Router();

// userRouter.post("/add-form", upload.none(), addForm);
// userRouter.get("/get-entry", upload.none(), getEntry);
// userRouter.post("/update-entry", upload.none(), updateEntry);
// userRouter.post("/payment-razorpay", upload.none(), paymentRazorpay);
// userRouter.post("/verifyRazorpay", upload.none(), verifyRazorpay);

userRouter.post("/login", loginUser);
userRouter.get("/get-profile", authUser, getUserProfile);
userRouter.post(
  "/update-profile",
  upload.single("image"),
  authUser,
  updateUserProfile
);

// ----JOB OPENING--------
userRouter.post("/add-job", upload.none(), authUser, createJobOpening);
userRouter.get("/my-jobs", authUser, getJobOpeningsByUser);
userRouter.get("/get-jobs", authUser, getAllJobOpeningsWithUserNames);
userRouter.post("/edit-job", upload.none(), authUser, editJobOpening);
//----------------
// router.delete('/delete-job/:jobId', authUser, deleteJobOpening);
// router.put('/update-job-status/:jobId', authUser, updateJobStatus);
//----------------
userRouter.delete("/delete-job", upload.none(), authUser, deleteJobOpening);
userRouter.put("/update-job-status", upload.none(), authUser, updateJobStatus);
// -----------------------

// -----STAFF REQUIREMENT-----
userRouter.post("/add-staff", upload.none(), authUser, createStaffRequirement);
userRouter.get("/my-staffs", authUser, getStaffRequirementsByUser);
userRouter.get("/get-staffs", authUser, getAllStaffRequirementsWithUserNames);
userRouter.post("/edit-staff", upload.none(), authUser, editStaffRequirement);
userRouter.delete(
  "/delete-staff",
  upload.none(),
  authUser,
  deleteStaffRequirement
);
userRouter.put(
  "/update-staff-status",
  upload.none(),
  authUser,
  updateStaffStatus
);

// ---------------------------

// -----ADVERTISEMENT-----
userRouter.post(
  "/add-advertisement",
  upload.none(),
  authUser,
  addAdvertisement
);
userRouter.get("/my-advertisements", authUser, getMyAdvertisements);
userRouter.get(
  "/get-advertisements",
  authUser,
  getAllAdvertisementsWithUserNames
);
userRouter.post(
  "/edit-advertisement",
  upload.none(),
  authUser,
  editAdvertisement
);
userRouter.delete(
  "/delete-advertisement",
  upload.none(),
  authUser,
  deleteAdvertisement
);
userRouter.put(
  "/update-advertisement-status",
  upload.none(),
  authUser,
  updateAdvertisementStatus
);

// ---------------------------

// -----DONATION ROUTES-----
// Create donation order (initiate payment)
// Donation Routes - Add these to your userRouter

// Create donation order (initiate payment)
userRouter.post(
  "/create-donation-order",
  upload.none(),
  authUser,
  createDonationOrder
);

// Verify payment and complete donation
userRouter.post(
  "/verify-donation-payment",
  upload.none(),
  authUser,
  verifyDonationPayment
);

// Get user's donations
userRouter.get("/my-donations", authUser, getUserDonations);

// Retry payment for failed/pending donations
userRouter.post(
  "/retry-donation-payment",
  upload.none(),
  authUser,
  retryDonationPayment
);

// Delete donation (only pending/failed) - Changed to DELETE method with param
userRouter.delete("/delete-donation/:donationId", authUser, deleteDonation);

// Admin routes (you might want to add admin auth middleware)
// Get all donations
userRouter.get("/get-all-donations", authUser, getAllDonations);

// Get donation statistics
userRouter.get("/donation-stats", authUser, getDonationStats);

export default userRouter;
