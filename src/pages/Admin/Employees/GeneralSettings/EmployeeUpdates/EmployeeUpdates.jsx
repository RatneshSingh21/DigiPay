import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import EmployeeSelect from "./EmployeeSelect";
import UpdateBasicDetails from "./UpdateBasicDetails";
import UpdateSalaryDetails from "./UpdateSalaryDetails";
import UpdatePersonalDetails from "./UpdatePersonalDetails";
import UpdatePaymentInfo from "./UpdatePaymentInfo";

const EMP_DETAILS_ENDPOINT = (id) => `/Employee/${id}`;
// Update if your API differs.

const EmployeeUpdates = () => {
  const [selectedEmp, setSelectedEmp] = useState(null); // {id,name,code}
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch full details when an employee is selected
  useEffect(() => {
    const load = async () => {
      if (!selectedEmp?.id) {
        setData(null);
        return;
      }
      try {
        setLoading(true);
        const res = await axiosInstance.get(
          EMP_DETAILS_ENDPOINT(selectedEmp.id)
        );
        // Normalize your API response shape here:
        // Expecting e.g. { basicDetails:{}, salaryDetails:{}, personalDetails:{}, paymentDetails:{} }
        const payload = res.data || {};
        setData({
          basicDetails: payload.basicDetails || payload.basic || payload,
          salaryDetails: payload.salaryDetails || payload.salary || {},
          personalDetails: payload.personalDetails || payload.personal || {},
          paymentDetails: payload.paymentDetails || payload.payment || {},
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch employee details");
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedEmp?.id]);

  return (
    <div className="space-y-6">
      <EmployeeSelect
        value={selectedEmp?.id}
        onSelect={(emp) =>
          setSelectedEmp(emp ? { id: emp.value, name: emp.label } : null)
        }
      />

      {!selectedEmp?.id && (
        <div className="text-gray-500 text-sm">
          Pick an employee to load details.
        </div>
      )}

      {selectedEmp?.id && loading && (
        <div className="text-sm text-gray-500">Loading details…</div>
      )}

      {selectedEmp?.id && !loading && data && (
        <div className="grid grid-cols-1 gap-6">
          <UpdateBasicDetails
            employeeId={selectedEmp.id}
            data={data.basicDetails}
            onLocalUpdate={(updated) =>
              setData((d) => ({ ...d, basicDetails: updated }))
            }
          />
          <UpdateSalaryDetails
            employeeId={selectedEmp.id}
            data={data.salaryDetails}
            onLocalUpdate={(updated) =>
              setData((d) => ({ ...d, salaryDetails: updated }))
            }
          />
          <UpdatePersonalDetails
            employeeId={selectedEmp.id}
            data={data.personalDetails}
            onLocalUpdate={(updated) =>
              setData((d) => ({ ...d, personalDetails: updated }))
            }
          />
          <UpdatePaymentInfo
            employeeId={selectedEmp.id}
            data={data.paymentDetails}
            onLocalUpdate={(updated) =>
              setData((d) => ({ ...d, paymentDetails: updated }))
            }
          />
        </div>
      )}
    </div>
  );
};

export default EmployeeUpdates;
