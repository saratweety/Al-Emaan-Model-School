"use client";

import { useMemo, useState, useTransition, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FamilyIcon,
  ChevronRightIcon,
  SearchIcon,
  ChevronDownIcon,
  FunnelIcon,
  CloudUploadIcon,
  PlusIcon,
  MoreVerticalIcon,
  XIcon,
  LockIcon,
  PencilIcon,
  MailIcon,
  PhoneIcon,
  EyeIcon,
  UsersIcon,
} from "@/components/icons";
import { useToast } from "@/lib/toast";
import { initials } from "@/lib/format";
import SessionBadge from "./SessionBadge";
import {
  createParentAccount,
  linkChildToParent,
  setParentActive,
  updateParent,
  setParentPassword,
} from "@/app/dashboard/parents/actions";
import type { ParentAccount, LinkedChild, LinkableStudent } from "@/lib/parents-list-data";
import SetPasswordModal from "@/components/ui/SetPasswordModal";

const AVATAR_COLORS = ["bg-[#13714C]", "bg-blue-500", "bg-orange-500", "bg-purple-500", "bg-[#e8608a]"];

type Panel = { type: "view"; parentId: string; startEditing?: boolean } | { type: "add" } | null;

export default function ParentsManager({
  parents,
  linkableStudents,
}: {
  parents: ParentAccount[];
  linkableStudents: LinkableStudent[];
}) {
  const { showToast } = useToast();
  const [panel, setPanel] = useState<Panel>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [childrenFilter, setChildrenFilter] = useState<"All" | "1" | "2" | "3+">("All");
  const [rowMenuId, setRowMenuId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; right: number } | null>(null);
  const [passwordModalParentId, setPasswordModalParentId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return parents.filter((p) => {
      if (statusFilter !== "All" && p.status !== statusFilter) return false;
      if (childrenFilter !== "All") {
        const n = p.children.length;
        if (childrenFilter === "3+" ? n < 3 : String(n) !== childrenFilter) return false;
      }
      if (!term) return true;
      return (
        p.name.toLowerCase().includes(term) ||
        p.phone.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term)
      );
    });
  }, [parents, search, statusFilter, childrenFilter]);

  function resetFilters() {
    setSearch("");
    setStatusFilter("All");
    setChildrenFilter("All");
  }

  const totalChildrenLinked = new Set(parents.flatMap((p) => p.children.map((c) => c.id))).size;
  const activeCount = parents.filter((p) => p.status === "Active").length;
  const inactiveCount = parents.filter((p) => p.status === "Inactive").length;

  const viewingParent = panel?.type === "view" ? parents.find((p) => p.id === panel.parentId) ?? null : null;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#A2E494]/25 text-[#13714C]">
            <FamilyIcon className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Link href="/dashboard" className="hover:text-[#13714C] hover:underline">
                Dashboard
              </Link>
              <ChevronRightIcon className="h-3 w-3" />
              <span className="font-semibold text-[#13714C]">Parents</span>
            </div>
            <h1 className="mt-0.5 truncate text-xl font-extrabold text-[#0f4d34] sm:text-2xl">Parents</h1>
            <p className="text-sm text-gray-500">Manage parent accounts, logins and linked children.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SessionBadge />
          <button
            type="button"
            onClick={() => showToast("Bulk import isn't connected yet.", "info")}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            <CloudUploadIcon className="h-4 w-4" />
            Import Parents
          </button>
          <button
            type="button"
            onClick={() => setPanel({ type: "add" })}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            <PlusIcon className="h-4 w-4" />
            Add Parent
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-4">
          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#A2E494]/25 text-[#13714C]">
                <FamilyIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-gray-500">Total Parents</p>
                <p className="text-xl font-extrabold text-gray-800">{parents.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <UsersIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-gray-500">Active Accounts</p>
                <p className="text-xl font-extrabold text-gray-800">{activeCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <UsersIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-gray-500">Inactive Accounts</p>
                <p className="text-xl font-extrabold text-gray-800">{inactiveCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <FamilyIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-gray-500">Total Children Linked</p>
                <p className="text-xl font-extrabold text-gray-800">{totalChildrenLinked}</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <div className="relative min-w-[220px] flex-1">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by parent name, phone or email..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-gray-400">Account Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-[#3AB67D]"
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-gray-400">Children</label>
              <select
                value={childrenFilter}
                onChange={(e) => setChildrenFilter(e.target.value as typeof childrenFilter)}
                className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-[#3AB67D]"
              >
                <option value="All">All</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3+">3+</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => showToast("Filters apply automatically as you type.", "info")}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              <FunnelIcon className="h-4 w-4 text-gray-400" />
              Filter
            </button>
            <button
              type="button"
              onClick={resetFilters}
              aria-label="Reset filters"
              className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 hover:bg-gray-50"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path
                  d="M4 12a8 8 0 1 1 2.6 5.9M4 12V7m0 5h5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            {filtered.length === 0 ? (
              <p className="rounded-xl bg-[#F4F6F5] p-4 text-center text-sm font-semibold text-gray-500">
                {parents.length === 0 ? "No parents yet. Use “Add Parent” to create the first account." : "No parents match these filters."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead>
                    <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                      <th className="rounded-l-xl px-3 py-3">Parent / Guardian</th>
                      <th className="px-3 py-3">Contact / Email</th>
                      <th className="px-3 py-3">Children</th>
                      <th className="px-3 py-3">Account Status</th>
                      <th className="px-3 py-3">Account Created</th>
                      <th className="rounded-r-xl px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, i) => (
                      <tr
                        key={p.id}
                        onClick={() => setPanel({ type: "view", parentId: p.id })}
                        className="cursor-pointer border-b border-gray-50 last:border-0 hover:bg-gray-50"
                      >
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                                AVATAR_COLORS[i % AVATAR_COLORS.length]
                              }`}
                            >
                              {initials(p.name)}
                            </span>
                            <span className="font-bold text-gray-800">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-gray-600">
                          <span className="block">{p.phone}</span>
                          <span className="block text-xs text-gray-400">{p.email}</span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center">
                            {p.children.slice(0, 2).map((c, idx) => (
                              <span
                                key={c.id}
                                style={{ marginLeft: idx === 0 ? 0 : -8 }}
                                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white ${
                                  AVATAR_COLORS[idx % AVATAR_COLORS.length]
                                }`}
                              >
                                {initials(c.name)}
                              </span>
                            ))}
                            {p.children.length > 2 && (
                              <span
                                style={{ marginLeft: -8 }}
                                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-[10px] font-bold text-gray-600"
                              >
                                +{p.children.length - 2}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs font-semibold text-gray-500">
                            {p.children.length} {p.children.length === 1 ? "child" : "children"}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              p.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-gray-600">{p.accountCreated}</td>
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              aria-label="More actions"
                              onClick={(e) => {
                                if (rowMenuId === p.id) {
                                  setRowMenuId(null);
                                  return;
                                }
                                const rect = e.currentTarget.getBoundingClientRect();
                                setMenuAnchor({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
                                setRowMenuId(p.id);
                              }}
                              className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
                            >
                              <MoreVerticalIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {parents.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-500">Showing {filtered.length} of {parents.length} parents</p>
              </div>
            )}
          </div>
        </div>

        {panel && (
          <div className="w-full shrink-0 lg:w-[380px]">
            {panel.type === "view" && viewingParent && (
              <ParentDetailsPanel
                parent={viewingParent}
                linkableStudents={linkableStudents}
                startEditing={panel.startEditing}
                onClose={() => setPanel(null)}
              />
            )}
            {panel.type === "add" && <AddParentPanel linkableStudents={linkableStudents} onClose={() => setPanel(null)} />}
          </div>
        )}
      </div>

      {rowMenuId &&
        menuAnchor &&
        (() => {
          const menuParent = parents.find((p) => p.id === rowMenuId);
          if (!menuParent) return null;
          return (
            <RowMenuPortal anchor={menuAnchor} onClose={() => setRowMenuId(null)}>
              <ParentRowMenu
                parent={menuParent}
                onClose={() => setRowMenuId(null)}
                onEdit={() => setPanel({ type: "view", parentId: menuParent.id, startEditing: true })}
                onResetPassword={() => setPasswordModalParentId(menuParent.id)}
              />
            </RowMenuPortal>
          );
        })()}

      <SetPasswordModal
        open={Boolean(passwordModalParentId)}
        onClose={() => setPasswordModalParentId(null)}
        onSubmit={async (newPassword) => {
          const result = await setParentPassword(passwordModalParentId!, newPassword);
          if (result.success) showToast("Password updated.", "success");
          return result;
        }}
      />
    </>
  );
}

function RowMenuPortal({
  anchor,
  onClose,
  children,
}: {
  anchor: { top: number; right: number };
  onClose: () => void;
  children: ReactNode;
}) {
  return createPortal(
    <>
      <div role="presentation" className="fixed inset-0 z-40" onClick={onClose} />
      <div
        style={{ position: "fixed", top: anchor.top, right: anchor.right }}
        className="z-50 w-40 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg"
      >
        {children}
      </div>
    </>,
    document.body
  );
}

function ParentRowMenu({
  parent,
  onClose,
  onEdit,
  onResetPassword,
}: {
  parent: ParentAccount;
  onClose: () => void;
  onEdit: () => void;
  onResetPassword: () => void;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  function toggleActive() {
    startTransition(async () => {
      const result = await setParentActive(parent.id, parent.status !== "Active");
      onClose();
      if (!result.success) {
        showToast(result.error, "error");
        return;
      }
      showToast(parent.status === "Active" ? "Parent account deactivated." : "Parent account activated.", "success");
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          onClose();
          onEdit();
        }}
        className="block w-full px-3.5 py-2 text-left text-xs font-semibold text-gray-600 hover:bg-gray-50"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={() => {
          onClose();
          onResetPassword();
        }}
        className="block w-full px-3.5 py-2 text-left text-xs font-semibold text-gray-600 hover:bg-gray-50"
      >
        Reset Password
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={toggleActive}
        className="block w-full px-3.5 py-2 text-left text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60"
      >
        {parent.status === "Active" ? "Deactivate" : "Activate"}
      </button>
    </>
  );
}

function ParentDetailsPanel({
  parent,
  linkableStudents,
  startEditing,
  onClose,
}: {
  parent: ParentAccount;
  linkableStudents: LinkableStudent[];
  startEditing?: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [linking, setLinking] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [relationship, setRelationship] = useState("Guardian");
  const [editing, setEditing] = useState(Boolean(startEditing));
  const [editName, setEditName] = useState(parent.name);
  const [editPhone, setEditPhone] = useState(parent.phone);
  const [editEmail, setEditEmail] = useState(parent.email);
  const [savingEdit, setSavingEdit] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const alreadyLinkedIds = new Set(parent.children.map((c) => c.id));
  const candidates = linkableStudents.filter((s) => !alreadyLinkedIds.has(s.id));

  function openEdit() {
    setEditName(parent.name);
    setEditPhone(parent.phone);
    setEditEmail(parent.email);
    setEditing(true);
  }

  async function handleSaveEdit() {
    setSavingEdit(true);
    const result = await updateParent(parent.id, { fullName: editName, phone: editPhone, email: editEmail });
    setSavingEdit(false);

    if (!result.success) {
      showToast(result.error, "error");
      return;
    }

    showToast("Parent details updated.", "success");
    setEditing(false);
    router.refresh();
  }

  function handleLink(studentId: string) {
    startTransition(async () => {
      const result = await linkChildToParent(parent.id, studentId, relationship);
      if (!result.success) {
        showToast(result.error, "error");
        return;
      }
      showToast("Child linked.", "success");
      setLinking(false);
      setPickerOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="sticky top-4 space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <h2 className="text-base font-bold text-[#0f4d34]">Parent Details</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      {editing ? (
        <div className="space-y-3 border-b border-gray-100 pb-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Full Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Contact Number</label>
            <input
              type="tel"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Email / Username</label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={savingEdit}
              className="rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={savingEdit}
              className="rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {savingEdit ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center gap-2 border-b border-gray-100 pb-4 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#A2E494]/30 text-lg font-bold text-[#13714C]">
              {initials(parent.name)}
            </span>
            <p className="text-base font-extrabold text-gray-800">{parent.name}</p>
            <a href={`tel:${parent.phone}`} className="text-sm font-semibold text-blue-600 hover:underline">
              {parent.phone}
            </a>
            <a href={`mailto:${parent.email}`} className="text-sm font-semibold text-blue-600 hover:underline">
              {parent.email}
            </a>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                parent.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
              }`}
            >
              {parent.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={openEdit}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            >
              <PencilIcon className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setPasswordModalOpen(true)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            >
              <LockIcon className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </>
      )}

      <SetPasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={async (newPassword) => {
          const result = await setParentPassword(parent.id, newPassword);
          if (result.success) showToast("Password updated.", "success");
          return result;
        }}
      />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-700">Linked Children ({parent.children.length})</h3>
          <button
            type="button"
            onClick={() => setLinking((v) => !v)}
            className="flex items-center gap-1 rounded-lg bg-[#A2E494]/20 px-2.5 py-1 text-xs font-bold text-[#13714C] hover:bg-[#A2E494]/35"
          >
            <PlusIcon className="h-3 w-3" />
            Link Child
          </button>
        </div>

        {linking && (
          <div className="mb-3 space-y-2 rounded-xl border border-gray-100 p-3">
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#3AB67D]"
            >
              <option>Father</option>
              <option>Mother</option>
              <option>Guardian</option>
            </select>
            <div className="relative">
              <button
                type="button"
                onClick={() => setPickerOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-xs text-gray-500"
              >
                {candidates.length === 0 ? "No unlinked students found" : "Select a child to link"}
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </button>
              {pickerOpen && candidates.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg">
                  {candidates.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      disabled={isPending}
                      onClick={() => handleLink(c.id)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-60"
                    >
                      <span className="font-semibold text-gray-700">{c.name}</span>
                      <span className="text-xs text-gray-400">{c.className}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {parent.children.map((c: LinkedChild) => (
            <div key={c.id} className="flex w-full items-center gap-3 rounded-xl border border-gray-100 p-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                {initials(c.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-gray-800">{c.name}</span>
                <span className="block text-xs text-gray-500">{c.className}</span>
                <span className="block text-xs text-gray-400">Admission No: {c.admissionId}</span>
              </span>
            </div>
          ))}
          {parent.children.length === 0 && (
            <p className="rounded-xl bg-[#F4F6F5] p-3 text-center text-xs font-semibold text-gray-500">No children linked yet.</p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h3 className="mb-2 text-sm font-bold text-gray-700">Account Information</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">Username / Email</dt>
            <dd className="font-semibold text-gray-800">{parent.email}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">Account Created</dt>
            <dd className="font-semibold text-gray-800">{parent.accountCreated}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">Status</dt>
            <dd>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  parent.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                }`}
              >
                {parent.status}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function AddParentPanel({ linkableStudents, onClose }: { linkableStudents: LinkableStudent[]; onClose: () => void }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selected, setSelected] = useState<LinkableStudent[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  function toggleChild(child: LinkableStudent) {
    setSelected((prev) => (prev.some((c) => c.id === child.id) ? prev.filter((c) => c.id !== child.id) : [...prev, child]));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }
    if (selected.length === 0) {
      showToast("Link at least one child.", "error");
      return;
    }

    const formData = new FormData();
    formData.set("name", name);
    formData.set("phone", contact);
    formData.set("email", email);
    formData.set("password", password);
    for (const child of selected) formData.append("student_ids", child.id);

    setSaving(true);
    const result = await createParentAccount(formData);
    setSaving(false);

    if (!result.success) {
      showToast(result.error, "error");
      return;
    }

    showToast("Parent account created.", "success");
    onClose();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="sticky top-4 space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-[#0f4d34]">Add New Parent</h2>
          <p className="text-xs text-gray-400">Create parent account and link children.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-gray-700">Parent Information</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Parent / Guardian Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <PhoneIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="03XX-XXXXXXX"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Email / Username <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MailIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email (will be used for login)"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-11 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
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
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-11 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <EyeIcon className="h-4 w-4" off={showConfirm} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h3 className="mb-3 text-sm font-bold text-gray-700">Link Children</h3>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          Select Children <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-left text-sm text-gray-500 outline-none focus:border-[#3AB67D]"
          >
            Search and select children
            <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${pickerOpen ? "rotate-180" : ""}`} />
          </button>
          {pickerOpen && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg">
              {linkableStudents.length === 0 ? (
                <p className="px-2.5 py-2 text-sm text-gray-400">No students found.</p>
              ) : (
                linkableStudents.map((c) => {
                  const isSelected = selected.some((s) => s.id === c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleChild(c)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-gray-50 ${
                        isSelected ? "bg-[#A2E494]/15" : ""
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          isSelected ? "border-[#13714C] bg-[#13714C]" : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 text-white">
                            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span className="font-semibold text-gray-700">{c.name}</span>
                      <span className="text-xs text-gray-400">{c.className}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="mt-3 space-y-2">
          {selected.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                {initials(c.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-gray-800">{c.name}</span>
                <span className="block text-xs text-gray-500">{c.className}</span>
              </span>
              <button
                type="button"
                onClick={() => toggleChild(c)}
                aria-label={`Remove ${c.name}`}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Creating..." : "Create Parent"}
        </button>
      </div>
    </form>
  );
}
