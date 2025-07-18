import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Header = () => {
  const { state, setState } = useContext(AppContext);
  const navigate = useNavigate();
  return (
    <div
      style={{
        backgroundImage: `url(${assets.heroImg})`,
      }}
      className="bg-cover bg-center rounded-lg"
    >
      <div className="flex flex-col md:flex-row flex-wrap backdrop-filter shadow-[0_10px_20px_-5px_rgba(255,223,0,0.3)] bg-primary bg-opacity-70 rounded-lg px-6 md:px-10 lg:px-20">
        <div className="md:w-4/5 flex flex-col items-center justify-center text-center gap-4 py-10 m-auto md:py-[10vw] md:mb-[-30px]">
          <p className="text-3xl md:text-4xl lg-text-5xl text-white font-semibold leading-tight md:leading-tight lg:leading-tight">
            Welcome to SDPJSS <br />
          </p>
          <div className="flex flex-col md:flex-row items-center gap-3 text-white text-sm font-light">
            <p>
              {" "}
              A community-driven platform where members can connect, donate,
              share advertisements,
              <br className="hidden sm:block" /> and engage in meaningful
              interactions to support and uplift one another
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button
              className="px-6 py-3 bg-white text-primary hover:bg-white/90 rounded-full font-medium text-lg flex items-center justify-center transition-all duration-300"
              onClick={() => {
                setState("Register");
                navigate("/login");
              }}
            >
              Register Your Family{"  "}
              <img className="ml-2 w-3" src={assets.arrow_icon} alt="" />
            </button>
            <button
              className="px-6 py-3 bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary rounded-full font-medium text-lg flex items-center justify-center transition-all duration-300"
              onClick={() => navigate("/donation")}
            >
              Donate Now{" "}
              <img className=" ml-2 w-3" src={assets.arrow_icon} alt="" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
