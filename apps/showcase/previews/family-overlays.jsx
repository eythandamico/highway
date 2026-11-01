"use client";
import { useExampleState } from "./example-state";
import { createPortal } from 'react-dom';
import { TextInput } from '../../../packages/highway-react/src/invariant/components/text-input.jsx';
import { Button } from '../../../packages/highway-react/src/invariant/components/button.jsx';
import { BottomSheet } from '../../../packages/highway-react/src/invariant/components/bottom-sheet.jsx';
import { Dialog } from '../../../packages/highway-react/src/invariant/components/dialog.jsx';
import { Modal } from '../../../packages/highway-react/src/invariant/components/modal.jsx';
import { ComponentStage } from "./preview-helpers.jsx";
export function DialogExample() {
    const [dialogOpen, setDialogOpen] = useExampleState("dialogOpen", false);
    return (<>
          <ComponentStage>
            <button type="button" onClick={() => setDialogOpen(true)} className="px-4 py-2.5 text-[15px] font-medium rounded-xl bg-[var(--inv-heading)] text-[var(--inv-bg)] cursor-pointer transition-[scale] duration-200 ease-out active:scale-[0.96]">
              Open Dialog
            </button>
          </ComponentStage>
          {createPortal(<Dialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title="Delete project?" description="This action cannot be undone. All data will be permanently removed." actions={<>
                  <Button label="Cancel" variant="ghost" onClick={() => setDialogOpen(false)}/>
                  <Button label="Delete" variant="danger" onClick={() => setDialogOpen(false)}/>
                </>}/>, document.body)}
        </>);
}
export function ModalExample() {
    const [modalOpen, setModalOpen] = useExampleState("modalOpen", false);
    return (<>
          <ComponentStage>
            <button type="button" onClick={() => setModalOpen(true)} className="px-4 py-2.5 text-[15px] font-medium rounded-xl bg-[var(--inv-heading)] text-[var(--inv-bg)] cursor-pointer transition-[scale] duration-200 ease-out active:scale-[0.96]">
              Open Modal
            </button>
          </ComponentStage>
          {createPortal(<Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Settings">
              <div className="flex flex-col gap-4">
                <TextInput label="Display name" placeholder="Your name"/>
                <TextInput label="Email" placeholder="you@example.com"/>
                <div className="flex justify-end gap-2 pt-2">
                  <Button label="Cancel" variant="ghost" onClick={() => setModalOpen(false)}/>
                  <Button label="Save" variant="primary" onClick={() => setModalOpen(false)}/>
                </div>
              </div>
            </Modal>, document.body)}
        </>);
}
export function BottomSheetExample() {
    const [sheetOpen, setSheetOpen] = useExampleState("sheetOpen", false);
    return (<>
            <button type="button" onClick={() => setSheetOpen(true)} className="px-4 py-2.5 text-[15px] font-medium rounded-xl bg-[var(--inv-heading)] text-[var(--inv-bg)] cursor-pointer transition-[scale] duration-200 ease-out active:scale-[0.96]">
              Open Bottom Sheet
            </button>
            {createPortal(<BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)}/>, document.body)}
          </>);
}
