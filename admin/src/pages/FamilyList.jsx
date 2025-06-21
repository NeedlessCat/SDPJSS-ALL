import React, { useState, useEffect, useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import {
  ChevronDown,
  ChevronRight,
  Users,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Loader,
  Check,
  AlertCircle,
} from "lucide-react";

const FamilyList = () => {
  const { getFamilyList } = useContext(AdminContext);
  const [expandedFamily, setExpandedFamily] = useState(null); // Changed from Set to single value
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalFamilies, setTotalFamilies] = useState(0);

  // Fetch family data on component mount
  useEffect(() => {
    const fetchFamilies = async () => {
      setLoading(true);
      const data = await getFamilyList();
      if (data) {
        setFamilies(data.families);
        setTotalFamilies(data.count);
      }
      setLoading(false);
    };

    fetchFamilies();
  }, [getFamilyList]);

  const toggleFamilyExpansion = (familyId) => {
    // If clicking on already expanded family, collapse it
    // If clicking on different family, expand it (and collapse previous)
    setExpandedFamily(expandedFamily === familyId ? null : familyId);
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl sm:text-3xl font-bold ${color}`}>
            {value.toLocaleString()}
          </p>
        </div>
        <div
          className={`p-3 rounded-full ${color
            .replace("text-", "bg-")
            .replace("-600", "-100")}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading families...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Family Management
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Manage and view all registered families and their members
        </p>
      </div>

      {/* Statistics Card */}
      <div className="mb-6 sm:mb-8 max-w-sm">
        <StatCard
          title="Total Families"
          value={totalFamilies}
          icon={<Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />}
          color="text-blue-600"
        />
      </div>

      {/* Family List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Registered Families
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {families.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No families registered yet</p>
            </div>
          ) : (
            families.map((family) => {
              const isExpanded = expandedFamily === family._id; // Changed comparison
              console.log(family);
              // Filter to show only approved members
              const approvedMembers =
                family.memberids?.filter(
                  (member) => member.isApproved === "approved"
                ) || [];

              return (
                <div key={family._id} className="p-3 sm:p-6">
                  {/* Family Header */}
                  <div
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 sm:p-4 rounded-lg transition-colors"
                    onClick={() => toggleFamilyExpansion(family._id)}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mb-1 sm:mb-2">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-lg">
                            {family.familyname}
                          </h3>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full w-fit">
                            ID: {family.familyid}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                          <span className="flex items-center gap-1 sm:gap-2">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">
                              {family.familyaddress
                                ?.split(",")
                                .slice(0, 2)
                                .join(", ") || "Address not provided"}
                            </span>
                          </span>
                          <span className="flex items-center gap-1 sm:gap-2">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>
                              {approvedMembers.length} approved member
                              {approvedMembers.length !== 1 ? "s" : ""}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Registration date */}
                    <div className="hidden sm:block text-right text-xs text-gray-500 flex-shrink-0 ml-4">
                      <div className="font-medium">Registered</div>
                      <div>
                        {new Date(family.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Family Details */}
                  {isExpanded && (
                    <div className="mt-4 sm:mt-6 ml-0 sm:ml-8 space-y-4 sm:space-y-6">
                      {/* Family Info */}
                      <div className="bg-gray-50 rounded-xl p-3 sm:p-6">
                        <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                          Family Information
                        </h4>
                        <div className="grid grid-cols-1 gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                            <span className="truncate text-xs sm:text-sm">
                              {family.email || "Email not provided"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                            <span className="text-xs sm:text-sm">
                              {family.mobile?.code} {family.mobile?.number}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                            <span className="text-xs sm:text-sm">
                              Gotra: {family.gotra || "Not specified"}
                            </span>
                          </div>
                          <div className="flex items-start gap-2 sm:gap-3">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                            <span className="break-words text-xs sm:text-sm">
                              {family.familyaddress || "Address not provided"}
                            </span>
                          </div>
                          <div className="sm:hidden flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-gray-500 flex-shrink-0" />
                            <span className="text-xs">
                              Registered:{" "}
                              {new Date(family.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Approved Members List */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                          <UserCheck className="w-3 h-3 sm:w-5 sm:h-5" />
                          Approved Family Members ({approvedMembers.length})
                        </h4>

                        {approvedMembers.length === 0 ? (
                          <div className="text-center py-6 sm:py-8">
                            <p className="text-gray-500 text-xs sm:text-sm italic">
                              No approved members yet
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {approvedMembers.map((member) => (
                              <div
                                key={member._id}
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 text-sm truncate mb-1">
                                      {member.fullname}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 ml-3">
                                    {/* Status Icon */}
                                    <div className="flex items-center justify-center">
                                      {member.isComplete ? (
                                        <Check className="w-4 h-4 text-green-600" />
                                      ) : (
                                        <AlertCircle className="w-4 h-4 text-orange-500" />
                                      )}
                                    </div>

                                    {/* Gender Badge */}
                                    <div
                                      className={`w-6 h-6 rounded flex items-center justify-center text-xs font-semibold text-white ${
                                        member.gender?.toLowerCase() ===
                                          "male" ||
                                        member.gender?.toLowerCase() === "m"
                                          ? "bg-blue-500"
                                          : member.gender?.toLowerCase() ===
                                              "female" ||
                                            member.gender?.toLowerCase() === "f"
                                          ? "bg-pink-500"
                                          : "bg-gray-400"
                                      }`}
                                    >
                                      {member.gender?.toLowerCase() ===
                                        "male" ||
                                      member.gender?.toLowerCase() === "m"
                                        ? "M"
                                        : member.gender?.toLowerCase() ===
                                            "female" ||
                                          member.gender?.toLowerCase() === "f"
                                        ? "F"
                                        : "?"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyList;
