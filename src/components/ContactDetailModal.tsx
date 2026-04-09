import { X, Pencil } from 'lucide-react';

export interface ContactDetailData {
  name: string;
  title: string;
  email: string;
  phone: string;
  role: string;
  company: string;
}

export function ContactDetailModal({
  contact,
  onClose,
  onEdit,
}: {
  contact: ContactDetailData;
  onClose: () => void;
  onEdit?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-slate-800">{contact.name}</h3>
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={onEdit}
                className="rounded p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                title="Edit contact"
              >
                <Pencil size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <DetailRow label="Title" value={contact.title} />
          <DetailRow label="Company" value={contact.company} />
          <DetailRow label="Email" value={contact.email} />
          <DetailRow label="Phone" value={contact.phone} />
          <DetailRow label="Role" value={contact.role} />
        </div>

        <div className="mt-5 flex items-center gap-3">
          {onEdit && (
            <button
              onClick={onEdit}
              className="rounded-lg bg-slate-800 px-5 py-2 text-[13px] font-medium text-white transition hover:bg-slate-700"
            >
              Edit Contact
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-5 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-16 shrink-0 text-[11px] font-medium uppercase tracking-[0.05em] text-slate-400">
        {label}
      </span>
      <span className="text-[13px] text-slate-700">
        {value || '\u2014'}
      </span>
    </div>
  );
}
