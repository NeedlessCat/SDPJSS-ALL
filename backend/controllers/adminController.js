import express from "express";
import jwt from "jsonwebtoken";
import familyModel from "../models/familyModel.js";
import userModel from "../models/userModel.js";
import jobOpeningModel from "../models/JobOpeningModel.js";
import staffRequirementModel from "../models/StaffRequirementModel.js";
import advertisementModel from "../models/AdvertisementModel.js";
import formModel from "../models/formModel.js";
import noticeModel from "../models/noticeModel.js";
import donationModel from "../models/DonationModel.js";

//API for admin login..
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get family list with count
const getFamilyList = async (req, res) => {
  try {
    const families = await familyModel
      .find({})
      .select("-password")
      .populate("memberids", "fullname username isComplete isApproved gender")
      .sort({ familyid: 1 });

    const count = families.length;

    res.json({
      success: true,
      families,
      count,
      message: `Retrieved ${count} families successfully`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user list with count
const getUserList = async (req, res) => {
  try {
    const users = await userModel
      .find({})
      .select("-password")
      .populate("familyid", "familyname familyid")
      .sort({ createdAt: -1 });

    const count = users.length;

    res.json({
      success: true,
      users,
      count,
      message: `Retrieved ${count} users successfully`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get staff requirement list with count
const getStaffRequirementList = async (req, res) => {
  try {
    const staffRequirements = await staffRequirementModel
      .find({})
      .populate("userId", "fullname username")
      .sort({ postedDate: -1 });

    const count = staffRequirements.length;

    res.json({
      success: true,
      staffRequirements,
      count,
      message: `Retrieved ${count} staff requirements successfully`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get job opening list with count
const getJobOpeningList = async (req, res) => {
  try {
    const jobOpenings = await jobOpeningModel
      .find({})
      .populate("userId", "fullname username")
      .sort({ postedDate: -1 });

    const count = jobOpenings.length;

    res.json({
      success: true,
      jobOpenings,
      count,
      message: `Retrieved ${count} job openings successfully`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get advertisement list with count
const getAdvertisementList = async (req, res) => {
  try {
    const advertisements = await advertisementModel
      .find({})
      .populate("userId", "fullname username")
      .sort({ postedDate: -1 });

    const count = advertisements.length;

    res.json({
      success: true,
      advertisements,
      count,
      message: `Retrieved ${count} advertisements successfully`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// In your admin controller
const getDonationList = async (req, res) => {
  try {
    const donations = await donationModel
      .find()
      .populate("userId", "fullname email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      donations,
    });
  } catch (error) {
    console.log("Error in getDonationList:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get family count only
const getFamilyCount = async (req, res) => {
  try {
    const { year } = req.query; // Get year from query params
    const currentYear = new Date().getFullYear();
    const targetYear = year ? parseInt(year) : currentYear;

    // Create start and end dates for the year
    const startDate = new Date(targetYear, 0, 1); // January 1st
    const endDate = new Date(targetYear + 1, 0, 1); // January 1st of next year

    // Get monthly family registrations for the specified year
    const monthlyFamilies = await familyModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ]);

    // Create array with all 12 months, filling missing months with 0
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyData = monthNames.map((month, index) => {
      const monthData = monthlyFamilies.find(
        (item) => item._id.month === index + 1
      );
      return {
        month,
        families: monthData ? monthData.count : 0,
      };
    });

    // Get total count for the year
    const totalCount = monthlyData.reduce(
      (sum, month) => sum + month.families,
      0
    );

    res.json({
      success: true,
      year: targetYear,
      totalCount,
      monthlyData,
      message: `Family registrations for ${targetYear}: ${totalCount}`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user count only
const getUserCount = async (req, res) => {
  try {
    const { year } = req.query; // Get year from query params
    const currentYear = new Date().getFullYear();
    const targetYear = year ? parseInt(year) : currentYear;

    // Create start and end dates for the year
    const startDate = new Date(targetYear, 0, 1); // January 1st
    const endDate = new Date(targetYear + 1, 0, 1); // January 1st of next year

    // Get monthly user registrations for the specified year
    const monthlyUsers = await userModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 },
          complete: { $sum: { $cond: ["$isComplete", 1, 0] } },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ]);

    // Create array with all 12 months, filling missing months with 0
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyData = monthNames.map((month, index) => {
      const monthData = monthlyUsers.find(
        (item) => item._id.month === index + 1
      );
      return {
        month,
        users: monthData ? monthData.count : 0,
        completeUsers: monthData ? monthData.complete : 0,
        incompleteUsers: monthData ? monthData.count - monthData.complete : 0,
      };
    });

    // Get totals for the year
    const totalUsers = monthlyData.reduce((sum, month) => sum + month.users, 0);
    const totalComplete = monthlyData.reduce(
      (sum, month) => sum + month.completeUsers,
      0
    );
    const totalIncomplete = totalUsers - totalComplete;

    res.json({
      success: true,
      year: targetYear,
      totalUsers,
      completeProfiles: totalComplete,
      incompleteProfiles: totalIncomplete,
      monthlyData,
      message: `User registrations for ${targetYear}: ${totalUsers} (Complete: ${totalComplete}, Incomplete: ${totalIncomplete})`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get total donation amount
const getTotalDonation = async (req, res) => {
  try {
    const donations = await formModel.find({ payment: true });

    const totalAmount = donations.reduce((sum, donation) => {
      return sum + (donation.amount || 0);
    }, 0);

    const donationsByCategory = donations.reduce((acc, donation) => {
      const category = donation.category || "unknown";
      if (!acc[category]) {
        acc[category] = { count: 0, amount: 0 };
      }
      acc[category].count += 1;
      acc[category].amount += donation.amount || 0;
      return acc;
    }, {});

    res.json({
      success: true,
      totalDonations: donations.length,
      totalAmount,
      donationsByCategory,
      message: `Total donations: ${donations.length} worth ₹${totalAmount}`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get comprehensive admin statistics
const getAdminStats = async (req, res) => {
  try {
    // Get all counts in parallel for better performance
    const [
      familyCount,
      userStats,
      jobOpeningCount,
      staffRequirementCount,
      advertisementCount,
      donationStats,
    ] = await Promise.all([
      familyModel.countDocuments({}),
      userModel.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            complete: { $sum: { $cond: ["$isComplete", 1, 0] } },
          },
        },
      ]),
      jobOpeningModel.countDocuments({}),
      staffRequirementModel.countDocuments({}),
      advertisementModel.countDocuments({}),
      formModel.aggregate([
        {
          $match: { payment: true },
        },
        {
          $group: {
            _id: null,
            totalDonations: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const userStatsData = userStats[0] || { total: 0, complete: 0 };
    const donationData = donationStats[0] || {
      totalDonations: 0,
      totalAmount: 0,
    };

    const stats = {
      families: familyCount,
      users: {
        total: userStatsData.total,
        complete: userStatsData.complete,
        incomplete: userStatsData.total - userStatsData.complete,
      },
      jobOpenings: jobOpeningCount,
      staffRequirements: staffRequirementCount,
      advertisements: advertisementCount,
      donations: {
        count: donationData.totalDonations,
        amount: donationData.totalAmount,
      },
    };

    res.json({
      success: true,
      stats,
      message: "Admin statistics retrieved successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Add this new function for getting donation data by year
const getDonationsByYear = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = new Date().getFullYear();
    const targetYear = year ? parseInt(year) : currentYear;

    // Create start and end dates for the year
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear + 1, 0, 1);

    // Get monthly donations for the specified year
    const monthlyDonations = await formModel.aggregate([
      {
        $match: {
          payment: true,
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ]);

    // Create array with all 12 months
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyData = monthNames.map((month, index) => {
      const monthData = monthlyDonations.find(
        (item) => item._id.month === index + 1
      );
      return {
        month,
        donations: monthData ? monthData.amount : 0,
        donationCount: monthData ? monthData.count : 0,
      };
    });

    // Get totals for the year
    const totalAmount = monthlyData.reduce(
      (sum, month) => sum + month.donations,
      0
    );
    const totalCount = monthlyData.reduce(
      (sum, month) => sum + month.donationCount,
      0
    );

    res.json({
      success: true,
      year: targetYear,
      totalAmount,
      totalCount,
      monthlyData,
      message: `Donations for ${targetYear}: ${totalCount} donations worth ₹${totalAmount}`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Add this function to get available years
const getAvailableYears = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    // Get the earliest registration year from both families and users
    const [earliestFamily, earliestUser, earliestDonation] = await Promise.all([
      familyModel.findOne({}).sort({ createdAt: 1 }).select("createdAt"),
      userModel.findOne({}).sort({ createdAt: 1 }).select("createdAt"),
      formModel
        .findOne({ payment: true })
        .sort({ createdAt: 1 })
        .select("createdAt"),
    ]);

    let startYear = 2024; // Default start year

    // Find the earliest year from all collections
    if (earliestFamily?.createdAt) {
      startYear = Math.min(startYear, earliestFamily.createdAt.getFullYear());
    }
    if (earliestUser?.createdAt) {
      startYear = Math.min(startYear, earliestUser.createdAt.getFullYear());
    }
    if (earliestDonation?.createdAt) {
      startYear = Math.min(startYear, earliestDonation.createdAt.getFullYear());
    }

    // Generate array of years from start year to current year
    const years = [];
    for (let year = startYear; year <= currentYear; year++) {
      years.push(year);
    }

    res.json({
      success: true,
      years: years.reverse(), // Most recent first
      message: `Available years: ${startYear} to ${currentYear}`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update user status (add this new function)
const updateUserStatus = async (req, res) => {
  try {
    const { userId, isApproved } = req.body;

    // Validate status
    if (!["pending", "approved", "disabled"].includes(isApproved)) {
      return res.json({ success: false, message: "Invalid status value" });
    }

    const user = await userModel
      .findByIdAndUpdate(userId, { isApproved }, { new: true })
      .select("-password");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user,
      message: `User ${isApproved} successfully`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all notices
const getNoticeList = async (req, res) => {
  try {
    const notices = await noticeModel.find({}).sort({ createdAt: -1 }); // Most recent first

    const count = notices.length;

    res.json({
      success: true,
      notices,
      count,
      message: `Retrieved ${count} notices successfully`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to add a new notice
const addNotice = async (req, res) => {
  try {
    const { title, message, icon, color, type, author, category } = req.body;

    // Validate required fields
    if (
      !title ||
      !message ||
      !icon ||
      !color ||
      !type ||
      !author ||
      !category
    ) {
      return res.json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate type enum
    const validTypes = [
      "alert",
      "announcement",
      "event",
      "achievement",
      "info",
    ];
    if (!validTypes.includes(type)) {
      return res.json({
        success: false,
        message: "Invalid notice type",
      });
    }

    const newNotice = new noticeModel({
      title,
      message,
      icon,
      color,
      type,
      author,
      category,
      time: new Date(), // Set current time
    });

    await newNotice.save();

    res.json({
      success: true,
      notice: newNotice,
      message: "Notice added successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update a notice
const updateNotice = async (req, res) => {
  try {
    console.log("Notice", req.params);
    const { id } = req.params;
    const { title, message, icon, color, type, author, category } = req.body;

    // Validate required fields
    if (
      !title ||
      !message ||
      !icon ||
      !color ||
      !type ||
      !author ||
      !category
    ) {
      return res.json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate type enum
    const validTypes = [
      "alert",
      "announcement",
      "event",
      "achievement",
      "info",
    ];
    if (!validTypes.includes(type)) {
      return res.json({
        success: false,
        message: "Invalid notice type",
      });
    }

    const updatedNotice = await noticeModel.findByIdAndUpdate(
      id,
      {
        title,
        message,
        icon,
        color,
        type,
        author,
        category,
      },
      { new: true }
    );

    if (!updatedNotice) {
      return res.json({ success: false, message: "Notice not found" });
    }

    res.json({
      success: true,
      notice: updatedNotice,
      message: "Notice updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to delete a notice
const deleteNotice = async (req, res) => {
  try {
    console.log("Notice", req.params);
    const { id } = req.params;

    const deletedNotice = await noticeModel.findByIdAndDelete(id);

    if (!deletedNotice) {
      return res.json({ success: false, message: "Notice not found" });
    }

    res.json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  loginAdmin,
  getFamilyList,
  getUserList,
  getStaffRequirementList,
  getJobOpeningList,
  getAdvertisementList,
  getDonationList,
  getFamilyCount,
  getUserCount,
  getTotalDonation,
  getAdminStats,
  getDonationsByYear,
  getAvailableYears,
  updateUserStatus,
  getNoticeList,
  addNotice,
  updateNotice,
  deleteNotice,
};
