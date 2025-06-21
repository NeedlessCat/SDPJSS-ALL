import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const LoginPage = () => {
  const { state, setState, backendUrl, token, setToken, utoken, setUToken } =
    useContext(AppContext);

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [famID, setFamID] = useState("");
  const [famName, setFamName] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [gotra, setGotra] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState({ code: "+91", number: "" });

  // state -- Register[Family Registration], Submit[Family Login], Login[User Login]
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      console.log(state);
      if (state === "Register") {
        const { data } = await axios.post(backendUrl + "/api/family/register", {
          familyname: famName,
          familyaddress: address,
          password,
          email,
          gotra,
          mobile,
        });
        console.log(data);
        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
        } else {
          toast.error(data.message);
        }
      } else {
        if (state === "Submit") {
          const { data } = await axios.post(backendUrl + "/api/family/login", {
            familyid: famID,
            familyname: famName,
            password,
          });
          if (data.success) {
            localStorage.setItem("token", data.token);
            setToken(data.token);
          } else {
            toast.error(data.message);
          }
        } else {
          const { data } = await axios.post(backendUrl + "/api/user/login", {
            username,
            password,
          });

          console.log(data);

          if (data.success) {
            localStorage.setItem("utoken", data.utoken);
            setUToken(data.utoken);
          } else {
            toast.error(data.message);
          }
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token || utoken) {
      navigate("/");
    }
  }, [token, utoken]);

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">
          {state === "Register"
            ? "Family Registration"
            : state === "Submit"
            ? "Family Login"
            : "User Login"}
        </p>
        <p>
          Please{" "}
          {state === "Register"
            ? "register your family"
            : state === "Submit"
            ? "fill the details"
            : "login"}{" "}
          to get into our services
        </p>
        {state === "Submit" && (
          <div className="w-full">
            <p>Family ID</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="text"
              onChange={(e) => setFamID(e.target.value)}
              value={famID}
            />
          </div>
        )}
        {state === "Login" && (
          <div className="w-full">
            <p>Username</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="text"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
          </div>
        )}
        {(state === "Submit" || state === "Register") && (
          <div className="w-full">
            <p>Family Name</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="text"
              onChange={(e) => setFamName(e.target.value)}
              value={famName}
            />
          </div>
        )}
        <div className="w-full">
          <p>Password</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>
        {state === "Register" && (
          <div className="w-full">
            <p>Street Address</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="text"
              onChange={(e) => setAddress(e.target.value)}
              value={address}
            />
          </div>
        )}
        {state === "Register" && (
          <div className="w-full">
            <p>Gotra</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="text"
              onChange={(e) => setGotra(e.target.value)}
              value={gotra}
            />
          </div>
        )}
        {state === "Register" && (
          <div className="w-full">
            <p>Email</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>
        )}
        {state === "Register" && (
          <div className="w-full">
            <p>Mobile</p>
            <div className="flex mt-1 gap-2">
              {/* Country code input (small and left-aligned) */}
              <input
                className="border border-zinc-300 rounded w-[80px] p-2"
                type="text"
                placeholder="+91"
                value={mobile.code}
                onChange={(e) =>
                  setMobile((prev) => ({ ...prev, code: e.target.value }))
                }
              />

              {/* Mobile number input (larger) */}
              <input
                className="border border-zinc-300 rounded flex-1 p-2"
                type="text"
                placeholder=""
                value={mobile.number}
                onChange={(e) =>
                  setMobile((prev) => ({ ...prev, number: e.target.value }))
                }
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="bg-primary text-white w-full py-2 rounded-md text-base"
        >
          {" "}
          {state}
        </button>
        {state === "Register" ? (
          <>
            <p>
              Already have an account?{" "}
              <span
                onClick={() => setState("Login")}
                className="text-primary underline cursor-pointer"
              >
                Login here
              </span>
            </p>
            <p>
              Already have a family account?{" "}
              <span
                onClick={() => setState("Submit")}
                className="text-primary underline cursor-pointer"
              >
                Add Member here
              </span>
            </p>
          </>
        ) : state === "Submit" ? (
          <>
            <p>
              Create a new account?{" "}
              <span
                onClick={() => setState("Register")}
                className="text-primary underline cursor-pointer"
              >
                Register here
              </span>
            </p>
            <p>
              Already have an account?{" "}
              <span
                onClick={() => setState("Login")}
                className="text-primary underline cursor-pointer"
              >
                Login here
              </span>
            </p>
          </>
        ) : (
          <>
            <p>
              Create a new account?{" "}
              <span
                onClick={() => setState("Register")}
                className="text-primary underline cursor-pointer"
              >
                Register here
              </span>
            </p>
            <p>
              Already have a family account?{" "}
              <span
                onClick={() => setState("Submit")}
                className="text-primary underline cursor-pointer"
              >
                Add Member here
              </span>
            </p>
          </>
        )}
      </div>
    </form>
  );
};

export default LoginPage;
