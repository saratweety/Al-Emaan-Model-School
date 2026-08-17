"use client";

import Modal from "@/components/ui/Modal";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export default function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Change Password">
      <ChangePasswordForm />
    </Modal>
  );
}
