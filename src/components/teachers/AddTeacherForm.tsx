"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/lib/toast";
import { createTeacherAccount } from "@/app/dashboard/teachers/add/actions";
import { updateTeacher, setTeacherPassword } from "@/app/dashboard/teachers/[id]/actions";
import type { Subject } from "@/lib/subjects-data";
import { UserIcon, CameraIcon, BriefcaseIcon, FileTextIcon, LockIcon, EyeIcon, XIcon, SaveIcon } from "@/components/icons";
import FileDropzone from "@/components/ui/FileDropzone";
import SetPasswordModal from "@/components/ui/SetPasswordModal";

export type EditableTeacher = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string | null;
  cnic: string | null;
  qualification: string | null;
  specializationSubjectId: string | null;
  experienceYears: number | null;
  deviceUserId?: string | null;
  photoUrl?: string | null;
  cnicDocumentUrl?: string | null;
  certificateUrl?: string | null;
  otherDocumentUrl?: string | null;
};

export type ExistingTeacherFiles = {
  photo?: string | null;
  cnicDocument?: string | null;
  certificate?: string | null;
  otherDoc?: string | null;
};

export default function AddTeacherForm({
  subjects,
  teacher,
  existingFileUrls,
}: {
  subjects: Subject[];
  teacher?: EditableTeacher;
  existingFileUrls?: ExistingTeacherFiles;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEditing = Boolean(teacher);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = isEditing ? await updateTeacher(teacher!.id, formData) : await createTeacherAccount(formData);

    setSubmitting(false);

    if (!result.success) {
      showToast(result.error, "error");
      return;
    }

    showToast(isEditing ? "Teacher updated." : "Teacher account created.", "success");
    router.push(isEditing ? `/dashboard/teachers/${teacher!.id}` : "/dashboard/teachers");
    router.refresh();
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Personal Information */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
          <UserIcon className="h-4 w-4" />
          Personal Information
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="row-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Teacher Photo</label>
            <FileDropzone
              name="photo"
              label="Upload Photo"
              hint="JPG, PNG (Max 2MB)"
              accept="image/png,image/jpeg"
              height={168}
              icon={CameraIcon}
              imageCaption="Click to change"
              existingUrl={existingFileUrls?.photo}
              existingPath={teacher?.photoUrl}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              required
              defaultValue={teacher?.fullName}
              placeholder="Enter teacher full name"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Contact Number</label>
            <input
              type="tel"
              name="phone"
              defaultValue={teacher?.phone ?? ""}
              placeholder="+92 300 0000000"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">CNIC / ID Number</label>
            <input
              type="text"
              name="cnic"
              defaultValue={teacher?.cnic ?? ""}
              placeholder="00000-0000000-0"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              defaultValue={teacher?.email}
              placeholder="Used to log in to the teacher portal"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
        </div>
      </section>

      {/* Professional Information */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
          <BriefcaseIcon className="h-4 w-4" />
          Professional Information
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Qualification</label>
            <select
              name="qualification"
              defaultValue={teacher?.qualification ?? ""}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            >
              <option value="">Select Qualification</option>
              <option>Matric</option>
              <option>Intermediate</option>
              <option>Bachelors</option>
              <option>Masters</option>
              <option>M.Phil / PhD</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Specialization / Subject</label>
            <select
              name="specialization_subject_id"
              defaultValue={teacher?.specializationSubjectId ?? ""}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            >
              <option value="">
                {subjects.length === 0 ? "No subjects set up yet" : "Select Subject"}
              </option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Experience (Years)</label>
            <input
              type="number"
              name="experience_years"
              min="0"
              defaultValue={teacher?.experienceYears ?? ""}
              placeholder="Enter experience"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Fingerprint Device ID</label>
            <input
              type="text"
              name="device_user_id"
              defaultValue={teacher?.deviceUserId ?? ""}
              placeholder="User ID set on the K40, e.g. 1"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
            <p className="mt-1 text-xs text-gray-400">Must match the User ID you enter when enrolling this teacher&apos;s fingerprint on the device.</p>
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
          <FileTextIcon className="h-4 w-4" />
          Documents
        </h2>
        <p className="mb-4 -mt-1 text-xs text-gray-400">
          Files are stored securely and are only accessible to the principal.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">CNIC Copy</label>
            <FileDropzone
              name="cnic_document"
              label="Upload CNIC Copy"
              existingUrl={existingFileUrls?.cnicDocument}
              existingPath={teacher?.cnicDocumentUrl}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Educational Certificate</label>
            <FileDropzone
              name="certificate_document"
              label="Upload Certificate"
              existingUrl={existingFileUrls?.certificate}
              existingPath={teacher?.certificateUrl}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Other Document (Optional)</label>
            <FileDropzone
              name="other_document"
              label="Upload Document"
              existingUrl={existingFileUrls?.otherDoc}
              existingPath={teacher?.otherDocumentUrl}
            />
          </div>
        </div>
      </section>

      {/* Contact & Account Information */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
          <LockIcon className="h-4 w-4" />
          Contact &amp; Account Information
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              required
              defaultValue={teacher?.username}
              placeholder="Enter username"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          {!isEditing && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    minLength={6}
                    placeholder="Enter password"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <EyeIcon className="h-4 w-4" off={showPassword} />
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirm_password"
                    required
                    minLength={6}
                    placeholder="Confirm password"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                  />
                  <button
                    type="button"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <EyeIcon className="h-4 w-4" off={showConfirm} />
                  </button>
                </div>
              </div>
            </>
          )}
          {isEditing && (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Password</label>
              <button
                type="button"
                onClick={() => setPasswordModalOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                <LockIcon className="h-4 w-4" />
                Reset Password
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <Link
            href={isEditing ? `/dashboard/teachers/${teacher!.id}` : "/dashboard/teachers"}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            <XIcon className="h-4 w-4" />
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <SaveIcon className="h-4 w-4" />
            {submitting ? "Saving..." : isEditing ? "Update Teacher" : "Save Teacher Record"}
          </button>
        </div>
      </section>
    </form>

      {isEditing && (
        <SetPasswordModal
          open={passwordModalOpen}
          onClose={() => setPasswordModalOpen(false)}
          onSubmit={async (newPassword) => {
            const result = await setTeacherPassword(teacher!.id, newPassword);
            if (result.success) showToast("Password updated.", "success");
            return result;
          }}
        />
      )}
    </>
  );
}
