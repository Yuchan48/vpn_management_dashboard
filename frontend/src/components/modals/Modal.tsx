type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="flex w-full max-w-[90vw] flex-col items-center rounded-lg bg-white p-4 shadow-lg sm:max-w-lg md:p-6"
        >
          <div className="mb-4 flex w-full items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="text-gray-600 hover:text-gray-800 font-bold"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>

          <div className="w-full flex justify-center">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
