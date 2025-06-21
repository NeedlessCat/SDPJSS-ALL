import React from "react";
import { X, User, UserPlus, Edit3, Save, Plus } from "lucide-react";

import { assets, family } from "../assets/assets";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useState } from "react";
import { toast } from "react-toastify";
import EditFamilyForm from "../components/modalbox/EditFamilyForm";
import AddMemberForm from "../components/modalbox/AddMemberForm";
import CompleteProfileForm from "../components/modalbox/CompleteProfileForm";
import EditProfileForm from "../components/modalbox/EditProfileForm";
import ShowDetailsForm from "../components/modalbox/ShowDetailsForm";
import Modal from "../components/modalbox/Modal";
import axios from "axios";

const FamilyPortal = () => {
  const { token, familyData, setFamilyData, loadUserProfileData, backendUrl } =
    useContext(AppContext);

  // Variables to Edit Family Details
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  // Variables to Complete Member Profiles
  const [showCompleteProfileModal, setShowCompleteProfileModal] =
    useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  // Variables to Edit Member Profiles
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [selectedMemberForEdit, setSelectedMemberForEdit] = useState(null);
  // Variables to Show Member Details
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMemberForDetails, setSelectedMemberForDetails] =
    useState(null);
  // Variables to Delete Member Details
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMemberForDelete, setSelectedMemberForDelete] = useState(null);

  const handleCompleteProfile = (member) => {
    setSelectedMember(member);
    setShowCompleteProfileModal(true);
  };

  const handleEditProfile = (member) => {
    setSelectedMemberForEdit(member);
    setShowEditProfileModal(true);
  };

  const handleShowDetails = (member) => {
    setSelectedMemberForDetails(member);
    setShowDetailsModal(true);
  };

  const handleDeleteProfile = (member) => {
    setSelectedMemberForDelete(member);
    setShowDeleteModal(true);
  };

  const confirmDelete = async (member) => {
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/family/delete-member`,
        {
          headers: { token },
          data: {
            userId: member._id,
            famId: familyData._id,
          },
        }
      );

      if (data.success) {
        toast.success(data.message || "Member deleted successfully");
        setShowDeleteModal(false);
        setSelectedMemberForDelete(null);
        loadUserProfileData(); // Refresh data
      } else {
        toast.error(data.message || "Failed to delete member");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting member");
    }
  };

  return (
    familyData && (
      <div className="p-4">
        {/* Edit Modal */}
        <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
          <h2 className="text-xl font-bold mb-4">Edit Family Details</h2>
          <EditFamilyForm
            initialData={familyData}
            onClose={() => setShowEditModal(false)}
            onSuccess={loadUserProfileData}
          />
        </Modal>

        {/* Add Member Modal */}
        <Modal
          show={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
        >
          <h2 className="text-xl font-bold mb-4">Add Family Member</h2>
          <AddMemberForm onClose={() => setShowAddMemberModal(false)} />
        </Modal>

        {/* Complete Profile Modal */}
        <Modal
          show={showCompleteProfileModal}
          onClose={() => {
            setShowCompleteProfileModal(false);
            setSelectedMember(null);
          }}
        >
          <h2 className="text-xl font-bold mb-4">
            Complete Profile - {selectedMember?.fullname}
          </h2>
          {selectedMember && (
            <CompleteProfileForm
              member={selectedMember}
              onClose={() => {
                setShowCompleteProfileModal(false);
                setSelectedMember(null);
              }}
              onSuccess={loadUserProfileData}
            />
          )}
        </Modal>

        {/* Edit Profile Modal */}
        <Modal
          show={showEditProfileModal}
          onClose={() => {
            setShowEditProfileModal(false);
            setSelectedMemberForEdit(null);
          }}
        >
          <h2 className="text-xl font-bold mb-4">
            Edit Profile - {selectedMemberForEdit?.fullname}
          </h2>
          {selectedMemberForEdit && (
            <EditProfileForm
              member={selectedMemberForEdit}
              onClose={() => {
                setShowEditProfileModal(false);
                setSelectedMemberForEdit(null);
              }}
              onSuccess={loadUserProfileData}
            />
          )}
        </Modal>

        {/* Show Details Modal */}
        <Modal
          show={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedMemberForDetails(null);
          }}
        >
          <h2 className="text-xl font-bold mb-4 text-red-800">
            Member Details - {selectedMemberForDetails?.fullname}
          </h2>
          {selectedMemberForDetails && (
            <ShowDetailsForm
              member={selectedMemberForDetails}
              onClose={() => {
                setShowDetailsModal(false);
                setSelectedMemberForDetails(null);
              }}
            />
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          show={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedMemberForDelete(null);
          }}
        >
          <h2 className="text-xl font-bold mb-4 text-red-600">
            Delete Member - {selectedMemberForDelete?.fullname}
          </h2>
          {selectedMemberForDelete && (
            <div className="text-center">
              <p className="mb-4">
                Are you sure you want to delete this member? This action cannot
                be undone.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedMemberForDelete(null);
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDelete(selectedMemberForDelete)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Family Details */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* <div className="sm:w-72 w-full">
            <img
              className="bg-primary w-full rounded-lg"
              src={assets.familyLogo}
              alt=""
            />
          </div> */}
          <div className="flex-1 border border-gray-400 rounded-lg p-6 bg-white mx-2 sm:mx-0 sm:mt-0">
            {/* Doc Info */}
            <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
              {familyData.familyname}
              <img className="w-5" src={assets.verified_icon} alt="" />
            </p>
            <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
              <button className="py-0.5 px-2 border text-xs rounded-full">
                Family ID : {familyData.familyid}
              </button>
            </div>
            {/* About Family */}
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
                About <img src={assets.info_icon} alt="" />
              </p>
              <p className="text-sm text-gray-500 mt-1">
                <u>Address</u> : {familyData.familyaddress}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                <u>Pariksh-Gotra</u> : {familyData.gotra}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                <u>Email</u> : {familyData.email}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                <u>Mobile</u> :{" "}
                {familyData.mobile.code + " " + familyData.mobile.number}
              </p>
            </div>
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button
                onClick={() => setShowEditModal(true)}
                className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-700 hover:text-white transition-all duration-300"
              >
                Edit
              </button>
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-700 hover:text-white transition-all duration-300"
              >
                Add Members
              </button>
            </div>
          </div>
        </div>
        <div>
          <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
            List of Members
          </p>
          <div>
            {familyData.memberids.map((item, index) => (
              <div
                className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
                key={index}
              >
                <div>
                  <img
                    className="w-32 bd-ingigo-50"
                    src={item.gender == "male" ? assets.male : assets.female}
                    alt=""
                  />
                </div>
                <div className="flex-1 text-sm text-zinc-600">
                  <p className="text-neutral-800 text-lg font-bold">
                    {item.fullname}
                  </p>
                  <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
                    <button className="py-0.5 px-2 border text-xs rounded-full">
                      ID : {item.id || 2}
                    </button>
                    <button className="py-0.5 px-2 border text-xs rounded-full">
                      Father ID : {item.fatherid}
                    </button>
                  </div>
                  <p className="text-zinc-700 font-medium mt-1">
                    Blood Group:{" "}
                    <span className="text-xs">{item.bloodgroup}</span>
                  </p>

                  <p className="text-zinc-700 font-medium mt-1">
                    Mother: <span className="text-xs">{item.mother}</span>
                  </p>
                  <p className="text-zinc-700 font-medium mt-1">
                    Date of Birth: <span className="text-xs">{item.dob}</span>
                  </p>
                </div>
                <div></div>
                <div className="flex flex-col gap-2 justify-end">
                  <button
                    onClick={() => handleDeleteProfile(item)}
                    className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border border-red-500 rounded text-red-500 hover:bg-red-700 hover:text-white transition-all duration-300"
                  >
                    Delete Member
                  </button>
                  {
                    <button
                      onClick={() => handleEditProfile(item)}
                      className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-700 hover:text-white transition-all duration-300"
                    >
                      Edit Profile
                    </button>
                  }

                  {item.isComplete ? (
                    <button
                      onClick={() => handleShowDetails(item)}
                      className="sm:min-w-48 py-2 border border-blue-500 rounded text-blue-500 hover:bg-blue-700 hover:text-white transition-all duration-300"
                    >
                      Show Details
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCompleteProfile(item)}
                      className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500 hover:bg-green-700 hover:text-white transition-all duration-300"
                    >
                      Complete Profile
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  );
};

export default FamilyPortal;
