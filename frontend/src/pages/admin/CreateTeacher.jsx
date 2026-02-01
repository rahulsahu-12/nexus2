import { useState } from "react";
import { UserPlus, ArrowLeft, Eye, EyeOff } from "lucide-react";
import api from "../../api/axios";

export default function CreateTeacher({ setSection, setSelectedTeacher }) {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    password: "",
    dob: "",
    gender: "",
    branch: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Backend will be connected later
      const res = await api.post("/admin/teachers", form);

      setSelectedTeacher({
        id: res.data.teacher_id,
        ...form,
        role: "teacher"
      });

      setSection("teacher-details");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create teacher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-indigo-600/20 text-indigo-400">
            <UserPlus size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Create Teacher
            </h1>
            <p className="text-sm text-slate-400">
              Add a new faculty member to the system
            </p>
          </div>
        </div>

        <button
          onClick={() => setSection("teachers")}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6"
      >
        {/* BASIC INFO */}
        <div>
          <h2 className="section-title">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input
                className="input"
                name="name"
                placeholder="e.g. Rahul Sharma"
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label">Mobile Number</label>
              <input
                className="input"
                name="mobile"
                placeholder="10-digit mobile number"
                onChange={handleChange}
                required
              />
            </div>

            {/* PASSWORD WITH SEENER */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Set initial password"
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Date of Birth</label>
              <input
                className="input"
                type="date"
                name="dob"
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* ACADEMIC INFO */}
        <div>
          <h2 className="section-title">Academic Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Gender</label>
              <select
                className="input"
                name="gender"
                onChange={handleChange}
                required
              >
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            <div>
              <label className="label">Branch</label>
              <select
                className="input"
                name="branch"
                onChange={handleChange}
                required
              >
                <option value="">Select branch</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="ME">ME</option>
              </select>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* ACTION */}
        <div className="flex justify-end pt-4">
          <button
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Creating..." : "Create Teacher"}
          </button>
        </div>
      </form>
    </div>
  );
}
