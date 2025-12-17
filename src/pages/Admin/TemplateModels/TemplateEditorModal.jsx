import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const TemplateEditorModal = ({
  template,
  config,
  onClose,
  PreviewComponent,
  onSave,
}) => {
  const [formState, setFormState] = useState(() => config || {});

  useEffect(() => {
    if (config) {
      setFormState(config);
    }
  }, [config]);

  const handleCheckbox = (field) => {
    setFormState((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormState((prev) => ({ ...prev, [type]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({
      ...formState,
      showOrgName: !!formState.orgName?.trim(),
      showOrgAddress: !!formState.orgAddress?.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/20 flex items-center justify-center">
      <div className="bg-white w-[95%] h-[95vh] rounded shadow-lg flex overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
        >
          <FaTimes size={18} />
        </button>

        {/* Left Panel: Editor */}
        <div className="w-1/3 p-6 overflow-y-auto space-y-5">
          <h2 className="text-xl font-semibold mb-2">Edit Payslip Template</h2>

          {/* Toggle Switches */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Show UAN", field: "showPAN" },
              { label: "Show YTD", field: "showYTD" },
              { label: "Bank Acc/No", field: "showBank" },
              { label: "Work Location", field: "showWorkLocation" },
              { label: "Department", field: "showDepartment" },
              { label: "Designation", field: "showDesignation" },
              { label: "Org. Name", field: "showOrgName" },
              { label: "Org. Address", field: "showOrgAddress" },
            ].map(({ label, field }) => (
              <div key={field} className="flex items-center justify-between">
                <span>{label}</span>
                <button
                  type="button"
                  className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-300 ${
                    formState[field] ? "bg-primary" : "bg-gray-300"
                  }`}
                  onClick={() =>
                    setFormState((prev) => ({ ...prev, [field]: !prev[field] }))
                  }
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
                      formState[field] ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Logo Upload */}
          <div>
            <label className="font-semibold block">Upload Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "logo")}
              className="hover:text-blue-600"
            />
            {formState.logo && (
              <img
                src={formState.logo}
                alt="Logo Preview"
                className="mt-2 h-16 object-contain border p-1 rounded"
                style={{ maxWidth: formState.logoSize }}
              />
            )}
            <input
              type="range"
              min={50}
              max={200}
              value={formState.logoSize}
              onChange={(e) =>
                setFormState({ ...formState, logoSize: +e.target.value })
              }
              className="w-full mt-2"
            />
            <span className="text-xs text-gray-500">
              Logo Size: {formState.logoSize}px
            </span>
          </div>

          {/* Org Name */}
          <div>
            <label className="font-semibold block">Organization Name</label>
            <input
              type="text"
              value={formState.orgName}
              onChange={(e) =>
                setFormState({ ...formState, orgName: e.target.value })
              }
              className="border p-2 rounded w-full mt-1"
            />
          </div>

          {/* Org Address */}
          <div>
            <label className="font-semibold block">Organization Address</label>
            <textarea
              value={formState.orgAddress}
              onChange={(e) =>
                setFormState({ ...formState, orgAddress: e.target.value })
              }
              className="border p-2 rounded w-full mt-1"
              rows={3}
            />
          </div>

          {/* Signature Upload */}
          <div>
            <label className="font-semibold block">Upload Signature</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "signature")}
              className="hover:text-blue-600"
            />
            {formState.signature && (
              <img
                src={formState.signature}
                alt="Signature Preview"
                className="mt-2 h-12 object-contain border p-1 rounded"
              />
            )}
            <select
              value={formState.signatureAlign}
              onChange={(e) =>
                setFormState({ ...formState, signatureAlign: e.target.value })
              }
              className="mt-2 border rounded p-1 w-full"
            >
              <option value="left">Align Left</option>
              <option value="center">Align Center</option>
              <option value="right">Align Right</option>
            </select>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary w-full"
            >
              Save Template
            </button>
          </div>
        </div>

        {/* Right Panel: Preview */}
        <div className="w-2/3 bg-gray-50 p-6 overflow-y-auto border-l">
          <h2 className="text-lg font-bold mb-4">{template?.name} Preview</h2>
          {PreviewComponent && <PreviewComponent config={formState} />}
        </div>
      </div>
    </div>
  );
};

export default TemplateEditorModal;
