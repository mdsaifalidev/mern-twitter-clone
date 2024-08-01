import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import XSvg from "../../components/svgs/X";

import { MdPassword } from "react-icons/md";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");

  const { mutate: resetPassword, isPending } = useMutation({
    mutationFn: async (newPassword) => {
      try {
        const response = await fetch(`/api/v1/auth/reset-password/${token}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newPassword }),
        });

        const data = await response.json();
        if (data.success) {
          toast.success(data.message);
          navigate("/login", { replace: true });
          return data;
        } else {
          toast.error(data.message);
        }
        return data;
      } catch (error) {
        toast.error("Something went wrong. Please try again later.");
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    resetPassword(newPassword);
  };

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen">
      <div className="flex-1 hidden lg:flex items-center  justify-center">
        <XSvg className="lg:w-2/3 fill-white" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form className="flex gap-4 flex-col" onSubmit={handleSubmit}>
          <XSvg className="w-24 lg:hidden fill-white" />
          <h1 className="text-4xl font-extrabold text-white">
            Reset Password.
          </h1>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdPassword />
            <input
              type="password"
              className="grow"
              placeholder="New Password"
              name="newPassword"
              onChange={(e) => setNewPassword(e.target.value)}
              value={newPassword}
            />
          </label>
          <button
            className="btn rounded-full btn-primary text-white"
            disabled={isPending}
          >
            {isPending ? "Please Wait..." : "Reset Password"}
          </button>
        </form>
        <div className="flex flex-col gap-2 mt-4">
          <p className="text-white text-lg">Send me back to</p>
          <Link to="/login">
            <button className="btn rounded-full btn-primary text-white btn-outline w-full">
              Log in
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default ResetPassword;
