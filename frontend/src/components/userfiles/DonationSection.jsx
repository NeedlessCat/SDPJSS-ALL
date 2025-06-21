import React, { useState, useEffect } from "react";
import {
  Plus,
  Heart,
  Calendar,
  DollarSign,
  Filter,
  X,
  CreditCard,
  Loader,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";

const DonationModal = ({ isOpen, onClose, onSuccess, backendUrl, utoken }) => {
  const [formData, setFormData] = useState({
    amount: "",
    purpose: "",
    method: "",
    remarks: "",
    profession: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState("form");
  const [amountError, setAmountError] = useState("");

  // Profession options for Durga Puja
  const professionOptions = [
    { value: "Bunkar", label: "Bunkar", minAmount: 1000 },
    { value: "Baniya", label: "Baniya", minAmount: 1200 },
    { value: "Munib", label: "Munib", minAmount: 1500 },
    { value: "Badhai", label: "Badhai", minAmount: 2000 },
    { value: "Teacher", label: "Teacher", minAmount: 5000 },
    { value: "Public Officer", label: "Public Officer", minAmount: 6000 },
    { value: "Private Employee", label: "Private Employee", minAmount: 7000 },
  ];

  // Purpose options
  const purposeOptions = [
    { value: "Society", label: "Society" },
    { value: "Personal", label: "Personal" },
    { value: "Durga Puja", label: "Durga Puja" },
    { value: "Event", label: "Event" },
    { value: "Others", label: "Others" },
  ];

  useEffect(() => {
    if (isOpen) {
      setFormData({
        amount: "",
        purpose: "",
        method: "",
        remarks: "",
        profession: "",
      });
      setCurrentStep("form");
      setIsProcessing(false);
      setAmountError("");
    }
  }, [isOpen]);

  useEffect(() => {
    // Validate amount when purpose is Durga Puja and profession is selected
    if (formData.purpose === "Durga Puja" && formData.profession) {
      const selectedProfession = professionOptions.find(
        (p) => p.value === formData.profession
      );
      if (selectedProfession && parseFloat(formData.amount) > 0) {
        if (parseFloat(formData.amount) < selectedProfession.minAmount) {
          setAmountError(
            `Minimum amount for ${formData.profession} is ₹${selectedProfession.minAmount}`
          );
        } else {
          setAmountError("");
        }
      }
    } else {
      setAmountError("");
    }
  }, [formData.amount, formData.purpose, formData.profession]);

  const handleSubmit = async () => {
    // Additional validation for Durga Puja donations
    if (formData.purpose === "Durga Puja" && !formData.profession) {
      alert("Please select your profession for Durga Puja donation");
      return;
    }

    if (amountError) {
      alert(amountError);
      return;
    }

    if (!formData.amount || !formData.purpose || !formData.method) {
      alert("Please fill in all required fields");
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    if (parseFloat(formData.amount) > 1000000) {
      alert("Amount cannot exceed ₹10,00,000");
      return;
    }

    setIsProcessing(true);
    setCurrentStep("processing");

    try {
      const response = await axios.post(
        `${backendUrl}/api/user/create-donation-order`,
        {
          amount: parseFloat(formData.amount),
          purpose: formData.purpose,
          method: formData.method,
          remarks: formData.remarks,
          profession: formData.profession || undefined, // Only send if exists
        },
        {
          headers: {
            utoken,
          },
        }
      );

      const data = response.data;

      if (!data.success) {
        throw new Error("Failed to create donation order");
      }

      if (!data.paymentRequired) {
        const newDonation = {
          ...data.donation,
          id: data.donation._id,
          date: new Date(data.donation.createdAt).toLocaleDateString("en-IN"),
          paymentMethod: data.donation.method,
          transactionId: data.donation.transactionId,
          paymentStatus: data.donation.paymentStatus || "completed",
        };

        onSuccess(newDonation);
        onClose();
        alert("Cash donation recorded successfully!");
        return;
      }

      if (typeof window.Razorpay === "undefined") {
        throw new Error(
          "Razorpay SDK not loaded. Please refresh the page and try again."
        );
      }

      setCurrentStep("payment");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Donation Platform",
        description: `Donation for ${formData.purpose}`,
        order_id: data.order.id,
        receipt: data.order.receipt,
        handler: async (response) => {
          try {
            const verifyResponse = await axios.post(
              `${backendUrl}/api/user/verify-donation-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                donationId: data.donationId,
              },
              {
                headers: {
                  utoken,
                },
              }
            );

            const verifyData = verifyResponse.data;

            if (verifyData.success) {
              const newDonation = {
                ...verifyData.donation,
                id: verifyData.donation._id,
                date: new Date(
                  verifyData.donation.createdAt
                ).toLocaleDateString("en-IN"),
                paymentMethod: verifyData.donation.method,
                paymentStatus: verifyData.donation.paymentStatus || "completed",
              };

              onSuccess(newDonation);
              onClose();
              alert("Payment successful! Thank you for your donation.");
            } else {
              throw new Error(
                verifyData.message || "Payment verification failed"
              );
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            alert("Payment verification failed. Please contact support.");
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setCurrentStep("form");
            setIsProcessing(false);
          },
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        notes: {
          purpose: formData.purpose,
          donation_id: data.donationId,
        },
        theme: {
          color: "#ef4444",
        },
        timeout: 300,
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
        setCurrentStep("form");
        setIsProcessing(false);
      });

      razorpay.open();
    } catch (error) {
      console.error("Donation error:", error);
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to process donation. Please try again."
      );
      setIsProcessing(false);
      setCurrentStep("form");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-red-600">
            {currentStep === "processing"
              ? "Processing Donation"
              : currentStep === "payment"
              ? "Complete Payment"
              : "Add New Donation"}
          </h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {currentStep === "processing" && (
            <div className="text-center py-8">
              <Loader className="animate-spin mx-auto h-12 w-12 text-red-500 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Processing your donation...
              </p>
              <p className="text-gray-600">
                Please wait while we prepare your payment.
              </p>
            </div>
          )}

          {currentStep === "payment" && (
            <div className="text-center py-8">
              <CreditCard className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Complete your payment
              </p>
              <p className="text-gray-600">
                A payment window should have opened. Please complete your
                payment there.
              </p>
            </div>
          )}

          {currentStep === "form" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (
                        value === "" ||
                        (parseFloat(value) >= 0 && parseFloat(value) <= 1000000)
                      ) {
                        setFormData({ ...formData, amount: value });
                      }
                    }}
                    placeholder="Enter donation amount"
                    min="1"
                    max="1000000"
                    step="1"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 focus:bg-white transition-colors"
                    required
                    disabled={isProcessing}
                  />
                  {amountError && (
                    <p className="mt-1 text-sm text-red-600">{amountError}</p>
                  )}
                  {formData.purpose === "Durga Puja" && formData.profession && (
                    <p className="mt-1 text-sm text-gray-500">
                      Minimum amount for {formData.profession} is ₹
                      {professionOptions
                        .find((p) => p.value === formData.profession)
                        ?.minAmount.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose *
                  </label>
                  <select
                    value={formData.purpose}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        purpose: e.target.value,
                        profession: "",
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 focus:bg-white transition-colors"
                    required
                    disabled={isProcessing}
                  >
                    <option value="">Select purpose</option>
                    {purposeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {formData.purpose === "Durga Puja" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profession *
                    </label>
                    <select
                      value={formData.profession}
                      onChange={(e) =>
                        setFormData({ ...formData, profession: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 focus:bg-white transition-colors"
                      required
                      disabled={isProcessing}
                    >
                      <option value="">Select profession</option>
                      {professionOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label} (Min ₹
                          {option.minAmount.toLocaleString("en-IN")})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    value={formData.method}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        method: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 focus:bg-white transition-colors"
                    required
                    disabled={isProcessing}
                  >
                    <option value="">Select method</option>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Online">Online Banking</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks (optional)
                  </label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) =>
                      setFormData({ ...formData, remarks: e.target.value })
                    }
                    placeholder="Additional notes about the donation"
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none bg-gray-50 focus:bg-white transition-colors"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    isProcessing ||
                    !formData.amount ||
                    !formData.purpose ||
                    !formData.method ||
                    (formData.purpose === "Durga Puja" &&
                      !formData.profession) ||
                    amountError
                  }
                  className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    isProcessing ||
                    !formData.amount ||
                    !formData.purpose ||
                    !formData.method ||
                    (formData.purpose === "Durga Puja" &&
                      !formData.profession) ||
                    amountError
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  } text-white`}
                >
                  {isProcessing && <Loader className="animate-spin h-4 w-4" />}
                  {formData.method === "Cash"
                    ? "Record Donation"
                    : "Proceed to Payment"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DonationSection = () => {
  const [showModal, setShowModal] = useState(false);
  const [donations, setDonations] = useState([]);
  const [filters, setFilters] = useState({
    month: "",
    year: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
  });

  const { backendUrl, utoken } = useContext(AppContext);

  const fetchDonations = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${backendUrl}/api/user/my-donations`, {
        headers: {
          utoken,
        },
      });

      const data = response.data;

      if (data.success) {
        const formattedDonations = data.donations.map((donation) => ({
          id: donation._id,
          amount: donation.amount,
          purpose: donation.purpose,
          date: new Date(donation.createdAt).toLocaleDateString("en-IN"),
          transactionId: donation.transactionId || "N/A",
          remarks: donation.remarks || "",
          paymentMethod: donation.method,
          month: new Date(donation.createdAt).getMonth() + 1,
          year: new Date(donation.createdAt).getFullYear(),
          paymentStatus: donation.paymentStatus || "completed",
        }));

        formattedDonations.sort((a, b) => new Date(b.date) - new Date(a.date));
        setDonations(formattedDonations);

        const completedDonations = formattedDonations.filter(
          (d) => d.paymentStatus === "completed"
        );
        const totalAmount = completedDonations.reduce(
          (sum, d) => sum + d.amount,
          0
        );

        setStats({
          totalDonations: completedDonations.length,
          totalAmount,
        });
      } else {
        console.error("Failed to fetch donations:", data.message);
        alert("Failed to load donations. Please refresh the page.");
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to load donations. Please check your internet connection."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompletePayment = async (donation) => {
    setActionLoading({ ...actionLoading, [donation.id]: "payment" });

    try {
      const response = await axios.post(
        `${backendUrl}/api/user/retry-donation-payment`,
        {
          donationId: donation.id,
        },
        {
          headers: {
            utoken,
          },
        }
      );

      const data = response.data;
      if (!data.success) {
        throw new Error(data.message || "Failed to create payment order");
      }

      if (typeof window.Razorpay === "undefined") {
        throw new Error(
          "Razorpay SDK not loaded. Please refresh the page and try again."
        );
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Donation Platform",
        description: `Complete donation for ${donation.purpose}`,
        order_id: data.order.id,
        receipt: data.order.receipt,
        handler: async (response) => {
          try {
            const verifyResponse = await axios.post(
              `${backendUrl}/api/user/verify-donation-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                donationId: donation.id,
              },
              {
                headers: {
                  utoken,
                },
              }
            );

            const verifyData = verifyResponse.data;

            if (verifyData.success) {
              setDonations(
                donations.map((d) =>
                  d.id === donation.id
                    ? {
                        ...d,
                        paymentStatus: "completed",
                        transactionId: verifyData.donation.transactionId,
                      }
                    : d
                )
              );
              alert("Payment completed successfully!");
              fetchDonations();
            } else {
              throw new Error(
                verifyData.message || "Payment verification failed"
              );
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            alert("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: () => {},
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        notes: {
          purpose: donation.purpose,
          donation_id: donation.id,
        },
        theme: {
          color: "#ef4444",
        },
        timeout: 300,
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
      });

      razorpay.open();
    } catch (error) {
      console.error("Complete payment error:", error);
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to initiate payment"
      );
    } finally {
      const newActionLoading = { ...actionLoading };
      delete newActionLoading[donation.id];
      setActionLoading(newActionLoading);
    }
  };

  const handleRetryPayment = async (donation) => {
    await handleCompletePayment(donation);
  };

  const handleDeleteDonation = async (donationId) => {
    if (
      !confirm(
        "Are you sure you want to delete this donation? This action cannot be undone."
      )
    ) {
      return;
    }

    setActionLoading({ ...actionLoading, [donationId]: "delete" });

    try {
      const response = await axios.delete(
        `${backendUrl}/api/user/delete-donation/${donationId}`,
        {
          headers: {
            utoken,
          },
        }
      );

      if (response.data.success) {
        setDonations(donations.filter((d) => d.id !== donationId));
        alert("Donation deleted successfully");
        fetchDonations();
      } else {
        throw new Error(response.data.message || "Failed to delete donation");
      }
    } catch (error) {
      console.error("Delete donation error:", error);
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete donation"
      );
    } finally {
      const newActionLoading = { ...actionLoading };
      delete newActionLoading[donationId];
      setActionLoading(newActionLoading);
    }
  };

  useEffect(() => {
    if (utoken && backendUrl) {
      fetchDonations();
    }
  }, [utoken, backendUrl]);

  const handleNewDonation = () => {
    setShowModal(true);
  };

  const handleModalSuccess = (newDonation) => {
    setDonations([newDonation, ...donations]);
    if (newDonation.paymentStatus === "completed") {
      const newTotalAmount = stats.totalAmount + newDonation.amount;
      setStats({
        totalDonations: stats.totalDonations + 1,
        totalAmount: newTotalAmount,
      });
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const getPaymentMethodBadge = (method) => {
    const colors = {
      UPI: "bg-green-100 text-green-800",
      Card: "bg-blue-100 text-blue-800",
      Cash: "bg-yellow-100 text-yellow-800",
      Online: "bg-purple-100 text-purple-800",
    };
    return colors[method] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusBadge = (status) => {
    const configs = {
      completed: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        text: "Completed",
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        text: "Pending",
      },
      failed: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        text: "Failed",
      },
    };
    return configs[status] || configs.completed;
  };

  const filteredDonations = donations.filter((donation) => {
    if (filters.month && donation.month !== parseInt(filters.month)) {
      return false;
    }
    if (filters.year && donation.year !== parseInt(filters.year)) {
      return false;
    }
    return true;
  });

  const availableYears = [...new Set(donations.map((d) => d.year))].sort(
    (a, b) => b - a
  );

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const filteredCompletedDonations = filteredDonations.filter(
    (d) => d.paymentStatus === "completed"
  );
  const filteredTotalAmount = filteredCompletedDonations.reduce(
    (sum, donation) => sum + donation.amount,
    0
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading donations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Donations
          </h1>
          <button
            onClick={handleNewDonation}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors w-full sm:w-auto shadow-sm"
          >
            <Plus size={18} />
            <span>Add Donation</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <Heart className="text-red-500 w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Completed Donations
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredCompletedDonations.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <DollarSign className="text-green-500 w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{filteredTotalAmount.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Filter className="text-blue-500 w-5 h-5" /> {/* Updated color */}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Filter Donations
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <select
                value={filters.month}
                onChange={(e) =>
                  setFilters({ ...filters, month: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Months</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <select
                value={filters.year}
                onChange={(e) =>
                  setFilters({ ...filters, year: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Years</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ month: "", year: "" })}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <X size={18} />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Your Donations ({filteredDonations.length})
          </h3>
        </div>

        {filteredDonations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            {" "}
            {/* Updated styling and padding */}
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              {" "}
              {/* Added background circle */}
              <Heart className="w-8 h-8 text-red-400" />{" "}
              {/* Updated size and color */}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {" "}
              {/* Updated font size */}
              No donations found
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              {" "}
              {/* Updated color and added max-width */}
              Start making a difference by adding your first donation.
            </p>
            <button
              onClick={handleNewDonation}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto transition-colors" /* Added font-medium and updated padding */
            >
              <Plus size={18} />
              Add Your First Donation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredDonations.map((donation) => {
              const statusConfig = getPaymentStatusBadge(
                donation.paymentStatus
              );
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={donation.id}
                  className="bg-white rounded-lg shadow border p-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="text-xl font-bold text-gray-900">
                        ₹{donation.amount.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="text-lg text-gray-900">{donation.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}
                      >
                        <StatusIcon size={14} />
                        {statusConfig.text}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Purpose</p>
                      <p className="text-lg text-gray-900">
                        {donation.purpose}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentMethodBadge(
                          donation.paymentMethod
                        )}`}
                      >
                        {donation.paymentMethod}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Transaction ID</p>
                      <p className="text-lg text-gray-900 break-all">
                        {donation.transactionId}
                      </p>
                    </div>
                  </div>

                  {donation.remarks && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Remarks</p>
                      <p className="text-gray-900">{donation.remarks}</p>
                    </div>
                  )}

                  {(donation.paymentStatus === "pending" ||
                    donation.paymentStatus === "failed") && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {donation.paymentStatus === "pending" &&
                        donation.paymentMethod !== "Cash" && (
                          <button
                            onClick={() => handleCompletePayment(donation)}
                            disabled={actionLoading[donation.id] === "payment"}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md"
                          >
                            {actionLoading[donation.id] === "payment" ? (
                              <Loader className="animate-spin h-4 w-4" />
                            ) : (
                              <CreditCard size={16} />
                            )}
                            Complete Payment
                          </button>
                        )}

                      {donation.paymentStatus === "failed" &&
                        donation.paymentMethod !== "Cash" && (
                          <button
                            onClick={() => handleRetryPayment(donation)}
                            disabled={actionLoading[donation.id] === "payment"}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {actionLoading[donation.id] === "payment" ? (
                              <Loader className="animate-spin h-4 w-4" />
                            ) : (
                              <RefreshCw size={16} />
                            )}
                            Retry Payment
                          </button>
                        )}

                      <button
                        onClick={() => handleDeleteDonation(donation.id)}
                        disabled={actionLoading[donation.id] === "delete"}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {actionLoading[donation.id] === "delete" ? (
                          <Loader className="animate-spin h-4 w-4" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <DonationModal
          isOpen={showModal}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          backendUrl={backendUrl}
          utoken={utoken}
        />
      </div>
    </div>
  );
};

export default DonationSection;
