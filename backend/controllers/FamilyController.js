import validator from "validator";
import bcrypt from "bcrypt";
import familyModel from "../models/familyModel.js";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

// API to family registration
const registerFamily = async (req, res) => {
  try {
    console.log(req.body);
    const { familyname, familyaddress, email, password, gotra, mobile } =
      req.body;

    console.log({ familyname, familyaddress, email, password, gotra, mobile });
    if (!familyname || !familyaddress || !email || !password || !gotra) {
      return res.json({ success: false, message: "Missing Details" });
    }

    //Validating mobile number
    if (
      !mobile ||
      typeof mobile !== "object" ||
      !mobile.code ||
      !mobile.number ||
      !/^\d{10}$/.test(mobile.number)
    ) {
      return res.json({
        success: false,
        message: "Enter a valid mobile number",
      });
    }

    // validate email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    // check if email already exists
    const existingFamily = await familyModel.findOne({ email });
    if (existingFamily) {
      return res.json({ success: false, message: "Email already registered" });
    }

    // Generate family ID as string (F0001, F0002, etc.)
    const lastFamily = await familyModel.findOne().sort({ familyid: -1 });
    let newFamilyId;

    if (lastFamily && lastFamily.familyid) {
      // Extract numeric part from existing familyid (e.g., "F0001" -> 1)
      const lastNumericId = parseInt(lastFamily.familyid.substring(1));
      const nextNumericId = lastNumericId + 1;
      newFamilyId = `F${nextNumericId.toString().padStart(4, "0")}`;
    } else {
      newFamilyId = "F0001";
    }

    // Check if we've reached the maximum (F1000)
    const numericPart = parseInt(newFamilyId.substring(1));
    if (numericPart > 1000) {
      return res.json({
        success: false,
        message: "Maximum family registrations reached",
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create family data with familyid
    const familyData = {
      familyid: newFamilyId,
      familyname,
      familyaddress,
      email,
      password: hashedPassword,
      gotra,
      mobile,
    };

    const newFamily = new familyModel(familyData);
    const savedFamily = await newFamily.save();

    const token = jwt.sign({ id: savedFamily._id }, process.env.JWT_SECRET);

    res.json({ success: true, token, familyid: savedFamily.familyid });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API for family login
const loginFamily = async (req, res) => {
  try {
    console.log(req);
    const { familyid, familyname, password } = req.body;
    const family = await familyModel.findOne({ familyid, familyname });

    if (!family) {
      return res.json({ success: false, message: "Family does not exist" });
    }

    const isMatch = await bcrypt.compare(password, family.password);

    if (isMatch) {
      const token = jwt.sign({ id: family._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get family profile data..
const getProfile = async (req, res) => {
  try {
    //User will send token used to get famId..
    const { famId } = req.body;
    const familyData = await familyModel.findById(famId).select("-password");

    // 3. Return updated family with populated members
    const updatedFamily = await familyModel
      .findById(familyData._id)
      .populate("memberids");

    res.json({ success: true, updatedFamily });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to update family profile...
const updateProfile = async (req, res) => {
  try {
    console.log(req.body);
    const { famId, familyname, familyaddress, email, gotra, mobile } = req.body;
    console.log({ famId, familyname, familyaddress, email, gotra, mobile });
    if ((!familyname, !familyaddress, !email, !gotra, !mobile)) {
      return res.json({ success: false, message: "Data Missing" });
    }

    await familyModel.findByIdAndUpdate(famId, {
      familyname,
      familyaddress,
      email,
      gotra,
      mobile: JSON.parse(mobile),
    });

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to add members in the family...
const addMember = async (req, res) => {
  try {
    const { famId, fullname, fatherid, mother, gender, dob, bloodgroup } =
      req.body;

    //checking for data to add member
    if (!fullname || !fatherid || !mother || !gender || !dob || !bloodgroup) {
      return res.json({ success: false, message: "Missing Details" });
    }

    //Username Format: firstnameYYMMDD
    function generateUsername(fullname, dob) {
      if (!fullname || !dob) return null;

      const nameParts = fullname.trim().toLowerCase().split(" ");
      const firstName = nameParts[0];

      const birthDate = new Date(dob);
      const year = birthDate.getFullYear().toString().slice(-2); // last 2 digits
      const month = String(birthDate.getMonth() + 1).padStart(2, "0"); // 01-12
      const day = String(birthDate.getDate()).padStart(2, "0"); // 01-31

      const username = `${firstName}${year}${month}${day}`;
      return username;
    }

    // Generate user ID as string (U0000001, U0000002, etc.)
    const lastUser = await userModel.findOne().sort({ id: -1 });
    let newUserId;

    if (lastUser && lastUser.id) {
      // Extract numeric part from existing user id (e.g., "U0000001" -> 1)
      const lastNumericId = parseInt(lastUser.id.substring(1));
      const nextNumericId = lastNumericId + 1;
      newUserId = `U${nextNumericId.toString().padStart(7, "0")}`;
    } else {
      newUserId = "U0000001";
    }

    const username = generateUsername(fullname, dob);

    const memberData = {
      id: newUserId,
      fullname,
      fatherid,
      mother,
      gender,
      dob,
      bloodgroup,
      username,
    };

    const newMember = new userModel(memberData);
    await newMember.save();

    const family = await familyModel.findById(famId);
    console.log(family);
    family.memberids.push(newMember._id);
    await family.save();

    res.json({ success: true, message: "Member Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to complete user profile from family section...
const completeProfile = async (req, res) => {
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
      password,
      famId,
      marriage,
      contact,
      address,
      education,
      profession,
      healthissue,
      islive,
    } = req.body;
    console.log({
      userId,
      fullname,
      fatherid,
      mother,
      gender,
      dob,
      bloodgroup,
      username,
      password,
      famId,
      marriage,
      contact,
      address,
      education,
      profession,
      healthissue,
      islive,
    });
    if (
      !fullname ||
      !fatherid ||
      !mother ||
      !gender ||
      !dob ||
      !bloodgroup ||
      !username ||
      !password ||
      !famId ||
      !marriage ||
      !contact ||
      !address ||
      !education ||
      !profession ||
      !healthissue ||
      !islive
    ) {
      return res.json({
        success: false,
        message: "Complete Profile Data Missing",
      });
    }

    console.log(contact);
    const parsedContact = JSON.parse(contact);
    //Validating email format
    if (!validator.isEmail(parsedContact.email)) {
      return res.json({ success: false, message: "Enter a Valid Email" });
    }

    //Hashing user password...
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await userModel.findByIdAndUpdate(userId, {
      fullname,
      fatherid,
      mother,
      gender,
      dob,
      bloodgroup,
      username,
      password: hashedPassword,
      familyid: famId,
      marriage: JSON.parse(marriage),
      contact: parsedContact,
      address: JSON.parse(address),
      education: JSON.parse(education),
      profession: JSON.parse(profession),
      healthissue,
      islive,
      isComplete: true,
    });

    res.json({ success: true, message: "Profile Completed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to edit user profile from family section...
const editProfile = async (req, res) => {
  try {
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
      education,
      profession,
      healthissue,
      islive,
    } = req.body;

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
      !education ||
      !profession ||
      !healthissue ||
      !islive
    ) {
      return res.json({
        success: false,
        message: "Profile Data Missing",
      });
    }

    const parsedContact = JSON.parse(contact);
    //Validating email format
    if (!validator.isEmail(parsedContact.email)) {
      return res.json({ success: false, message: "Enter a Valid Email" });
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
      contact: parsedContact,
      address: JSON.parse(address),
      education: JSON.parse(education),
      profession: JSON.parse(profession),
      healthissue,
      islive,
    });

    res.json({ success: true, message: "Profile Updated Successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to delete user profile from family section... ---> [ChatGPT generated].
const deleteProfile = async (req, res) => {
  try {
    console.log("DELETE SECTION: ", req.body);
    const { userId, famId } = req.body;

    // Check if required data is provided
    if (!userId || !famId) {
      return res.json({
        success: false,
        message: "User ID and Family ID are required",
      });
    }

    // Check if user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Check if family exists
    const family = await familyModel.findById(famId);
    if (!family) {
      return res.json({
        success: false,
        message: "Family not found",
      });
    }

    // Check if user belongs to this family
    if (!family.memberids.includes(userId)) {
      return res.json({
        success: false,
        message: "User does not belong to this family",
      });
    }

    // Remove user from family's memberids array
    family.memberids = family.memberids.filter(
      (memberId) => memberId.toString() !== userId.toString()
    );
    await family.save();

    // Delete the user document
    await userModel.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export {
  registerFamily,
  loginFamily,
  getProfile,
  updateProfile,
  addMember,
  completeProfile,
  editProfile,
  deleteProfile,
};
