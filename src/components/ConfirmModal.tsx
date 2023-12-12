import { Button, Modal } from "flowbite-react";
import { BsFillExclamationTriangleFill } from "react-icons/bs";

export default function ConfirmModal({ ...props }) {
  return (
    <>
      <Modal
        show={props.openModal === "confirm-modal"}
        size="md"
        popup
        onClose={() => props.setOpenModal(undefined)}
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <BsFillExclamationTriangleFill className="mx-auto mb-4 h-14 w-14 text-red-500" />
            <div className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              {props.message}
            </div>
            <div className="flex justify-center gap-4">
              <Button
                color="failure"
                onClick={() => {
                  props.setOpenModal(undefined);
                  props.deleteCallback(true);
                }}
              >
                Yes, I&apos;m sure
              </Button>
              <Button
                color="gray"
                onClick={() => props.setOpenModal(undefined)}
              >
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
