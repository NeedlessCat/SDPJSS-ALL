import { useEffect } from "react";
import { createContext, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [state, setState] = useState("Register");

  // Token for the family login
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : false
  );

  // Token for the user login
  const [utoken, setUToken] = useState(
    localStorage.getItem("utoken") ? localStorage.getItem("utoken") : false
  );

  const [familyData, setFamilyData] = useState(false);
  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/family/get-profile", {
        headers: { token },
      });
      if (data.success) {
        console.log(data);
        setFamilyData(data.updatedFamily);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const [userData, setUserData] = useState(false);
  const [loading, setLoading] = useState(true);
  const loadUserData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(backendUrl + "/api/user/get-profile", {
        headers: { utoken },
      });
      console.log(data);
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const [jobs, setJobs] = useState(false);
  const loadUserJobs = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/my-jobs", {
        headers: { utoken },
      });
      console.log(data);
      if (data.success) {
        setJobs(data.jobOpenings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const value = {
    backendUrl,
    state,
    setState,
    token,
    setToken,
    utoken,
    setUToken,
    familyData,
    setFamilyData,
    loadUserProfileData,
    loadUserData,
    userData,
    setUserData,
    jobs,
    setJobs,
    loadUserJobs,
    loading,
    setLoading,
  };

  useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setFamilyData(false);
    }
  }, [token]);

  useEffect(() => {
    if (utoken) {
      loadUserData();
      loadUserJobs();
    } else {
      setUserData(false);
      setJobs(false);
    }
  }, [utoken]);
  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
