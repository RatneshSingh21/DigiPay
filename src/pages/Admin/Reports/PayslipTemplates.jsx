import React, { useEffect, useState } from "react";
import { FaEye, FaEdit, FaTimes, FaStar } from "react-icons/fa";
import TemplateEditorModal from "../TemplateModels/TemplateEditorModal";
import PayslipPreview from "../TemplateModels/PayslipPreview";
import PayslipPreview2 from "../TemplateModels/PayslipPreview2";
import PayslipPreview3 from "../TemplateModels/PayslipPreview3";
import PayslipPreview4 from "../TemplateModels/PayslipPreview4";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import assets from "../../../assets/assets";

/* ---------------- PREVIEW MAP ---------------- */
const previewComponents = {
  standard: PayslipPreview,
  elegant: PayslipPreview2,
  simple: PayslipPreview3,
  mini: PayslipPreview4,
};

/* ---------------- IMAGE MAP ---------------- */
const templateImages = {
  standard: assets.PayslipTemplate1,
  elegant: assets.PayslipTemplate2,
  simple: assets.PayslipTemplate3,
  mini: assets.PayslipTemplate4,
};

/* ---------------- DEFAULT CONFIG ---------------- */
const baseConfig = {
  logo: "",
  logoSize: 80,
  orgName: "",
  orgAddress: "",
  signature: "",
  signatureAlign: "right",
  showSignature: true,
  showOrgName: true,
  showOrgAddress: true,
  showPAN: false,
  showYTD: false,
  showBank: true,
  showWorkLocation: true,
  showDepartment: true,
  showDesignation: true,
};

const defaultTemplateConfigs = {
  standard: { ...baseConfig },
  elegant: { ...baseConfig },
  simple: { ...baseConfig },
  mini: { ...baseConfig },
};

const PayslipTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [orgProfile, setOrgProfile] = useState(null);
  const [editorVisible, setEditorVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  /* ---------------- TEMPLATE CONFIG STATE ---------------- */
  const [templateConfigs, setTemplateConfigs] = useState(() => {
    const saved = localStorage.getItem("templateConfigs");
    return saved ? JSON.parse(saved) : defaultTemplateConfigs;
  });

  /* ---------------- FETCH ALL DATA ---------------- */
  const fetchAll = async () => {
    try {
      // 1️⃣ Fetch templates and org profile
      const [tplRes, orgRes] = await Promise.all([
        axiosInstance.get("/PayslipTemplate"),
        axiosInstance.get("/OrganizationProfile/full"),
      ]);

      const org = orgRes.data;
      setOrgProfile(org);

      // 2️⃣ Normalize templates and parse backend configJson
      const normalizedTemplates = tplRes.data.map((t) => {
        const key = t.name.toLowerCase().split(" ")[0];

        // Parse backend configJson if available
        const backendConfig = t.configJson ? JSON.parse(t.configJson) : {};

        return {
          templateId: t.templateId,
          id: key,
          name: t.name,
          isDefault: t.isDefault,
          image: templateImages[key],
          config: backendConfig,
        };
      });

      setTemplates(normalizedTemplates);

      // 3️⃣ Merge backend config, localStorage, and defaults
      setTemplateConfigs((prev) => {
        const updated = { ...prev };

        normalizedTemplates.forEach((tpl) => {
          updated[tpl.id] = {
            ...defaultTemplateConfigs[tpl.id], // default config
            ...tpl.config, // backend config overrides defaults
            ...prev[tpl.id], // localStorage overrides backend if exists
            logo: prev[tpl.id]?.logo || tpl.config?.logo || org.orgLogo,
            signature:
              prev[tpl.id]?.signature ||
              tpl.config?.signature ||
              org.orgSignature,
            orgName:
              prev[tpl.id]?.orgName ||
              tpl.config?.orgName ||
              org.company?.companyName,
            orgAddress:
              prev[tpl.id]?.orgAddress ||
              tpl.config?.orgAddress ||
              `${org.workLocation?.addressLine1}, ${org.workLocation?.addressLine2}, ${org.workLocation?.city}, ${org.workLocation?.state} - ${org.workLocation?.pinCode}`,
          };
        });

        return updated;
      });
    } catch (err) {
      console.error("Failed to fetch templates or org profile:", err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (!templates.length) return;

    const defaultTpl = templates.find((t) => t.isDefault);
    if (!defaultTpl) return;

    setPreviewTemplate({
      ...defaultTpl,
      config:
        templateConfigs[defaultTpl.id] ?? defaultTemplateConfigs[defaultTpl.id],
    });
  }, [templates, templateConfigs]);

  /* ---------------- PERSIST CONFIG ---------------- */
  useEffect(() => {
    localStorage.setItem("templateConfigs", JSON.stringify(templateConfigs));
  }, [templateConfigs]);

  /* ---------------- SAVE CONFIG ---------------- */
  const handleConfigSave = async (templateKey, newConfig) => {
    const mergedConfig = {
      ...templateConfigs[templateKey],
      ...newConfig,
    };

    // 1️⃣ Update UI state
    setTemplateConfigs((prev) => ({
      ...prev,
      [templateKey]: mergedConfig,
    }));

    // 2️⃣ Find templateId for API
    const template = templates.find((t) => t.id === templateKey);
    if (!template) return;

    // 3️⃣ Persist config to backend
    const payload = { configJson: JSON.stringify(mergedConfig) };
    await axiosInstance.put(
      `/PayslipTemplate/${template.templateId}/config`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  };

  /* ---------------- SET DEFAULT ---------------- */
  const setAsDefault = async (templateId) => {
    await axiosInstance.put(`/PayslipTemplate/${templateId}/set-default`);
    fetchAll();
  };

  /* ---------------- EDIT ---------------- */
  const openEditor = (template) => {
    setSelectedTemplate(template);
    setEditorVisible(true);
  };

  return (
    <div>
      <div className="sticky top-14 bg-white z-10 p-4 shadow mb-5">
        <h2 className="text-xl font-semibold">Payslip Templates</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
        {templates.map((template) => (
          <div
            key={template.templateId}
            className="relative bg-white rounded shadow-md hover:shadow-lg transition"
          >
            {template.isDefault && (
              <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                Default
              </span>
            )}

            <img
              src={template.image}
              alt={template.name}
              className="w-full object-contain h-[300px]"
            />

            <div className="p-4 border-t flex justify-between items-center">
              <h3 className="font-medium">{template.name}</h3>

              <div className="flex gap-3">
                <FaEye
                  className="text-blue-600 cursor-pointer"
                  title="Preview"
                  onClick={() => {
                    setPreviewTemplate({
                      ...template,
                      config:
                        templateConfigs[template.id] ??
                        defaultTemplateConfigs[template.id],
                    });
                    setPreviewVisible(true);
                  }}
                />

                <FaEdit
                  className="text-green-600 cursor-pointer"
                  title="Edit"
                  onClick={() => openEditor(template)}
                />

                <FaStar
                  className={`cursor-pointer ${
                    template.isDefault
                      ? "text-yellow-500"
                      : "text-gray-300 hover:text-yellow-400"
                  }`}
                  title={
                    template.isDefault ? "Default Template" : "Set as Default"
                  }
                  onClick={() => {
                    if (!template.isDefault) {
                      setAsDefault(template.templateId);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- EDITOR ---------------- */}
      {editorVisible && selectedTemplate && (
        <TemplateEditorModal
          template={selectedTemplate}
          config={templateConfigs[selectedTemplate.id]}
          PreviewComponent={previewComponents[selectedTemplate.id]}
          onSave={(updatedConfig) => {
            handleConfigSave(selectedTemplate.id, updatedConfig);
            setEditorVisible(false);
          }}
          onClose={() => setEditorVisible(false)}
        />
      )}

      {/* ---------------- PREVIEW ---------------- */}
      {previewVisible && previewTemplate && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/20 flex items-center justify-center">
          <div className="bg-white w-[95%] h-[95vh] rounded shadow-lg overflow-y-auto relative p-6">
            <button
              onClick={() => setPreviewVisible(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
            >
              <FaTimes size={18} />
            </button>

            <h2 className="text-lg font-bold mb-4">Payslip Preview</h2>

            {(() => {
              const PreviewComponent =
                previewComponents[previewTemplate.id] || PayslipPreview;
              return <PreviewComponent config={previewTemplate.config} />;
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default PayslipTemplates;
