import React from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext } from "react";
import { AdminContext } from "./context/AdminContext";

import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import AddAdmin from "./pages/AddAdmin";
import FamilyList from "./pages/FamilyList";
import UserList from "./pages/UserList";
import StaffRequirementList from "./pages/StaffRequirementList";
import JobOpeningList from "./pages/JobOpeningList";
import AdvertisementList from "./pages/AdvertisementList";
import DonationList from "./pages/DonationList";
import NoticeBoard from "./pages/NoticeBoard";
import ManageTeam from "./pages/ManageTeam";
import ScrollToTop from "./components/ScrollToTop";

const App = () => {
  const { aToken } = useContext(AdminContext);
  return aToken ? (
    <div className="bg-[#F8F9FD]">
      <ToastContainer />
      <Navbar />
      <div className="flex item-start">
        <ScrollToTop />
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/family-list" element={<FamilyList />} />
          <Route path="/user-list" element={<UserList />} />
          <Route
            path="/staff-requirement-list"
            element={<StaffRequirementList />}
          />
          <Route path="/job-opening-list" element={<JobOpeningList />} />
          <Route path="/advertisement-list" element={<AdvertisementList />} />
          <Route path="/donation-list" element={<DonationList />} />
          <Route path="/notice-board" element={<NoticeBoard />} />
          <Route path="/manage-team" element={<ManageTeam />} />
        </Routes>
      </div>
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer />
    </>
  );
};

export default App;
