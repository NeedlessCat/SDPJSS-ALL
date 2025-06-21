import React, { useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";

const ProfileSection = () => {
  const { userData, setUserData, utoken, backendUrl, loadUserData } =
    useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(false);

  const updateUserProfileData = async () => {
    try {
      const formData = new FormData();
      formData.append("fullname", userData.fullname || "");
      formData.append("fatherid", userData.fatherid || "");
      formData.append("mother", userData.mother || "");
      formData.append("gender", userData.gender || "");
      formData.append("dob", userData.dob || "");
      formData.append("bloodgroup", userData.bloodgroup || "");
      formData.append("username", userData.username || "");
      formData.append("marriage", JSON.stringify(userData.marriage || {}));
      formData.append("contact", JSON.stringify(userData.contact || {}));
      formData.append("address", JSON.stringify(userData.address || {}));
      formData.append("profession", JSON.stringify(userData.profession || {}));
      formData.append("education", JSON.stringify(userData.education || {}));
      formData.append("healthissue", userData.healthissue || "");
      formData.append("islive", userData.islive || true);

      image && formData.append("image", image);

      const response = await fetch(backendUrl + "/api/user/update-profile", {
        method: "POST",
        body: formData,
        headers: { utoken },
      });

      const data = await response.json();

      if (data.success) {
        alert("Profile updated successfully!");
        await loadUserData();
        setIsEdit(false);
        setImage(false);
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Error: " + error.message);
    }
  };

  return (
    userData && (
      <div className="bg-gray-50 min-h-screen p-1 sm:p-2 lg:p-6">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center space-y-4">
            {isEdit ? (
              <label htmlFor="image">
                <div className="relative cursor-pointer">
                  <img
                    className="w-32 h-32 rounded-full object-cover opacity-75 border-4 border-red-200"
                    src={
                      image
                        ? URL.createObjectURL(image)
                        : userData.image ||
                          `https://ui-avatars.com/api/?name=${userData.fullname}&background=ef4444&color=fff`
                    }
                    alt="Profile"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                </div>
                <input
                  onChange={(e) => setImage(e.target.files[0])}
                  type="file"
                  id="image"
                  hidden
                  accept="image/*"
                />
              </label>
            ) : (
              <img
                className="w-32 h-32 rounded-full object-cover border-4 border-red-200"
                src={
                  userData.image ||
                  `https://ui-avatars.com/api/?name=${userData.fullname}&background=ef4444&color=fff`
                }
                alt="Profile"
              />
            )}

            {isEdit ? (
              <input
                className="bg-red-50 text-2xl font-medium text-center border-2 border-red-200 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
                value={userData.fullname || ""}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, fullname: e.target.value }))
                }
                type="text"
                placeholder="Full Name"
              />
            ) : (
              <h1 className="font-medium text-2xl text-gray-800">
                {userData.fullname || "User Name"}
              </h1>
            )}
          </div>

          <hr className="bg-red-300 h-[1px] border-none" />

          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg border-2 border-red-100">
            <p className="text-red-600 font-semibold text-lg mb-4">
              BASIC INFORMATION
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-700 mb-1">Username:</p>
                {isEdit ? (
                  <input
                    className="w-full bg-red-50 border border-red-200 rounded px-3 py-2 focus:outline-none focus:border-red-500"
                    value={userData.username || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    type="text"
                  />
                ) : (
                  <p className="text-red-500">
                    {userData.username || "username"}
                  </p>
                )}
              </div>

              <div>
                <p className="font-medium text-gray-700 mb-1">Father ID:</p>
                {isEdit ? (
                  <input
                    className="w-full bg-red-50 border border-red-200 rounded px-3 py-2 focus:outline-none focus:border-red-500"
                    value={userData.fatherid || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        fatherid: e.target.value,
                      }))
                    }
                    type="text"
                  />
                ) : (
                  <p className="text-gray-600">
                    {userData.fatherid || "Not specified"}
                  </p>
                )}
              </div>

              <div>
                <p className="font-medium text-gray-700 mb-1">Mother's Name:</p>
                {isEdit ? (
                  <input
                    className="w-full bg-red-50 border border-red-200 rounded px-3 py-2 focus:outline-none focus:border-red-500"
                    value={userData.mother || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        mother: e.target.value,
                      }))
                    }
                    type="text"
                  />
                ) : (
                  <p className="text-gray-600">
                    {userData.mother || "Not specified"}
                  </p>
                )}
              </div>

              <div>
                <p className="font-medium text-gray-700 mb-1">Gender:</p>
                {isEdit ? (
                  <select
                    className="w-full bg-red-50 border border-red-200 rounded px-3 py-2 focus:outline-none focus:border-red-500"
                    value={userData.gender || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-600">
                    {userData.gender || "Not specified"}
                  </p>
                )}
              </div>

              <div>
                <p className="font-medium text-gray-700 mb-1">Date of Birth:</p>
                {isEdit ? (
                  <input
                    className="w-full bg-red-50 border border-red-200 rounded px-3 py-2 focus:outline-none focus:border-red-500"
                    value={
                      userData.dob
                        ? new Date(userData.dob).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setUserData((prev) => ({ ...prev, dob: e.target.value }))
                    }
                    type="date"
                  />
                ) : (
                  <p className="text-gray-600">
                    {userData.dob
                      ? new Date(userData.dob).toLocaleDateString()
                      : "Not specified"}
                  </p>
                )}
              </div>

              <div>
                <p className="font-medium text-gray-700 mb-1">Blood Group:</p>
                {isEdit ? (
                  <input
                    className="w-full bg-red-50 border border-red-200 rounded px-3 py-2 focus:outline-none focus:border-red-500"
                    value={userData.bloodgroup || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        bloodgroup: e.target.value,
                      }))
                    }
                    type="text"
                  />
                ) : (
                  <p className="text-gray-600">
                    {userData.bloodgroup || "Not specified"}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <p className="font-medium text-gray-700 mb-1">Health Issues:</p>
              {isEdit ? (
                <textarea
                  className="w-full bg-red-50 border border-red-200 rounded px-3 py-2 focus:outline-none focus:border-red-500 h-20 resize-none"
                  value={userData.healthissue || ""}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      healthissue: e.target.value,
                    }))
                  }
                  placeholder="Any health conditions or allergies"
                />
              ) : (
                <p className="text-gray-600">
                  {userData.healthissue || "None specified"}
                </p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white p-6 rounded-lg border-2 border-red-100">
            <p className="text-red-600 font-semibold text-lg mb-4">
              CONTACT INFORMATION
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-700 mb-1">Email:</p>
                {isEdit ? (
                  <input
                    className="w-full bg-red-50 border border-red-200 rounded px-3 py-2 focus:outline-none focus:border-red-500"
                    value={userData.contact?.email || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, email: e.target.value },
                      }))
                    }
                    type="email"
                  />
                ) : (
                  <p className="text-red-500">
                    {userData.contact?.email || "Not specified"}
                  </p>
                )}
              </div>

              <div>
                <p className="font-medium text-gray-700 mb-1">Mobile Number:</p>
                {isEdit ? (
                  <input
                    className="w-full bg-red-50 border border-red-200 rounded px-3 py-2 focus:outline-none focus:border-red-500"
                    value={userData.contact?.mobileno?.number || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        contact: {
                          ...prev.contact,
                          mobileno: {
                            ...prev.contact?.mobileno,
                            number: e.target.value,
                          },
                        },
                      }))
                    }
                    type="tel"
                  />
                ) : (
                  <p className="text-red-500">
                    {userData.contact?.mobileno?.number || "Not specified"}
                  </p>
                )}
              </div>

              <div>
                <p className="font-medium text-gray-700 mb-1">
                  WhatsApp Number:
                </p>
                {isEdit ? (
                  <input
                    className="w-full bg-red-50 border border-red-200 rounded px-3 py-2 focus:outline-none focus:border-red-500"
                    value={userData.contact?.whatsappno || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        contact: {
                          ...prev.contact,
                          whatsappno: e.target.value,
                        },
                      }))
                    }
                    type="tel"
                  />
                ) : (
                  <p className="text-red-500">
                    {userData.contact?.whatsappno || "Not specified"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white p-6 rounded-lg border-2 border-red-100">
            <p className="text-red-600 font-semibold text-lg mb-4">
              ADDRESS INFORMATION
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="font-medium text-gray-700 mb-1">Country:</p>
                {isEdit ? (
                  <input
                    className="w-full bg-red-50 border border-red-200 rounded px-3 py-2 focus:outline-none focus:border-red-500"
                    value={userData.address?.country || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        address: { ...prev.address, country: e.target.value },
                      }))
                    }
                    type="text"
                  />
                ) : (
                  <p className="text-gray-600">
                    {userData.address?.country || "Not specified"}
                  </p>
                )}
              </div>

              <div>
                <p className="font-medium text-gray-700 mb-1">State:</p>
                {isEdit ? (
                  <input
                    className="w-full bg-red-50 border border-red-200 rounded px-3 py-2 focus:outline-none focus:border-red-500"
                    value={userData.address?.state || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        address: { ...prev.address, state: e.target.value },
                      }))
                    }
                    type="text"
                  />
                ) : (
                  <p className="text-gray-600">
                    {userData.address?.state || "Not specified"}
                  </p>
                )}
              </div>

              <div>
                <p className="font-medium text-gray-700 mb-1">District:</p>
                {isEdit ? (
                  <input
                    className="w-full bg-red-50 border border-red-200 rounded px-3 py-2 focus:outline-none focus:border-red-500"
                    value={userData.address?.district || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        address: { ...prev.address, district: e.target.value },
                      }))
                    }
                    type="text"
                  />
                ) : (
                  <p className="text-gray-600">
                    {userData.address?.district || "Not specified"}
                  </p>
                )}
              </div>

              <div>
                <p className="font-medium text-gray-700 mb-1">City:</p>
                {isEdit ? (
                  <input
                    className="w-full bg-red-50 border border-red-200 rounded px-3 py-2 focus:outline-none focus:border-red-500"
                    value={userData.address?.city || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        address: { ...prev.address, city: e.target.value },
                      }))
                    }
                    type="text"
                  />
                ) : (
                  <p className="text-gray-600">
                    {userData.address?.city || "Not specified"}
                  </p>
                )}
              </div>

              <div>
                <p className="font-medium text-gray-700 mb-1">PIN Code:</p>
                {isEdit ? (
                  <input
                    className="w-full bg-red-50 border border-red-200 rounded px-3 py-2 focus:outline-none focus:border-red-500"
                    value={userData.address?.pin || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        address: { ...prev.address, pin: e.target.value },
                      }))
                    }
                    type="text"
                  />
                ) : (
                  <p className="text-gray-600">
                    {userData.address?.pin || "Not specified"}
                  </p>
                )}
              </div>

              <div>
                <p className="font-medium text-gray-700 mb-1">
                  Street Address:
                </p>
                {isEdit ? (
                  <input
                    className="w-full bg-red-50 border border-red-200 rounded px-3 py-2 focus:outline-none focus:border-red-500"
                    value={userData.address?.street || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        address: { ...prev.address, street: e.target.value },
                      }))
                    }
                    type="text"
                  />
                ) : (
                  <p className="text-gray-600">
                    {userData.address?.street || "Not specified"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Education and Profession */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Education */}
            <div className="bg-white p-6 rounded-lg border-2 border-red-100">
              <p className="text-red-600 font-semibold text-lg mb-4">
                EDUCATION
              </p>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-700 mb-1">
                    Education Level:
                  </p>
                  {isEdit ? (
                    <input
                      className="w-full bg-red-50 border border-red-200 rounded px-3 py-2 focus:outline-none focus:border-red-500"
                      value={userData.education?.upto || ""}
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev,
                          education: {
                            ...prev.education,
                            upto: e.target.value,
                          },
                        }))
                      }
                      type="text"
                    />
                  ) : (
                    <p className="text-gray-600">
                      {userData.education?.upto || "Not specified"}
                    </p>
                  )}
                </div>

                <div>
                  <p className="font-medium text-gray-700 mb-1">
                    Qualification:
                  </p>
                  {isEdit ? (
                    <input
                      className="w-full bg-red-50 border border-red-200 rounded px-3 py-2 focus:outline-none focus:border-red-500"
                      value={userData.education?.qualification || ""}
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev,
                          education: {
                            ...prev.education,
                            qualification: e.target.value,
                          },
                        }))
                      }
                      type="text"
                    />
                  ) : (
                    <p className="text-gray-600">
                      {userData.education?.qualification || "Not specified"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Profession */}
            <div className="bg-white p-6 rounded-lg border-2 border-red-100">
              <p className="text-red-600 font-semibold text-lg mb-4">
                PROFESSION
              </p>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-700 mb-1">Category:</p>
                  {isEdit ? (
                    <input
                      className="w-full bg-red-50 border border-red-200 rounded px-3 py-2 focus:outline-none focus:border-red-500"
                      value={userData.profession?.category || ""}
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev,
                          profession: {
                            ...prev.profession,
                            category: e.target.value,
                          },
                        }))
                      }
                      type="text"
                    />
                  ) : (
                    <p className="text-gray-600">
                      {userData.profession?.category || "Not specified"}
                    </p>
                  )}
                </div>

                <div>
                  <p className="font-medium text-gray-700 mb-1">Job Title:</p>
                  {isEdit ? (
                    <input
                      className="w-full bg-red-50 border border-red-200 rounded px-3 py-2 focus:outline-none focus:border-red-500"
                      value={userData.profession?.job || ""}
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev,
                          profession: {
                            ...prev.profession,
                            job: e.target.value,
                          },
                        }))
                      }
                      type="text"
                    />
                  ) : (
                    <p className="text-gray-600">
                      {userData.profession?.job || "Not specified"}
                    </p>
                  )}
                </div>

                <div>
                  <p className="font-medium text-gray-700 mb-1">
                    Specialization:
                  </p>
                  {isEdit ? (
                    <input
                      className="w-full bg-red-50 border border-red-200 rounded px-3 py-2 focus:outline-none focus:border-red-500"
                      value={userData.profession?.specialization || ""}
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev,
                          profession: {
                            ...prev.profession,
                            specialization: e.target.value,
                          },
                        }))
                      }
                      type="text"
                    />
                  ) : (
                    <p className="text-gray-600">
                      {userData.profession?.specialization || "Not specified"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center mt-8">
            {isEdit ? (
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-medium transition-all duration-200 transform hover:scale-105"
                onClick={updateUserProfileData}
              >
                Save Information
              </button>
            ) : (
              <button
                className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-8 py-3 rounded-full font-medium transition-all duration-200 transform hover:scale-105"
                onClick={() => setIsEdit(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default ProfileSection;
