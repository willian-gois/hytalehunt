"use client"

import { useState } from "react"

import { RiPencilLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { EditServerForm } from "./edit-server-form"

interface EditButtonProps {
  serverId: string
  initialDescription: string
  initialCategories: { id: string; name: string }[]
  isOwner: boolean
  isScheduled: boolean
}

export function EditButton({
  serverId,
  initialDescription,
  initialCategories,
  isOwner,
  isScheduled,
}: EditButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Ne pas afficher le bouton si l'utilisateur n'est pas propriétaire ou si la chaîne n'est pas scheduled
  if (!isOwner || !isScheduled) {
    return null
  }

  const handleUpdate = () => {
    // Fermer le dialogue et rafraîchir la page pour afficher les changements
    setIsDialogOpen(false)
    window.location.reload()
  }

  return (
    <>
      <Button variant="outline" size="sm" className="h-9" onClick={() => setIsDialogOpen(true)}>
        <RiPencilLine className="mr-1 h-4 w-4" />
        Edit Server Details
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Server Information</DialogTitle>
          </DialogHeader>

          <EditServerForm
            serverId={serverId}
            initialDescription={initialDescription}
            initialCategories={initialCategories}
            onUpdate={handleUpdate}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
