"use client";

import { useState } from "react";
import StatusModal from "@/components/groupbookings/StatusModal";
import { createIdempotencyKey } from "@/lib/clientIdempotency";
import { markThankyouUrl, restoreThankyouUrl } from "@/lib/thankyou-url";

type FormData = {
  fullName: string;
  contactNumber: string;
  email: string;
  groupType: string;
  totalPassengers: string;
  children: string;
  departureAirport: string;
  destination: string;
  resort: string;
  departureDay: string;
  departureMonth: string;
  departureYear: string;
  nights: string;
};

type FormField = keyof FormData;
type FormErrors = Partial<Record<FormField, string>>;
type FormTouched = Partial<Record<FormField, boolean>>;

const initialFormData: FormData = {
  fullName: "",
  contactNumber: "",
  email: "",
  groupType: "",
  totalPassengers: "",
  children: "",
  departureAirport: "",
  destination: "",
  resort: "",
  departureDay: "",
  departureMonth: "",
  departureYear: "",
  nights: "",
};

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="mt-2">
      <div className="relative inline-block">
        <div
          className="absolute left-5 -top-3 w-0 h-0 -rotate-90"
          style={{
            borderLeft: "8px solid #DC2626",
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
          }}
        ></div>
        <div className="bg-red-600 text-white text-xs px-4 py-2 font-medium ml-2">
          {message}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <h2 className="text-2xl font-semibold text-[#595858] mb-6">{title}</h2>;
}

function TextInput({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  onBlur,
  className,
  error,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  className: string;
  error?: string;
}) {
  return (
    <div className="mb-5">
      <label className="block text-[#595858] text-sm font-medium mb-2">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`border border-[#727272] w-full px-3 sm:px-4 py-3 ${className}`}
        style={{ fontSize: "15px" }}
      />
      {error && <ErrorMessage message={error} />}
    </div>
  );
}

function SelectDropdown({
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  options: string[];
  placeholder: string;
  className: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`border border-[#727272] w-full px-2 sm:px-4 py-3 bg-white cursor-pointer appearance-none ${className} ${value ? "text-[#595858]" : "text-gray-400"
          }`}
        style={{ fontSize: "15px", paddingRight: "3rem" }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="text-[#595858]">
            {opt}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
        <svg
          width="11"
          height="7"
          viewBox="0 0 11 7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.3583 0.954562L5.83072 5.7651C5.51947 6.09581 4.99391 6.09581 4.68266 5.7651L0.155056 0.954562C-0.185106 0.5931 0.0711314 0 0.567481 0H9.94582C10.4422 0 10.6984 0.5931 10.3583 0.954562Z"
            fill="#666666"
          />
        </svg>
      </span>
      <div className="absolute right-9 top-3 bottom-0 w-6 h-6 border-r-2 border-gray-400 pointer-events-none"></div>
    </div>
  );
}

function SelectField({
  label,
  placeholder,
  options,
  value,
  onChange,
  onBlur,
  className,
  error,
}: {
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  className: string;
  error?: string;
}) {
  return (
    <div className="mb-5">
      <label className="block text-[#595858] text-sm font-medium mb-2">
        {label}
      </label>
      <SelectDropdown
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        options={options}
        className={className}
      />
      {error && <ErrorMessage message={error} />}
    </div>
  );
}

export default function GroupTravelEnquiryForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    variant: "success" | "error";
    message: string;
  }>({ open: false, variant: "success", message: "" });

  // Validation helpers
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => phone.replace(/\D/g, "").length === 11;

  // Handlers
  const handleChange = (field: FormField, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleBlur = (field: FormField) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    let errorMsg = "";

    if (field === "fullName" && !formData.fullName) {
      errorMsg = "Full name is required.";
    }
    if (field === "contactNumber") {
      if (!formData.contactNumber) {
        errorMsg = "Contact number is required.";
      } else if (!validatePhone(formData.contactNumber)) {
        errorMsg = "Contact number must be exactly 11 digits.";
      }
    }
    if (field === "email") {
      if (!formData.email) {
        errorMsg = "Email address is required.";
      } else if (!validateEmail(formData.email)) {
        errorMsg = "Please enter a valid email address.";
      }
    }

    if (errorMsg) {
      setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    }
  };

  const handleSubmit = async () => {
    const newErrors: FormErrors = {};

    if (!formData.fullName) {
      newErrors.fullName = "Full name is required.";
    }
    if (!formData.contactNumber) {
      newErrors.contactNumber = "Contact number is required.";
    } else if (!validatePhone(formData.contactNumber)) {
      newErrors.contactNumber = "Contact number must be exactly 11 digits.";
    }
    if (!formData.email) {
      newErrors.email = "Email address is required.";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    setErrors(newErrors);
    setTouched({
      fullName: true,
      contactNumber: true,
      email: true,
    });

    if (Object.keys(newErrors).length !== 0) return;

    setIsSubmitting(true);
    setStatusModal((prev) => ({ ...prev, open: false }));

    try {
      const res = await fetch("/api/group-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": createIdempotencyKey("group-booking"),
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          text || `Request failed with status ${res.status} ${res.statusText}`
        );
      }

      setFormData(initialFormData);
      setErrors({});
      setTouched({});
      markThankyouUrl();
      setStatusModal({
        open: true,
        variant: "success",
        message: "Thanks! We’ve received your enquiry. We’ll be in touch shortly.",
      });
    } catch (e) {
      setStatusModal({
        open: true,
        variant: "error",
        message: e instanceof Error ? e.message : "Failed to submit enquiry",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClassName = (field: FormField) => {
    if (errors[field]) {
      return "border-2 border-red-600 focus:border-red-600 focus:outline-none";
    }
    if (touched[field] && formData[field]) {
      return "border-2 border-green-500 focus:border-green-500 focus:outline-none";
    }
    if (touched[field] || formData[field]) {
      return "border-2 border-blue-500 focus:border-blue-500 focus:outline-none";
    }
    return "border border-gray-300 focus:border-blue-500 focus:border-2 focus:outline-none";
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-[1142px] mx-auto">
        <StatusModal
          open={statusModal.open}
          onClose={() => {
            restoreThankyouUrl();
            setStatusModal((prev) => ({ ...prev, open: false }));
          }}
          title="Group holiday enquiry"
          variant={statusModal.variant}
          message={statusModal.message}
        />
        {/* Page Intro (outside form background) */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#CB2187]">
            Group holidays enquiry form
          </h1>

          <h2 className="mt-6 text-xl sm:text-2xl font-medium text-[#595858]">
            How to book a group holiday?
          </h2>

          <ol className="mt-4 list-decimal pl-5 space-y-1 text-[#595858] text-base leading-relaxed">
            <li>Fill in the form below</li>
            <li>
              Wait for one of our expert travel advisors to get in touch to talk
              through your options
            </li>
            <li>Book your perfect group holiday!</li>
          </ol>
        </div>

        <div className="bg-[#EDEDED] p-4 sm:p-8 rounded-lg shadow-sm">
          <div>
            {/* Contact Details Section */}
            <div className="mb-8">
              <SectionHeader title="Contact details" />
              <TextInput
                label="Full name"
                placeholder="Full name"
                value={formData.fullName}
                onChange={(v) => handleChange("fullName", v)}
                onBlur={() => handleBlur("fullName")}
                className={getInputClassName("fullName")}
                error={errors.fullName}
              />
              <TextInput
                label="Contact number"
                placeholder="Contact number"
                type="tel"
                value={formData.contactNumber}
                onChange={(v) => handleChange("contactNumber", v)}
                onBlur={() => handleBlur("contactNumber")}
                className={getInputClassName("contactNumber")}
                error={errors.contactNumber}
              />
              <TextInput
                label="Email address"
                placeholder="Email address"
                type="email"
                value={formData.email}
                onChange={(v) => handleChange("email", v)}
                onBlur={() => handleBlur("email")}
                className={getInputClassName("email")}
                error={errors.email}
              />
            </div>

            {/* About Your Group Section */}
            <div className="mb-8">
              <SectionHeader title="About your group" />
              <SelectField
                label="Group type"
                placeholder="Choose your group type"
                options={["Family", "Friends", "Couple", "Solo", "Business"]}
                value={formData.groupType}
                onChange={(v) => handleChange("groupType", v)}
                onBlur={() => handleBlur("groupType")}
                className={getInputClassName("groupType")}
                error={errors.groupType}
              />
              <SelectField
                label="Total number of passengers"
                placeholder="Total number of passengers"
                options={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"]}
                value={formData.totalPassengers}
                onChange={(v) => handleChange("totalPassengers", v)}
                onBlur={() => handleBlur("totalPassengers")}
                className={getInputClassName("totalPassengers")}
                error={errors.totalPassengers}
              />
              <SelectField
                label="How many children in the group - under 12yrs?"
                placeholder="Number of children"
                options={["0", "1", "2", "3", "4", "5+"]}
                value={formData.children}
                onChange={(v) => handleChange("children", v)}
                onBlur={() => handleBlur("children")}
                className={getInputClassName("children")}
                error={errors.children}
              />
            </div>

            {/* Travel Details Section */}
            <div className="mb-8">
              <SectionHeader title="Your travel details" />
              <SelectField
                label="UK departure airport"
                placeholder="UK departure airport"
                options={[
                  "London Heathrow",
                  "London Gatwick",
                  "Manchester",
                  "Birmingham",
                  "Edinburgh",
                  "Glasgow",
                ]}
                value={formData.departureAirport}
                onChange={(v) => handleChange("departureAirport", v)}
                onBlur={() => handleBlur("departureAirport")}
                className={getInputClassName("departureAirport")}
                error={errors.departureAirport}
              />
              <TextInput
                label="Destination"
                placeholder="Destination"
                value={formData.destination}
                onChange={(v) => handleChange("destination", v)}
                onBlur={() => handleBlur("destination")}
                className={getInputClassName("destination")}
                error={errors.destination}
              />
              <TextInput
                label="Resort / Hotel (if known)"
                placeholder="Resort"
                value={formData.resort}
                onChange={(v) => handleChange("resort", v)}
                onBlur={() => handleBlur("resort")}
                className={getInputClassName("resort")}
                error={errors.resort}
              />
            </div>

            {/* When Are You Travelling Section */}
            <div className="mb-8">
              <SectionHeader title="When are you travelling?" />
              <div className="mb-5">
                <label className="block text-[#595858] text-sm font-medium mb-2">
                  Departure date
                </label>
                <div className="grid grid-cols-3 gap-3 sm:w-[400px]">
                  <SelectDropdown
                    value={formData.departureDay}
                    onChange={(v) => handleChange("departureDay", v)}
                    onBlur={() => handleBlur("departureDay")}
                    placeholder="Day"
                    options={Array.from({ length: 31 }, (_, i) => String(i + 1))}
                    className={getInputClassName("departureDay")}
                  />
                  <SelectDropdown
                    value={formData.departureMonth}
                    onChange={(v) => handleChange("departureMonth", v)}
                    onBlur={() => handleBlur("departureMonth")}
                    placeholder="Month"
                    options={[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ]}
                    className={getInputClassName("departureMonth")}
                  />
                  <SelectDropdown
                    value={formData.departureYear}
                    onChange={(v) => handleChange("departureYear", v)}
                    onBlur={() => handleBlur("departureYear")}
                    placeholder="Year"
                    options={["2024", "2025", "2026"]}
                    className={getInputClassName("departureYear")}
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-[#595858] text-sm font-medium mb-2">
                  Number of nights
                </label>
                <div className="sm:w-[400px]">
                  <SelectDropdown
                    value={formData.nights}
                    onChange={(v) => handleChange("nights", v)}
                    onBlur={() => handleBlur("nights")}
                    placeholder="Number of nights"
                    options={[
                      "1",
                      "2",
                      "3",
                      "4",
                      "5",
                      "6",
                      "7",
                      "8",
                      "9",
                      "10",
                      "11",
                      "12",
                      "13",
                      "14",
                      "14+",
                    ]}
                    className={getInputClassName("nights")}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#CB2187] hover:bg-pink-700 text-white font-semibold px-8 py-3 rounded-[8px] transition-colors duration-200"
              style={{ fontSize: "16px" }}
            >
              {isSubmitting ? "Submitting..." : "Submit Enquiry"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


