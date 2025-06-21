import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import userModel from "../models/userModel.js";
import jobOpeningModel from "../models/JobOpeningModel.js";
import staffRequirementModel from "../models/StaffRequirementModel.js";

import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import advertisementModel from "../models/AdvertisementModel.js";

import razorpay from "razorpay";

//API for user login
const loginUser = async (req, res) => {
  try {
    // console.log("Request Body User: ", req.body);
    const { username, password } = req.body;
    const user = await userModel.findOne({ username });

    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const utoken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, utoken });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user profile data
const getUserProfile = async (req, res) => {
  try {
    // User will send userId or get it from token
    const { userId } = req.body;

    if (!userId) {
      return res.json({ success: false, message: "User ID is required" });
    }

    const userData = await userModel.findById(userId).select("-password");

    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update user profile
const updateUserProfile = async (req, res) => {
  try {
    console.log(req.body);
    const {
      userId,
      fullname,
      fatherid,
      mother,
      gender,
      dob,
      bloodgroup,
      username,
      marriage,
      contact,
      address,
      profession,
      education,
      healthissue,
      islive,
    } = req.body;

    const imageFile = req.file;

    if (
      !fullname ||
      !fatherid ||
      !mother ||
      !gender ||
      !dob ||
      !bloodgroup ||
      !username ||
      !marriage ||
      !contact ||
      !address ||
      !profession ||
      !education ||
      !healthissue ||
      !islive
    ) {
      return res.json({ success: false, message: "User Update Data Missing" });
    }

    await userModel.findByIdAndUpdate(userId, {
      fullname,
      fatherid,
      mother,
      gender,
      dob,
      bloodgroup,
      username,
      marriage: JSON.parse(marriage),
      contact: JSON.parse(contact),
      address: JSON.parse(address),
      profession: JSON.parse(profession),
      education: JSON.parse(education),
      healthissue,
      islive,
    });

    if (imageFile) {
      // upload to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageURL = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, { image: imageURL });
    }
    res.json({ success: true, message: "User Profile Updated Successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to create a job opening
const createJobOpening = async (req, res) => {
  try {
    console.log("Requested data: ", req.body);
    const {
      userId,
      title,
      category,
      description,
      location,
      salary,
      jobType,
      availabilityDate,
      requirements,
      contact,
    } = req.body;

    console.log({
      userId,
      title,
      category,
      description,
      location,
      salary,
      jobType,
      availabilityDate,
      requirements,
      contact,
    });

    // Check for required fields
    if (!userId || !title || !description || !location || !contact) {
      return res.json({
        success: false,
        message: "Missing required job fields",
      });
    }

    const parsedContact =
      typeof contact === "string" ? JSON.parse(contact) : contact;
    const parsedRequirements =
      typeof requirements === "string"
        ? JSON.parse(requirements)
        : requirements;

    //Validating mobile number
    if (
      !parsedContact.code ||
      !parsedContact.number ||
      !/^\d{10}$/.test(parsedContact.number)
    ) {
      return res.json({
        success: false,
        message: "Enter a valid mobile number",
      });
    }

    // validate email format
    if (!validator.isEmail(parsedContact.email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    const jobOpening = await jobOpeningModel.create({
      userId,
      title,
      category,
      description,
      location,
      salary,
      jobType,
      availabilityDate,
      requirements: parsedRequirements,
      contact: parsedContact,
    });

    res.json({
      success: true,
      message: "Job opening created successfully",
      jobOpening,
    });
  } catch (error) {
    console.log("Error in createJobOpening:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get the job Openings generated by a User
const getJobOpeningsByUser = async (req, res) => {
  try {
    const { userId } = req.body; // Assuming user is authenticated and ID is in `req.user`

    const jobOpenings = await jobOpeningModel.find({ userId });

    res.status(200).json({ success: true, jobOpenings });
  } catch (error) {
    console.error("Error fetching user's job openings:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// API to get all the job openings open to people
const getAllJobOpeningsWithUserNames = async (req, res) => {
  try {
    const jobOpenings = await jobOpeningModel.find().populate({
      path: "userId",
      select: "fullname", // Only fetch the fullname of the user
    });

    const formatted = jobOpenings.map((job) => ({
      _id: job._id,
      title: job.title,
      category: job.category,
      description: job.description,
      location: job.location,
      salary: job.salary,
      jobType: job.jobType,
      availabilityDate: job.availabilityDate,
      requirements: job.requirements,
      isOpen: job.isOpen,
      contact: job.contact,
      postedDate: job.postedDate,
      userFullname: job.userId?.fullname || "Unknown",
    }));

    res.status(200).json({ success: true, jobOpenings: formatted });
  } catch (error) {
    console.error("Error fetching all job openings:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// API to edit/update a job opening
const editJobOpening = async (req, res) => {
  try {
    const {
      jobId,
      title,
      category,
      description,
      location,
      salary,
      jobType,
      availabilityDate,
      requirements,
      contact,
    } = req.body;

    console.log("Edit Req: ", req.body);
    console.log("Edit Data: ", {
      jobId,
      title,
      category,
      description,
      location,
      salary,
      jobType,
      availabilityDate,
      requirements,
      contact,
    });
    // Check for required fields
    if (!jobId || !title || !description || !location || !contact) {
      return res.json({
        success: false,
        message: "Missing required job fields",
      });
    }

    const parsedContact =
      typeof contact === "string" ? JSON.parse(contact) : contact;
    const parsedRequirements =
      typeof requirements === "string"
        ? JSON.parse(requirements)
        : requirements;

    // Validating mobile number
    if (
      !parsedContact.code ||
      !parsedContact.number ||
      !/^\d{10}$/.test(parsedContact.number)
    ) {
      return res.json({
        success: false,
        message: "Enter a valid mobile number",
      });
    }

    // validate email format
    if (!validator.isEmail(parsedContact.email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    const updatedJob = await jobOpeningModel.findByIdAndUpdate(
      jobId,
      {
        title,
        category,
        description,
        location,
        salary,
        jobType,
        availabilityDate,
        requirements: parsedRequirements,
        contact: parsedContact,
      },
      { new: true }
    );

    if (!updatedJob) {
      return res.json({
        success: false,
        message: "Job opening not found",
      });
    }

    res.json({
      success: true,
      message: "Job opening updated successfully",
      jobOpening: updatedJob,
    });
  } catch (error) {
    console.log("Error in editJobOpening:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to delete a job opening
const deleteJobOpening = async (req, res) => {
  try {
    // const { jobId } = req.params;
    console.log("Delete req: ", req.body);
    const { jobId } = req.body;

    if (!jobId) {
      return res.json({
        success: false,
        message: "Job ID is required",
      });
    }

    const deletedJob = await jobOpeningModel.findByIdAndDelete(jobId);

    if (!deletedJob) {
      return res.json({
        success: false,
        message: "Job opening not found",
      });
    }

    res.json({
      success: true,
      message: "Job opening deleted successfully",
    });
  } catch (error) {
    console.log("Error in deleteJobOpening:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to update job opening status (open/close)
const updateJobStatus = async (req, res) => {
  try {
    // const { jobId } = req.params;
    const { jobId, isOpen } = req.body;
    console.log(req.body);
    console.log({ jobId, isOpen });

    if (!jobId) {
      return res.json({
        success: false,
        message: "Job ID is missing",
      });
    }

    var isOpened = isOpen;
    if (typeof isOpen !== "boolean") {
      if (isOpen === "true") isOpened = true;
      else if (isOpen === "false") isOpened = false;
      else {
        return res.json({
          success: false,
          message: "isOpen must be boolean or true/false.",
        });
      }
    }

    const updatedJob = await jobOpeningModel.findByIdAndUpdate(
      jobId,
      { isOpen: isOpened },
      { new: true }
    );

    if (!updatedJob) {
      return res.json({
        success: false,
        message: "Job opening not found",
      });
    }

    res.json({
      success: true,
      message: `Job opening ${isOpened ? "opened" : "closed"} successfully`,
      jobOpening: updatedJob,
    });
  } catch (error) {
    console.log("Error in updateJobStatus:", error);
    res.json({ success: false, message: error.message });
  }
};

// -------STAFF REQUIREMENTS-------------
// API to create a staff requirement
const createStaffRequirement = async (req, res) => {
  try {
    console.log("Requested data: ", req.body);
    const {
      userId,
      title,
      category,
      description,
      location,
      salary,
      staffType,
      availabilityDate,
      requirements,
      contact,
    } = req.body;

    console.log({
      userId,
      title,
      category,
      description,
      location,
      salary,
      staffType,
      availabilityDate,
      requirements,
      contact,
    });

    // Check for required fields
    if (!userId || !title || !description || !location || !contact) {
      return res.json({
        success: false,
        message: "Missing required staff fields",
      });
    }

    const parsedContact =
      typeof contact === "string" ? JSON.parse(contact) : contact;
    const parsedRequirements =
      typeof requirements === "string"
        ? JSON.parse(requirements)
        : requirements;

    //Validating mobile number
    if (
      !parsedContact.code ||
      !parsedContact.number ||
      !/^\d{10}$/.test(parsedContact.number)
    ) {
      return res.json({
        success: false,
        message: "Enter a valid mobile number",
      });
    }

    // validate email format
    if (!validator.isEmail(parsedContact.email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    const staffRequirement = await staffRequirementModel.create({
      userId,
      title,
      category,
      description,
      location,
      salary,
      staffType,
      availabilityDate,
      requirements: parsedRequirements,
      contact: parsedContact,
    });

    res.json({
      success: true,
      message: "Staff requirement created successfully",
      staffRequirement,
    });
  } catch (error) {
    console.log("Error in createStaffRequirement:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get the staff Requirements generated by a User
const getStaffRequirementsByUser = async (req, res) => {
  try {
    const { userId } = req.body; // Assuming user is authenticated and ID is in `req.user`

    const staffRequirements = await staffRequirementModel.find({ userId });

    res.status(200).json({ success: true, staffRequirements });
  } catch (error) {
    console.error("Error fetching user's staff requirements:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// API to get all the staff Requirements open to people
const getAllStaffRequirementsWithUserNames = async (req, res) => {
  try {
    const staffRequirements = await staffRequirementModel.find().populate({
      path: "userId",
      select: "fullname", // Only fetch the fullname of the user
    });

    const formatted = staffRequirements.map((staff) => ({
      _id: staff._id,
      title: staff.title,
      category: staff.category,
      description: staff.description,
      location: staff.location,
      salary: staff.salary,
      staffType: staff.staffType,
      availabilityDate: staff.availabilityDate,
      requirements: staff.requirements,
      isOpen: staff.isOpen,
      contact: staff.contact,
      postedDate: staff.postedDate,
      userFullname: staff.userId?.fullname || "Unknown",
    }));

    res.status(200).json({ success: true, staffRequirements: formatted });
  } catch (error) {
    console.error("Error fetching all staff requirements:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// API to edit/update a staff requirement
const editStaffRequirement = async (req, res) => {
  try {
    const {
      staffId,
      title,
      category,
      description,
      location,
      salary,
      staffType,
      availabilityDate,
      requirements,
      contact,
    } = req.body;

    console.log("Edit Req: ", req.body);
    console.log("Edit Data: ", {
      staffId,
      title,
      category,
      description,
      location,
      salary,
      staffType,
      availabilityDate,
      requirements,
      contact,
    });
    // Check for required fields
    if (!staffId || !title || !description || !location || !contact) {
      return res.json({
        success: false,
        message: "Missing required staff fields",
      });
    }

    const parsedContact =
      typeof contact === "string" ? JSON.parse(contact) : contact;
    const parsedRequirements =
      typeof requirements === "string"
        ? JSON.parse(requirements)
        : requirements;

    // Validating mobile number
    if (
      !parsedContact.code ||
      !parsedContact.number ||
      !/^\d{10}$/.test(parsedContact.number)
    ) {
      return res.json({
        success: false,
        message: "Enter a valid mobile number",
      });
    }

    // validate email format
    if (!validator.isEmail(parsedContact.email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    const updatedStaff = await staffRequirementModel.findByIdAndUpdate(
      staffId,
      {
        title,
        category,
        description,
        location,
        salary,
        staffType,
        availabilityDate,
        requirements: parsedRequirements,
        contact: parsedContact,
      },
      { new: true }
    );

    if (!updatedStaff) {
      return res.json({
        success: false,
        message: "Staff requirement not found",
      });
    }

    res.json({
      success: true,
      message: "Staff requirement updated successfully",
      staffRequirement: updatedStaff,
    });
  } catch (error) {
    console.log("Error in editStaffRequirement:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to delete a staff requirement
const deleteStaffRequirement = async (req, res) => {
  try {
    // const { staffId } = req.params;
    console.log("Delete req: ", req.body);
    const { staffId } = req.body;

    if (!staffId) {
      return res.json({
        success: false,
        message: "Staff ID is required",
      });
    }

    const deletedStaff = await staffRequirementModel.findByIdAndDelete(staffId);

    if (!deletedStaff) {
      return res.json({
        success: false,
        message: "Staff requirement not found",
      });
    }

    res.json({
      success: true,
      message: "Staff requirement deleted successfully",
    });
  } catch (error) {
    console.log("Error in deleteStaffRequirement:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to update staff requirement status (open/close)
const updateStaffStatus = async (req, res) => {
  try {
    // const { staffId } = req.params;
    const { staffId, isOpen } = req.body;
    console.log(req.body);
    console.log({ staffId, isOpen });

    if (!staffId) {
      return res.json({
        success: false,
        message: "Staff ID is missing",
      });
    }

    var isOpened = isOpen;
    if (typeof isOpen !== "boolean") {
      if (isOpen === "true") isOpened = true;
      else if (isOpen === "false") isOpened = false;
      else {
        return res.json({
          success: false,
          message: "isOpen must be boolean or true/false.",
        });
      }
    }

    const updatedStaff = await staffRequirementModel.findByIdAndUpdate(
      staffId,
      { isOpen: isOpened },
      { new: true }
    );

    if (!updatedStaff) {
      return res.json({
        success: false,
        message: "Staff requirement not found",
      });
    }

    res.json({
      success: true,
      message: `Staff requirement ${
        isOpened ? "opened" : "closed"
      } successfully`,
      staffRequirement: updatedStaff,
    });
  } catch (error) {
    console.log("Error in updateStaffStatus:", error);
    res.json({ success: false, message: error.message });
  }
};

// --------------------------------------

// -----------ADVERTISEMENT SECTION------
// API to create a new advertisement
const addAdvertisement = async (req, res) => {
  try {
    console.log("Requested data: ", req.body);
    const {
      userId,
      title,
      category,
      description,
      validFrom,
      validUntil,
      location,
      contact,
    } = req.body;

    console.log({
      userId,
      title,
      category,
      description,
      validFrom,
      validUntil,
      location,
      contact,
    });

    // Check for required fields
    if (
      !userId ||
      !title ||
      !description ||
      !validFrom ||
      !validUntil ||
      !contact
    ) {
      return res.json({
        success: false,
        message: "Missing required advertisement fields",
      });
    }

    const parsedContact =
      typeof contact === "string" ? JSON.parse(contact) : contact;

    // Validating mobile number
    if (
      !parsedContact.code ||
      !parsedContact.number ||
      !/^\d{10}$/.test(parsedContact.number)
    ) {
      return res.json({
        success: false,
        message: "Enter a valid mobile number",
      });
    }

    // validate email format
    if (!validator.isEmail(parsedContact.email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    // Validate dates
    const fromDate = new Date(validFrom);
    const untilDate = new Date(validUntil);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (fromDate >= untilDate) {
      return res.json({
        success: false,
        message: "Valid Until date must be after Valid From date",
      });
    }

    if (fromDate < today) {
      return res.json({
        success: false,
        message: "Valid From date cannot be in the past",
      });
    }

    const advertisement = await advertisementModel.create({
      userId,
      title,
      category,
      description,
      validFrom: fromDate,
      validUntil: untilDate,
      location,
      contact: parsedContact,
    });

    res.json({
      success: true,
      message: "Advertisement created successfully",
      advertisement,
    });
  } catch (error) {
    console.log("Error in addAdvertisement:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get advertisements created by a specific user
const getMyAdvertisements = async (req, res) => {
  try {
    const { userId } = req.body; // Assuming user is authenticated and ID is in `req.user`

    const advertisements = await advertisementModel
      .find({ userId })
      .sort({ postedDate: -1 });

    res.status(200).json({ success: true, advertisements });
  } catch (error) {
    console.error("Error fetching user's advertisements:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// API to get all active advertisements with user names
const getAllAdvertisementsWithUserNames = async (req, res) => {
  try {
    const currentDate = new Date();

    const advertisements = await advertisementModel
      .find({
        isActive: true,
        validFrom: { $lte: currentDate },
        validUntil: { $gte: currentDate },
      })
      .populate({
        path: "userId",
        select: "fullname", // Only fetch the fullname of the user
      })
      .sort({ postedDate: -1 });

    const formatted = advertisements.map((ad) => ({
      _id: ad._id,
      title: ad.title,
      category: ad.category,
      description: ad.description,
      validFrom: ad.validFrom,
      validUntil: ad.validUntil,
      location: ad.location,
      contact: ad.contact,
      postedDate: ad.postedDate,
      isActive: ad.isActive,
      userFullname: ad.userId?.fullname || "Unknown",
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching all advertisements:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// API to edit/update an advertisement
const editAdvertisement = async (req, res) => {
  try {
    const {
      adId,
      title,
      category,
      description,
      validFrom,
      validUntil,
      location,
      contact,
    } = req.body;

    console.log("Edit Req: ", req.body);
    console.log("Edit Data: ", {
      adId,
      title,
      category,
      description,
      validFrom,
      validUntil,
      location,
      contact,
    });

    // Check for required fields
    if (
      !adId ||
      !title ||
      !description ||
      !validFrom ||
      !validUntil ||
      !contact
    ) {
      return res.json({
        success: false,
        message: "Missing required advertisement fields",
      });
    }

    const parsedContact =
      typeof contact === "string" ? JSON.parse(contact) : contact;

    // Validating mobile number
    if (
      !parsedContact.code ||
      !parsedContact.number ||
      !/^\d{10}$/.test(parsedContact.number)
    ) {
      return res.json({
        success: false,
        message: "Enter a valid mobile number",
      });
    }

    // validate email format
    if (!validator.isEmail(parsedContact.email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    // Validate dates
    const fromDate = new Date(validFrom);
    const untilDate = new Date(validUntil);

    if (fromDate >= untilDate) {
      return res.json({
        success: false,
        message: "Valid Until date must be after Valid From date",
      });
    }

    const updatedAdvertisement = await advertisementModel.findByIdAndUpdate(
      adId,
      {
        title,
        category,
        description,
        validFrom: fromDate,
        validUntil: untilDate,
        location,
        contact: parsedContact,
      },
      { new: true }
    );

    if (!updatedAdvertisement) {
      return res.json({
        success: false,
        message: "Advertisement not found",
      });
    }

    res.json({
      success: true,
      message: "Advertisement updated successfully",
      advertisement: updatedAdvertisement,
    });
  } catch (error) {
    console.log("Error in editAdvertisement:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to delete an advertisement
const deleteAdvertisement = async (req, res) => {
  try {
    console.log("Delete req: ", req.body);
    const { adId } = req.body;

    if (!adId) {
      return res.json({
        success: false,
        message: "Advertisement ID is required",
      });
    }

    const deletedAdvertisement = await advertisementModel.findByIdAndDelete(
      adId
    );

    if (!deletedAdvertisement) {
      return res.json({
        success: false,
        message: "Advertisement not found",
      });
    }

    res.json({
      success: true,
      message: "Advertisement deleted successfully",
    });
  } catch (error) {
    console.log("Error in deleteAdvertisement:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to update advertisement status (active/inactive)
const updateAdvertisementStatus = async (req, res) => {
  try {
    const { adId, isActive } = req.body;
    console.log(req.body);
    console.log({ adId, isActive });

    if (!adId) {
      return res.json({
        success: false,
        message: "Advertisement ID is missing",
      });
    }

    var isActivated = isActive;
    if (typeof isActive !== "boolean") {
      if (isActive === "true") isActivated = true;
      else if (isActive === "false") isActivated = false;
      else {
        return res.json({
          success: false,
          message: "isActive must be boolean or true/false.",
        });
      }
    }

    const updatedAdvertisement = await advertisementModel.findByIdAndUpdate(
      adId,
      { isActive: isActivated },
      { new: true }
    );

    if (!updatedAdvertisement) {
      return res.json({
        success: false,
        message: "Advertisement not found",
      });
    }

    res.json({
      success: true,
      message: `Advertisement ${
        isActivated ? "activated" : "deactivated"
      } successfully`,
      advertisement: updatedAdvertisement,
    });
  } catch (error) {
    console.log("Error in updateAdvertisementStatus:", error);
    res.json({ success: false, message: error.message });
  }
};

// --------------------------------------

import donationModel from "../models/DonationModel.js";

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// API to create a donation order (initiate payment)
const createDonationOrder = async (req, res) => {
  try {
    console.log(req.body);
    const { amount, purpose, method, remarks, profession } = req.body;
    const userId = req.body.userId; // Extract from auth middleware

    console.log("Donation order request:", {
      userId,
      amount,
      purpose,
      method,
      remarks,
    });

    // Validate required fields
    if (!userId || !amount || !purpose || !method) {
      return res.json({
        success: false,
        message: "Missing required donation fields",
      });
    }

    // Additional validation for Durga Puja donations
    if (purpose === "Durga Puja" && !profession) {
      return res.json({
        success: false,
        message: "Profession is required for Durga Puja donations",
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    // Validate amount limit (10 lakh)
    if (amount > 1000000) {
      return res.json({
        success: false,
        message: "Amount cannot exceed ₹10,00,000",
      });
    }

    // Validate method
    const validMethods = ["Cash", "UPI", "Card", "Online"];
    if (!validMethods.includes(method)) {
      return res.json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // For Cash donations, save directly without Razorpay
    if (method === "Cash") {
      const donation = await donationModel.create({
        userId,
        amount,
        purpose,
        method,
        remarks,
        profession: purpose === "Durga Puja" ? profession : undefined,
        transactionId: `CASH_${Date.now()}`, // Generate unique ID for cash
        paymentStatus: "completed", // Cash is always completed
      });

      return res.json({
        success: true,
        message: "Cash donation recorded successfully",
        donation,
        paymentRequired: false,
      });
    }

    // For digital payments, create donation record with pending status
    const tempDonation = await donationModel.create({
      userId,
      amount,
      purpose,
      method,
      remarks,
      profession: purpose === "Durga Puja" ? profession : undefined,
      transactionId: null, // Will be updated after payment
      paymentStatus: "pending", // Initially pending
    });

    // Create Razorpay order for digital payments
    const options = {
      amount: amount * 100, // Amount in paise
      currency: process.env.CURRENCY || "INR",
      receipt: tempDonation._id.toString(),
      notes: {
        purpose: purpose,
        userId: userId,
        donationId: tempDonation._id.toString(),
      },
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);
    console.log("razorpayOrder: ", razorpayOrder);

    // Update donation record with Razorpay order ID
    await donationModel.findByIdAndUpdate(tempDonation._id, {
      razorpayOrderId: razorpayOrder.id, // Store Razorpay order ID temporarily
    });

    res.json({
      success: true,
      message: "Donation order created successfully",
      order: razorpayOrder,
      donationId: tempDonation._id,
      paymentRequired: true,
    });
  } catch (error) {
    console.log("Error in createDonationOrder:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to verify Razorpay payment and update donation
const verifyDonationPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donationId,
    } = req.body;

    console.log("Payment verification request:", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donationId,
    });

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !donationId
    ) {
      return res.json({
        success: false,
        message: "Missing payment verification data",
      });
    }

    // Verify payment signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Mark payment as failed
      await donationModel.findByIdAndUpdate(donationId, {
        paymentStatus: "failed",
      });

      return res.json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Update donation record with payment details
    const updatedDonation = await donationModel
      .findByIdAndUpdate(
        donationId,
        {
          transactionId: razorpay_payment_id, // Use payment ID as transaction ID
          paymentStatus: "completed", // Mark as completed
          $unset: { razorpayOrderId: 1 }, // Remove temporary order ID
        },
        { new: true }
      )
      .populate("userId", "fullname contact");

    if (!updatedDonation) {
      return res.json({
        success: false,
        message: "Donation record not found",
      });
    }

    console.log("updatedDonation: ", updatedDonation);

    // Optional: Send confirmation email
    try {
      await sendDonationConfirmationEmail(updatedDonation);
    } catch (emailError) {
      console.log("Email sending failed:", emailError);
      // Don't fail the entire request if email fails
    }

    res.json({
      success: true,
      message: "Payment verified and donation recorded successfully",
      donation: updatedDonation,
    });
  } catch (error) {
    console.log("Error in verifyDonationPayment:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get donations by user
const getUserDonations = async (req, res) => {
  try {
    const userId = req.body.userId; // Extract from auth middleware

    if (!userId) {
      return res.json({
        success: false,
        message: "User ID is required",
      });
    }

    const donations = await donationModel
      .find({ userId })
      .sort({ createdAt: -1 }); // Most recent first

    res.json({
      success: true,
      donations,
    });
  } catch (error) {
    console.log("Error in getUserDonations:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to retry payment for failed/pending donations
const retryDonationPayment = async (req, res) => {
  try {
    const { donationId, userId } = req.body;
    // const userId = req.body.userId; // Extract from auth middleware

    if (!donationId) {
      return res.json({
        success: false,
        message: "Donation ID is required",
      });
    }

    // Find the donation and verify ownership
    const donation = await donationModel.findOne({
      _id: donationId,
      userId: userId,
    });

    if (!donation) {
      return res.json({
        success: false,
        message: "Donation not found or access denied",
      });
    }

    // Check if donation can be retried
    if (donation.paymentStatus === "completed") {
      return res.json({
        success: false,
        message: "Donation is already completed",
      });
    }

    if (donation.method === "Cash") {
      return res.json({
        success: false,
        message: "Cash donations cannot be retried",
      });
    }

    // Create new Razorpay order
    const options = {
      amount: donation.amount * 100, // Amount in paise
      currency: process.env.CURRENCY || "INR",
      receipt: donation._id.toString(),
      notes: {
        purpose: donation.purpose,
        userId: userId,
        donationId: donation._id.toString(),
        retry: "true",
      },
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    // Update donation with new order ID and reset to pending
    await donationModel.findByIdAndUpdate(donationId, {
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: "pending",
    });

    res.json({
      success: true,
      message: "Payment retry order created successfully",
      order: razorpayOrder,
      donationId: donation._id,
    });
  } catch (error) {
    console.log("Error in retryDonationPayment:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to delete donation (only for pending/failed donations)
const deleteDonation = async (req, res) => {
  try {
    const { donationId } = req.params; // Extract from URL params
    const userId = req.body.userId; // Extract from auth middleware

    if (!donationId) {
      return res.json({
        success: false,
        message: "Donation ID is required",
      });
    }

    // Find the donation and verify ownership
    const donation = await donationModel.findOne({
      _id: donationId,
      userId: userId,
    });

    if (!donation) {
      return res.json({
        success: false,
        message: "Donation not found or access denied",
      });
    }

    // Check if donation can be deleted (only pending/failed)
    if (donation.paymentStatus === "completed") {
      return res.json({
        success: false,
        message: "Completed donations cannot be deleted",
      });
    }

    // Delete the donation
    await donationModel.findByIdAndDelete(donationId);

    res.json({
      success: true,
      message: "Donation deleted successfully",
    });
  } catch (error) {
    console.log("Error in deleteDonation:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all donations (admin function)
const getAllDonations = async (req, res) => {
  try {
    const donations = await donationModel
      .find()
      .populate("userId", "fullname email contact")
      .sort({ createdAt: -1 });

    // Calculate total donations (only completed ones)
    const completedDonations = donations.filter(
      (d) => d.paymentStatus === "completed"
    );
    const totalAmount = completedDonations.reduce(
      (sum, donation) => sum + donation.amount,
      0
    );

    res.json({
      success: true,
      donations,
      totalAmount,
      totalCount: donations.length,
      completedCount: completedDonations.length,
    });
  } catch (error) {
    console.log("Error in getAllDonations:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get donation statistics
const getDonationStats = async (req, res) => {
  try {
    // Total donations (only completed)
    const totalDonations = await donationModel.countDocuments({
      paymentStatus: "completed",
    });
    const totalAmount = await donationModel.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Donations by purpose (only completed)
    const donationsByPurpose = await donationModel.aggregate([
      { $match: { paymentStatus: "completed" } },
      {
        $group: {
          _id: "$purpose",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    // Donations by method (only completed)
    const donationsByMethod = await donationModel.aggregate([
      { $match: { paymentStatus: "completed" } },
      {
        $group: {
          _id: "$method",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    // Donations by status
    const donationsByStatus = await donationModel.aggregate([
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Recent donations (last 30 days, only completed)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentDonations = await donationModel.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          paymentStatus: "completed",
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    res.json({
      success: true,
      stats: {
        totalDonations,
        totalAmount: totalAmount[0]?.total || 0,
        donationsByPurpose,
        donationsByMethod,
        donationsByStatus,
        recentDonations: recentDonations[0] || { count: 0, totalAmount: 0 },
      },
    });
  } catch (error) {
    console.log("Error in getDonationStats:", error);
    res.json({ success: false, message: error.message });
  }
};

// Optional: Function to send donation confirmation email
const sendDonationConfirmationEmail = async (donation) => {
  try {
    // Only send email if environment variables are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log("Email credentials not configured, skipping email");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: donation.userId.contact.email,
      subject: "Thank You for Your Donation!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Thank You for Your Donation!</h2>
          <p>Dear ${donation.userId.fullname},</p>
          <p>Thank you for your generous donation. Here are the details:</p>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 10px 0;"><strong>Amount:</strong> ₹${donation.amount.toLocaleString(
                "en-IN"
              )}</li>
              <li style="margin: 10px 0;"><strong>Purpose:</strong> ${
                donation.purpose
              }</li>
              <li style="margin: 10px 0;"><strong>Payment Method:</strong> ${
                donation.method
              }</li>
              <li style="margin: 10px 0;"><strong>Transaction ID:</strong> ${
                donation.transactionId
              }</li>
              <li style="margin: 10px 0;"><strong>Date:</strong> ${new Date(
                donation.createdAt
              ).toLocaleDateString("en-IN")}</li>
              <li style="margin: 10px 0;"><strong>Status:</strong> ${
                donation.paymentStatus
              }</li>
            </ul>
          </div>
          <p>Your contribution will make a significant impact. We truly appreciate your support!</p>
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>The Donation Team</strong>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Donation confirmation email sent successfully");
  } catch (error) {
    console.log("Error sending donation email:", error);
    throw error; // Re-throw to handle in calling function
  }
};

// Update the export statement to include the new functions
export {
  loginUser,
  getUserProfile,
  updateUserProfile,
  createJobOpening,
  getJobOpeningsByUser,
  getAllJobOpeningsWithUserNames,
  editJobOpening,
  deleteJobOpening,
  updateJobStatus,
  createStaffRequirement,
  getStaffRequirementsByUser,
  getAllStaffRequirementsWithUserNames,
  editStaffRequirement,
  deleteStaffRequirement,
  updateStaffStatus,
  addAdvertisement,
  getMyAdvertisements,
  getAllAdvertisementsWithUserNames,
  editAdvertisement,
  deleteAdvertisement,
  updateAdvertisementStatus,
  // Make Donations
  createDonationOrder,
  verifyDonationPayment,
  getUserDonations,
  retryDonationPayment,
  deleteDonation,
  getAllDonations,
  getDonationStats,
  sendDonationConfirmationEmail,
};

// // Create Nodemailer transporter
// const transporter = nodemailer.createTransport({
//   service: "gmail", // Use your email provider (e.g., "gmail", "outlook")
//   auth: {
//     user: process.env.EMAIL_USER, // Your email address
//     pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
//   },
// });

// // Function to send email
// const sendDonationEmail = async (formData) => {
//   const mailOptions = {
//     from: process.env.EMAIL_USER, // Sender email address
//     to: formData.email, // Recipient email address
//     subject: "Thank You for Your Donation!",
//     html: `
//       <h3>Dear ${formData.fullname},</h3>
//       <p>Thank you for your generous donation. Here are the details:</p>
//       <ul>
//         <li><strong>Donor Name:</strong> ${formData.fullname}</li>
//         <li><strong>Category:</strong> ${formData.category}</li>
//         <li><strong>Amount:</strong> ₹${formData.amount}</li>
//         <li><strong>Transaction ID:</strong> ${formData.razorpayOrderId}</li>
//       </ul>
//       <p>Your contribution will make a significant impact. We truly appreciate your support!</p>
//       <p>Best regards,</p>
//       <p>The Donation Team</p>
//     `,
//   };

//   // Send email
//   await transporter.sendMail(mailOptions);
// };

// const verifyRazorpay = async (req, res) => {
//   try {
//     const { razorpay_order_id } = req.body;
//     console.log(req.body);

//     // Update form entry
//     const updatedForm = await formModel.findOneAndUpdate(
//       { razorpayOrderId: razorpay_order_id },
//       { payment: true },
//       { new: true } // Return the updated document
//     );
//     console.log(updatedForm);

//     if (!updatedForm) {
//       return res.json({
//         success: false,
//         message: "No matching form found for the given Razorpay order ID",
//       });
//     }

//     // Send donation email
//     await sendDonationEmail(updatedForm);

//     res.json({ success: true, message: "Payment successful", updatedForm });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// export { addForm, getEntry, updateEntry, paymentRazorpay, verifyRazorpay };
