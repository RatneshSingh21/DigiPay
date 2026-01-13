import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { MdEmail, MdPhone, MdWork, MdCalendarToday } from "react-icons/md";
import { format } from "date-fns";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import assets from "../../../assets/assets";
import { toast } from "react-toastify";
import QRCode from "react-qr-code";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const EmployeeProfile = () => {
  const User = useAuthStore((state) => state.user);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);

  // Preview state
  const [previewUrl, setPreviewUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // ref to the template node we will clone and render off-screen
  const idCardRef = useRef(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);

        // GET /api/Employee/{id}
        const res = await axiosInstance.get(`/Employee/${User.userId}`);
        const emp = res.data?.data;

        if (!emp) {
          toast.error("Employee not found");
          return;
        }

        // Fetch related master data in parallel
        const [deptRes, desigRes, payRes, locRes] = await Promise.all([
          emp.departmentId
            ? axiosInstance.get(`/Department/${emp.departmentId}`)
            : Promise.resolve({ data: null }),

          emp.designationId
            ? axiosInstance.get(`/Designation/${emp.designationId}`)
            : Promise.resolve({ data: null }),

          emp.payScheduleId
            ? axiosInstance.get(`/PaySchedule/${emp.payScheduleId}`)
            : Promise.resolve({ data: null }),

          emp.workLocationId
            ? axiosInstance.get(`/WorkLocation/${emp.workLocationId}`)
            : Promise.resolve({ data: null }),
        ]);

        // Set employee with image
        setEmployee({
          ...emp,
          departmentName: deptRes?.data?.name || "N/A",
          designationName: desigRes?.data?.title || "N/A",
          payScheduleName: payRes?.data?.name || "N/A",
          workLocationName: locRes?.data?.name || "N/A",
          profileImageUrl: emp.profileImageUrl || "",
        });
      } catch (error) {
        console.error("Failed to fetch employee:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (User?.userId) {
      fetchEmployee();
    }
  }, [User?.userId]);

  // Load config once
  useEffect(() => {
    const savedConfigs = localStorage.getItem("templateConfigs");
    if (savedConfigs) {
      const parsedConfigs = JSON.parse(savedConfigs);
      setConfig(parsedConfigs.simple || null);
    }
  }, []);

  const generateQrPng = (text, size = 300) => {
    return new Promise((resolve) => {
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      document.body.appendChild(container);

      const qrElement = <QRCode value={text} size={size} />;

      // Render QR SVG temporarily
      const root = ReactDOM.createRoot(container);
      root.render(qrElement);

      setTimeout(() => {
        const svg = container.querySelector("svg");

        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml" });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, size, size);

          const png = canvas.toDataURL("image/png");
          resolve(png);

          URL.revokeObjectURL(url);
          document.body.removeChild(container);
        };
        img.src = url;
      }, 100);
    });
  };

  // Create a clean inline-styled card node, mount it off-screen (visible to browser),
  // capture it with html2canvas and create PDF blob and preview URL.
  const handlePreviewIdCard = async () => {
    if (!employee) return;
    try {
      setLoading(true);

      const qrText = `
${employee.employeeCode}
${employee.fullName}
${employee.workEmail}
${employee.mobileNumber}
${employee.designationName}
${employee.departmentName}
`.trim();

      const qrPng = await generateQrPng(qrText, 300);

      // Create isolated iframe
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.left = "-9999px";
      iframe.style.top = "0";
      iframe.width = "500";
      iframe.height = "1000";
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow.document;

      // PREMIUM TEMPLATE HTML
      doc.open();
      doc.write(`
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            padding: 0;
            margin: 0;
          }

          .id-card {
            width: 380px;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            margin: 20px auto;
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
            text-align: center;
            padding-bottom: 25px;
          }

          /* Header Gradient */
          .header {
            background: linear-gradient(135deg, #0b65c2, #3fa9f5);
            padding: 28px 20px 50px;
            position: relative;
          }

          .company-logo {
            width: 70px;
            margin-bottom: 10px;
          }

          .company-name {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: white;
            letter-spacing: 1px;
          }

          .photo-wrapper {
            position: absolute;
            left: 50%;
            bottom: -45px;
            transform: translateX(-50%);
            width: 110px;
            height: 110px;
            border-radius: 50%;
            padding: 6px;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.25);
          }

          .user-photo {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
          }

          .details {
            margin-top: 70px;
            padding: 0 20px;
          }

          .name {
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 4px;
            color: #111;
          }

          .role {
            padding: 6px 30px;
            display: inline-block;
            font-weight: 600;
            border-radius: 14px;
          }

          .info-row {
            text-align: left;
            width: 80%;
            margin: 6px auto;
            font-size: 14px;
            color: #333;
          }

          .label {
            font-weight: 600;
          }

          .barcode {
            margin: 18px auto 5px;
            display: block;
            width: 65%;
          }

          .qr {
            margin-top: 12px;
            width: 100px;
          }
        </style>
      </head>
      <body>

        <div class="id-card" id="premiumIDCard">

          <div class="header">
            <img src="${
              config.logo ? config.logo : assets.Digicode
            }" class="company-logo"/>
            <h2 class="company-name">${
              config.orgName ? config.orgName : "Digicode Software Pvt. Ltd"
            }</h2>

            <div class="photo-wrapper">
              <img src="${
                employee.profileImageUrl || assets.UserDummy
              }" class="user-photo" />
            </div>
          </div>

          <div class="details">
            <h2 class="name">${escapeHtml(employee.fullName)}</h2>
            <div class="role">${escapeHtml(employee.designationName)}</div>

            <p class="info-row"><span class="label">Emp. Code:</span> ${
              employee.employeeCode
            }</p>
            <p class="info-row"><span class="label">E-mail:</span> ${
              employee.workEmail
            }</p>
             <p class="info-row"><span class="label">Department:</span> ${
               employee.departmentName
             }</p>
            <p class="info-row"><span class="label">Phone:</span> ${
              employee.mobileNumber
            }</p>

           
           <img src="${qrPng}" class="qr" />
          </div>

        </div>

      </body>
      </html>
    `);
      doc.close();

      await waitForImagesToLoad(doc.body, 6000);

      const cardEl = doc.getElementById("premiumIDCard");

      const canvas = await html2canvas(cardEl, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      document.body.removeChild(iframe);

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [420, 650],
      });

      pdf.addImage(
        imgData,
        "PNG",
        25,
        25,
        370,
        (canvas.height / canvas.width) * 370
      );

      const pdfBlob = pdf.output("blob");
      const url = URL.createObjectURL(pdfBlob);

      setPreviewUrl(url);
      setShowPreview(true);
    } catch (err) {
      console.error("Premium ID generation failed:", err);
      toast.error("Failed to generate ID card");
    } finally {
      setLoading(false);
    }
  };

  // Download the generated PDF preview
  const downloadIdCard = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = `${employee?.fullName || "employee"}_ID_Card.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // small helper: wait until images inside node load (or timeout)
  const waitForImagesToLoad = (node, timeout = 4000) =>
    new Promise((resolve) => {
      const imgs = node.querySelectorAll("img");
      if (!imgs || imgs.length === 0) return resolve();
      let loaded = 0;
      const t = setTimeout(() => resolve(), timeout);
      imgs.forEach((img) => {
        // if already complete
        if (img.complete) {
          loaded++;
          if (loaded === imgs.length) {
            clearTimeout(t);
            resolve();
          }
          return;
        }
        img.addEventListener("load", () => {
          loaded++;
          if (loaded === imgs.length) {
            clearTimeout(t);
            resolve();
          }
        });
        img.addEventListener("error", () => {
          // still count errored images
          loaded++;
          if (loaded === imgs.length) {
            clearTimeout(t);
            resolve();
          }
        });
      });
    });

  // small helper to escape HTML injected into cloned node (safety)
  function escapeHtml(str = "") {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!employee)
    return <div className="p-6 text-center">No employee data found.</div>;

  return (
    <>
      <div className="flex items-center justify-center bg-gray-100 px-4 py-12">
        <div className="w-full max-w-5xl bg-white shadow-lg rounded-2xl p-8 sm:p-10 space-y-10 transition-all duration-300 hover:shadow-2xl">
          {/* HEADER SECTION */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            {/* Profile Left */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {employee?.profileImageUrl ? (
                <img
                  src={employee.profileImageUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-contain border"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold">
                  {employee?.fullName?.charAt(0)}
                </div>
              )}

              <div className="text-center sm:text-left space-y-1">
                <h2 className="text-3xl font-semibold text-gray-800">
                  {employee.fullName}
                </h2>
                <p className="text-sm text-primary font-medium tracking-wide">
                  {employee.employeeCode}
                </p>
                <p className="text-gray-600">{employee.designationName}</p>
              </div>
            </div>

            {/* Generate ID Button */}
            <button
              onClick={handlePreviewIdCard}
              className="px-6 py-2 bg-primary cursor-pointer text-white rounded-lg font-medium shadow hover:bg-secondary transition-all"
            >
              Generate ID Card
            </button>
          </div>

          {/* CONTACT INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50 p-5 rounded-xl border">
            <div className="flex items-center gap-2">
              <MdEmail className="text-primary" /> {employee.workEmail}
            </div>
            <div className="flex items-center gap-2">
              <MdPhone className="text-primary" /> {employee.mobileNumber}
            </div>
            <div className="flex items-center gap-2">
              <MdWork className="text-primary" /> {employee.designationName}
            </div>
            <div className="flex items-center gap-2">
              <MdCalendarToday className="text-primary" />
              Joined:
              {employee.dateOfJoining
                ? format(new Date(employee.dateOfJoining), "dd MMM yyyy")
                : "N/A"}
            </div>
          </div>

          {/* ADDITIONAL DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm pt-2">
            <InfoItem label="Gender" value={employee.gender} />
            <InfoItem label="Department" value={employee.departmentName} />
            <InfoItem label="Work Location" value={employee.workLocationName} />
            <InfoItem label="Pay Schedule" value={employee.payScheduleName} />
            <InfoItem
              label="Portal Access"
              value={employee.portalAccessEnabled ? "Enabled" : "Disabled"}
            />
          </div>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-5 rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-lg font-semibold">
                Employee ID Card Preview
              </h3>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowPreview(false);
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl("");
                  }}
                  className="px-3 py-1 cursor-pointer rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                >
                  Close
                </button>

                <button
                  onClick={downloadIdCard}
                  className="px-3 py-1 rounded-lg cursor-pointer bg-primary text-white hover:bg-secondary transition"
                >
                  Download PDF
                </button>
              </div>
            </div>

            {previewUrl ? (
              <iframe
                title="id-preview"
                src={previewUrl}
                className="w-full h-96 border rounded-lg shadow"
              />
            ) : (
              <div className="p-6 text-center text-gray-600">
                Generating preview...
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeProfile;

const InfoItem = ({ label, value }) => (
  <p>
    <strong className="text-gray-700">{label}:</strong>{" "}
    <span className="text-gray-800">{value || "N/A"}</span>
  </p>
);
