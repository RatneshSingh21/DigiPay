import React, { useEffect, useState } from "react";
import { FaEye, FaEdit, FaTimes } from "react-icons/fa";
import TemplateEditorModal from "../TemplateModels/TemplateEditorModal";
import assets from "../../../assets/assets";
import PayslipPreview from "../TemplateModels/PayslipPreview";
import PayslipPreview2 from "../TemplateModels/PayslipPreview2";
import PayslipPreview3 from "../TemplateModels/PayslipPreview3";
import PayslipPreview4 from "../TemplateModels/PayslipPreview4"; 

const previewComponents = {
  standard: PayslipPreview,
  elegant: PayslipPreview2,
  simple: PayslipPreview3,
  mini: PayslipPreview4,
};

const templates = [
  {
    id: "standard",
    name: "Standard Template",
    image: assets.PayslipTemplate1,
    isDefault: true,
  },
  {
    id: "elegant",
    name: "Elegant Template",
    image: assets.PayslipTemplate2,
    isDefault: false,
  },
  {
    id: "simple",
    name: "Simple Template",
    image: assets.PayslipTemplate3,
    isDefault: false,
  },
  {
    id: "mini",
    name: "Mini Template",
    image: assets.PayslipTemplate4,
    isDefault: false,
  },
];

const defaultTemplateConfigs = {
  standard: {
    logo: "",
    logoSize: 80,
    orgName: "",
    orgAddress: "",
    signature: "",
    signatureAlign: "right",
    showSignature: true,
    showOrgName: true,
    showOrgAddress: true,
    showPAN: true,
    showYTD: true,
    showBank: true,
    showWorkLocation: true,
    showDepartment: true,
    showDesignation: true,
  },
  elegant: {
    logo: "",
    logoSize: 80,
    orgName: "",
    orgAddress: "",
    signature: "",
    signatureAlign: "right",
    showSignature: true,
    showOrgName: true,
    showOrgAddress: true,
    showPAN: true,
    showYTD: true,
    showBank: true,
    showWorkLocation: true,
    showDepartment: true,
    showDesignation: true,
  },
  simple: {
    logo: "",
    logoSize: 80,
    orgName: "",
    orgAddress: "",
    signature: "",
    signatureAlign: "right",
    showSignature: true,
    showOrgName: true,
    showOrgAddress: true,
    showPAN: true,
    showYTD: true,
    showBank: true,
    showWorkLocation: true,
    showDepartment: true,
    showDesignation: true,
  },
  mini: {
    logo: "",
    logoSize: 80,
    orgName: "",
    orgAddress: "",
    signature: "",
    signatureAlign: "right",
    showSignature: true,
    showOrgName: true,
    showOrgAddress: true,
    showPAN: true,
    showYTD: true,
    showBank: true,
    showWorkLocation: true,
    showDepartment: true,
    showDesignation: true,
  },
};

const PayslipTemplates = () => {
  const [editorVisible, setEditorVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const [templateConfigs, setTemplateConfigs] = useState(() => {
    const savedConfigs = localStorage.getItem("templateConfigs");
    return savedConfigs ? JSON.parse(savedConfigs) : defaultTemplateConfigs;
  });

  useEffect(() => {
    localStorage.setItem("templateConfigs", JSON.stringify(templateConfigs));
  }, [templateConfigs]);

  const handleConfigSave = (templateId, newConfig) => {
    setTemplateConfigs((prev) => ({
      ...prev,
      [templateId]: {
        ...prev[templateId],
        ...newConfig,
      },
    }));
  };

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
            key={template.id}
            className="bg-white rounded shadow-md hover:shadow-lg transition"
          >
            <img
              src={template.image}
              alt={template.name}
              className="w-full object-contain h-[300px]"
            />
            <div className="p-4 border-t flex justify-between items-center">
              <h3 className="font-medium">{template.name}</h3>
              <div className="flex gap-2">
                <button
                  className="text-blue-600 hover:text-blue-800"
                  title="Preview"
                  onClick={() => {
                    setPreviewTemplate({
                      ...template,
                      config:
                        templateConfigs[template.id] ||
                        defaultTemplateConfigs[template.id],
                    });
                    setPreviewVisible(true);
                  }}
                >
                  <FaEye className="cursor-pointer" />
                </button>

                <button
                  className="text-green-600 hover:text-green-800"
                  title="Edit"
                  onClick={() => openEditor(template)}
                >
                  <FaEdit className="cursor-pointer" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editorVisible && selectedTemplate && (
        <TemplateEditorModal
          template={selectedTemplate}
          config={templateConfigs[selectedTemplate.id]}
          PreviewComponent={previewComponents[selectedTemplate.id]} // yeh new prop
          onSave={(updatedConfig) => {
            handleConfigSave(selectedTemplate.id, updatedConfig);
            setEditorVisible(false);
          }}
          onClose={() => setEditorVisible(false)}
        />
      )}

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
              const PreviewComponent = previewComponents[previewTemplate.id];
              return <PreviewComponent config={previewTemplate.config} />;
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default PayslipTemplates;
