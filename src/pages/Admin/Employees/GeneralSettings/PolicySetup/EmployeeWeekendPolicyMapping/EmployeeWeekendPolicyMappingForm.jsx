import React, { useEffect, useState, useMemo } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import Select from "react-select";
import axiosInstance from "../../../../../../axiosInstance/axiosInstance";

const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        borderColor: state.isFocused ? "#60A5FA" : "#CBD5E1",
        boxShadow: state.isFocused ? "0 0 0 1px rgba(96,165,250,0.5)" : "none",
        borderRadius: "0.375rem",
        minHeight: "36px",
        fontSize: "0.875rem",
    }),
    menu: (provided) => ({ ...provided, zIndex: 9999 }),
};

const EmployeeWeekendPolicyMappingForm = ({ onClose, onSuccess, editData }) => {
    const [employees, setEmployees] = useState([]);
    const [weekendPolicies, setWeekendPolicies] = useState([]);
    const [existingMappings, setExistingMappings] = useState([]);

    const [form, setForm] = useState({
        employeeId: "",
        weekendPolicyId: "",
        effectiveFrom: "",
        effectiveTo: "",
    });

    useEffect(() => {
        if (editData) {
            setForm({
                employeeId: editData.employeeId,
                weekendPolicyId: editData.weekendPolicyId,
                effectiveFrom: editData.effectiveFrom,
                effectiveTo: editData.effectiveTo,
            });
        }
    }, [editData]);

    /* ================= FETCH ================= */
    useEffect(() => {
        const fetchData = async () => {
            try {
                const empRes = await axiosInstance.get("/Employee");
                setEmployees(empRes.data || []);
            } catch {
                toast.error("Employee API failed");
            }

            try {
                const policyRes = await axiosInstance.get("/WeekendPolicy/get-all-Weekend-policy");
                setWeekendPolicies(policyRes.data?.data || []);
            } catch {
                toast.error("Policy API failed");
            }

            try {
                const mappingRes = await axiosInstance.get("/EmployeeWeekendPolicyMapping/get/all");
                setExistingMappings(mappingRes.data?.data || []);
            } catch {
                toast.error("Mapping API failed");
            }
        };

        fetchData();
    }, []);

    /* ================= CHECK EXISTING ================= */
    const isMapped = (employeeId) => {
        return existingMappings.some(
            (m) =>
                m.employeeId === employeeId &&
                m.weekendPolicyId === Number(form.weekendPolicyId) &&
                m.isActive
        );
    };

    /* ================= OPTIONS ================= */
    const employeeOptions = useMemo(() => {
        if (!form.weekendPolicyId) return [];

        return employees.map((emp) => {
            const mapped = isMapped(emp.id);

            return {
                value: emp.id,
                label: `${emp.fullName} (${emp.employeeCode})${mapped ? " • Already mapped" : ""
                    }`,
                isDisabled: mapped && emp.id !== Number(form.employeeId), // allow current edit
            };
        });
    }, [employees, existingMappings, form.weekendPolicyId, form.employeeId]);

    /* ================= SUBMIT ================= */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isMapped(Number(form.employeeId))) {
            toast.warning("Already mapped!");
            return;
        }

        try {

            const payload = {
                employeeId: Number(form.employeeId),
                weekendPolicyId: Number(form.weekendPolicyId),
                effectiveFrom: `${form.effectiveFrom}T00:00:00Z`,
                effectiveTo: `${form.effectiveTo}T00:00:00Z`,
                isActive: true,
            };
            if (editData) {
                // 🔥 UPDATE
                await axiosInstance.put(
                    `/EmployeeWeekendPolicyMapping/update/${editData.mappingId}`,
                    payload
                );
            } else {
                // 🔥 CREATE
                await axiosInstance.post(
                    "/EmployeeWeekendPolicyMapping/create",
                    payload
                );
            }
            toast.success("Weekend policy assigned");
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Failed to assign");
        }
    };

    const inputClass =
        "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";


    return (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 cursor-pointer hover:text-red-500"
                >
                    <X />
                </button>

                <h2 className="text-lg font-bold mb-4">
                    {editData ? "Edit Weekend Policy" : "Assign Weekend Policy"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Policy */}
                    <Select
                        options={weekendPolicies}
                        value={
                            weekendPolicies.find(
                                (p) => p.weekendPolicyId === Number(form.weekendPolicyId)
                            ) || null
                        }
                        getOptionLabel={(p) =>
                            `${p.policyName} (${[
                                p.sundayOff && "Sun",
                                p.mondayOff && "Mon",
                                p.tuesdayOff && "Tue",
                                p.wednesdayOff && "Wed",
                                p.thursdayOff && "Thu",
                                p.fridayOff && "Fri",
                                p.saturdayOff && "Sat",
                            ]
                                .filter(Boolean)
                                .join(", ")})`
                        }
                        getOptionValue={(p) => p.weekendPolicyId}
                        onChange={(val) =>
                            setForm({
                                ...form,
                                weekendPolicyId: val?.weekendPolicyId || "",
                                employeeId: "",
                            })
                        }
                        styles={customSelectStyles}
                        placeholder="Select Policy"
                    />

                    {/* Employee */}
                    <Select
                        options={employeeOptions}
                        value={
                            employeeOptions.find(
                                (e) => e.value === Number(form.employeeId)
                            ) || null
                        }
                        onChange={(opt) =>
                            setForm({ ...form, employeeId: opt?.value })
                        }
                        isDisabled={!form.weekendPolicyId}
                        styles={customSelectStyles}
                        placeholder="Select Employee"
                    />

                    {/* Dates */}
                    <input
                        type="date"
                        className={inputClass}
                        required
                        value={form.effectiveFrom || ""}
                        onChange={(e) =>
                            setForm({ ...form, effectiveFrom: e.target.value })
                        }
                    />

                    <input
                        type="date"
                        className={inputClass}
                        required
                        value={form.effectiveTo || ""}
                        onChange={(e) =>
                            setForm({ ...form, effectiveTo: e.target.value })
                        }
                    />

                    {/* Buttons */}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 cursor-pointer rounded"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary cursor-pointer text-white rounded"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeWeekendPolicyMappingForm;