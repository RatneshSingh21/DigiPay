export default function PersonalDetails({
  onNext,
  onBack,
  formData,
  setFormData,
}) {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form
      className="grid grid-cols-2 gap-4 text-sm"
      onSubmit={(e) => e.preventDefault()}
    >
      <div>
        <label>
          Date of Birth <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="dob"
          value={formData.dob || ""}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-full"
        />
      </div>

      <div>
        <label>Age</label>
        <input
          name="age"
          value={formData.age || ""}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-full"
        />
      </div>

      <div>
        <label>
          Father’s Name <span className="text-red-500">*</span>
        </label>
        <input
          name="fatherName"
          value={formData.fatherName || ""}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-full"
        />
      </div>

      <div>
        <label>PAN</label>
        <input
          name="pan"
          placeholder="AAAAA0000A"
          value={formData.pan || ""}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-full"
        />
      </div>

      <div>
        <label>Differently Abled Type</label>
        <select
          name="abledType"
          value={formData.abledType || ""}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-full"
        >
          <option value="">None</option>
          <option value="Hearing">Hearing Impaired</option>
          <option value="Vision">Visually Impaired</option>
        </select>
      </div>

      <div>
        <label>Personal Email</label>
        <input
          name="email"
          type="email"
          value={formData.email || ""}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-full"
        />
      </div>

      <div className="col-span-2">
        <label>Residential Address</label>
        <input
          name="address1"
          placeholder="Address Line 1"
          value={formData.address1 || ""}
          onChange={handleChange}
          className="border w-full px-2 py-1 rounded mb-2"
        />
        <input
          name="address2"
          placeholder="Address Line 2"
          value={formData.address2 || ""}
          onChange={handleChange}
          className="border w-full px-2 py-1 rounded mb-2"
        />
        <div className="grid grid-cols-3 gap-2">
          <input
            name="city"
            placeholder="City"
            value={formData.city || ""}
            onChange={handleChange}
            className="border px-2 py-1 rounded"
          />
          <input
            name="state"
            placeholder="State"
            value={formData.state || ""}
            onChange={handleChange}
            className="border px-2 py-1 rounded"
          />
          <input
            name="pin"
            placeholder="PIN Code"
            value={formData.pin || ""}
            onChange={handleChange}
            className="border px-2 py-1 rounded"
          />
        </div>
      </div>

      <div className="col-span-2 mt-6 flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="border px-4 py-2 rounded"
        >
          Back
        </button>

        <button
          type="button"
          onClick={onNext}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save and Continue
        </button>

        <button type="button" className="border px-4 py-2 rounded">
          Skip
        </button>
      </div>
    </form>
  );
}
