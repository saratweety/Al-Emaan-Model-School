"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast";
import { UserIcon, CameraIcon, FileTextIcon, WalletIcon, XIcon, SaveIcon } from "@/components/icons";
import FileDropzone from "@/components/ui/FileDropzone";
import type { SchoolClass } from "@/lib/classes-data";

function formatAmount(value: number) {
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function uploadIfPresent(
  supabase: SupabaseClient,
  bucket: string,
  folder: string,
  fileName: string,
  file: File | null | undefined
): Promise<string | null> {
  if (!file) return null;
  const ext = file.name.split(".").pop() || "bin";
  const path = `${folder}/${fileName}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw new Error(`${fileName} upload failed: ${error.message}`);
  return path;
}

export type EditableStudent = {
  id: string;
  admissionNo: string;
  fullName: string;
  fatherName: string;
  dateOfBirth: string | null;
  gender: string | null;
  contactNumber: string | null;
  classId: string | null;
  monthlyFee: number;
  admissionFee: number;
  otherCharges: number;
  photoUrl: string | null;
  bFormUrl: string | null;
  certificateUrl: string | null;
  otherDocumentUrl: string | null;
};

export type ExistingStudentFiles = {
  photo?: string | null;
  bForm?: string | null;
  certificate?: string | null;
  otherDoc?: string | null;
};

export default function AddStudentForm({
  classes,
  currentSessionId,
  student,
  existingFileUrls,
}: {
  classes: SchoolClass[];
  currentSessionId: string | null;
  student?: EditableStudent;
  existingFileUrls?: ExistingStudentFiles;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEditing = Boolean(student);
  const [admissionNo, setAdmissionNo] = useState(student?.admissionNo ?? "");
  const [studentName, setStudentName] = useState(student?.fullName ?? "");
  const [fatherName, setFatherName] = useState(student?.fatherName ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(student?.dateOfBirth ?? "");
  const [gender, setGender] = useState(student?.gender ?? "");
  const [selectedClassId, setSelectedClassId] = useState(student?.classId ?? "");
  const [contactNumber, setContactNumber] = useState(student?.contactNumber ?? "");

  const [monthlyFee, setMonthlyFee] = useState(student ? String(student.monthlyFee) : "");
  const [admissionFee, setAdmissionFee] = useState(student ? String(student.admissionFee) : "");
  const [otherCharges, setOtherCharges] = useState(student ? String(student.otherCharges) : "");

  const [saving, setSaving] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const bFormInputRef = useRef<HTMLInputElement>(null);
  const certificateInputRef = useRef<HTMLInputElement>(null);
  const otherDocInputRef = useRef<HTMLInputElement>(null);

  const total = useMemo(() => {
    const sum = [monthlyFee, admissionFee, otherCharges].reduce(
      (acc, v) => acc + (parseFloat(v) || 0),
      0
    );
    return formatAmount(sum);
  }, [monthlyFee, admissionFee, otherCharges]);

  function clearForm() {
    setAdmissionNo("");
    setStudentName("");
    setFatherName("");
    setDateOfBirth("");
    setGender("");
    setSelectedClassId("");
    setContactNumber("");
    setMonthlyFee("");
    setAdmissionFee("");
    setOtherCharges("");
    if (photoInputRef.current) photoInputRef.current.value = "";
    if (bFormInputRef.current) bFormInputRef.current.value = "";
    if (certificateInputRef.current) certificateInputRef.current.value = "";
    if (otherDocInputRef.current) otherDocInputRef.current.value = "";
  }

  async function handleSaveStudent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!currentSessionId) {
      showToast("No current academic session is configured. Set one before enrolling students.", "error");
      return;
    }

    setSaving(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      showToast("You are not logged in.", "error");
      setSaving(false);
      return;
    }

    const fileFolder = student?.id ?? crypto.randomUUID();
    let photoPath: string | null = null;
    let bFormPath: string | null = null;
    let certificatePath: string | null = null;
    let otherDocPath: string | null = null;

    try {
      [photoPath, bFormPath, certificatePath, otherDocPath] = await Promise.all([
        uploadIfPresent(supabase, "student-files", fileFolder, "photo", photoInputRef.current?.files?.[0]),
        uploadIfPresent(supabase, "student-files", fileFolder, "b-form", bFormInputRef.current?.files?.[0]),
        uploadIfPresent(supabase, "student-files", fileFolder, "certificate", certificateInputRef.current?.files?.[0]),
        uploadIfPresent(supabase, "student-files", fileFolder, "other-document", otherDocInputRef.current?.files?.[0]),
      ]);
    } catch (err) {
      setSaving(false);
      showToast(err instanceof Error ? err.message : "Couldn't upload the attached files.", "error");
      return;
    }

    const studentRow = {
      admission_no: admissionNo,
      full_name: studentName,
      father_name: fatherName,
      date_of_birth: dateOfBirth || null,
      gender: gender || null,
      contact_number: contactNumber || null,
      class_name: classes.find((c) => c.id === selectedClassId)?.name ?? "",
      monthly_fee: Number(monthlyFee) || 0,
      admission_fee: Number(admissionFee) || 0,
      other_charges: Number(otherCharges) || 0,
      photo_url: photoPath ?? student?.photoUrl ?? null,
      b_form_url: bFormPath ?? student?.bFormUrl ?? null,
      certificate_url: certificatePath ?? student?.certificateUrl ?? null,
      other_document_url: otherDocPath ?? student?.otherDocumentUrl ?? null,
    };

    const studentId = isEditing
      ? await (async () => {
          const { error: updateError } = await supabase.from("students").update(studentRow).eq("id", student!.id);
          return updateError ? { error: updateError } : { id: student!.id };
        })()
      : await (async () => {
          const { data, error: insertError } = await supabase
            .from("students")
            .insert({ ...studentRow, created_by: user.id })
            .select("id")
            .single();
          return insertError || !data ? { error: insertError } : { id: data.id };
        })();

    if ("error" in studentId) {
      setSaving(false);
      console.error(studentId.error);
      showToast(studentId.error?.message ?? "Couldn't save the student.", "error");
      return;
    }

    const { data: existingEnrollment } = await supabase
      .from("student_enrollments")
      .select("id")
      .eq("student_id", studentId.id)
      .eq("session_id", currentSessionId)
      .maybeSingle();

    const { error: enrollmentError } = existingEnrollment
      ? await supabase.from("student_enrollments").update({ class_id: selectedClassId }).eq("id", existingEnrollment.id)
      : await supabase.from("student_enrollments").insert({
          student_id: studentId.id,
          session_id: currentSessionId,
          class_id: selectedClassId,
        });

    setSaving(false);

    if (enrollmentError) {
      console.error(enrollmentError);
      showToast(`Student was saved, but enrolling them in the class failed: ${enrollmentError.message}`, "error");
      return;
    }

    if (isEditing) {
      showToast("Student updated successfully!", "success");
      router.push(`/dashboard/students/${studentId.id}`);
      router.refresh();
    } else {
      showToast("Student added successfully!", "success");
      clearForm();
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSaveStudent}>
      {/* Student Information */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
          <UserIcon className="h-4 w-4" />
          Student Information
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="row-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Student Photo</label>
            <FileDropzone
              inputRef={photoInputRef}
              label="Upload Photo"
              hint="JPG, PNG (Max 2MB)"
              accept="image/png,image/jpeg"
              height={168}
              icon={CameraIcon}
              imageCaption="Click to change"
              existingUrl={existingFileUrls?.photo}
              existingPath={student?.photoUrl}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Admission No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={admissionNo}
              onChange={(e) => setAdmissionNo(e.target.value)}
              placeholder="e.g. AEMS-001"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Student Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Enter student full name"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Father Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
              placeholder="Enter father name"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Class <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Contact Number</label>
            <input
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="e.g. 0300-1234567"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
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
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">B-Form Copy</label>
            <FileDropzone
              inputRef={bFormInputRef}
              label="Upload B-Form Copy"
              existingUrl={existingFileUrls?.bForm}
              existingPath={student?.bFormUrl}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Previous School Certificate</label>
            <FileDropzone
              inputRef={certificateInputRef}
              label="Upload Certificate"
              existingUrl={existingFileUrls?.certificate}
              existingPath={student?.certificateUrl}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Other Document (Optional)</label>
            <FileDropzone
              inputRef={otherDocInputRef}
              label="Upload Document"
              existingUrl={existingFileUrls?.otherDoc}
              existingPath={student?.otherDocumentUrl}
            />
          </div>
        </div>
      </section>

      {/* Fee Information */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
          <WalletIcon className="h-4 w-4" />
          Fee Information
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Monthly Fee <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              required
              value={monthlyFee}
              onChange={(e) => setMonthlyFee(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Admission Fee <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              required
              value={admissionFee}
              onChange={(e) => setAdmissionFee(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Other Charges (Optional)</label>
            <input
              type="number"
              min="0"
              value={otherCharges}
              onChange={(e) => setOtherCharges(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Total (Auto)</label>
            <div className="w-full rounded-xl border border-gray-200 bg-[#F4F6F5] px-4 py-2.5 text-sm font-bold text-gray-500">
              {total}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-4">
          {isEditing ? (
            <Link
              href={`/dashboard/students/${student!.id}`}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              <XIcon className="h-4 w-4" />
              Cancel
            </Link>
          ) : (
            <button
              type="button"
              onClick={clearForm}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              <XIcon className="h-4 w-4" />
              Clear Form
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <SaveIcon className="h-4 w-4" />
            {saving ? "Saving..." : isEditing ? "Update Student" : "Save Student"}
          </button>
        </div>
      </section>
    </form>
  );
}
