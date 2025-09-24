'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PatientList } from '@/components/patients/patient-list'
import { PatientCard } from '@/components/patients/patient-card'
import { PatientForm } from '@/components/patients/patient-form'
import { MedicalHistoryTimeline } from '@/components/medical-history/medical-history-timeline'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { useDeletePatient, usePatient } from '@/hooks/use-patients'
import { showSuccessToast, showErrorToast } from '@/lib/user-feedback'
import { Plus, Edit, History, Trash2 } from 'lucide-react'

export default function PatientsPage() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showHistoryForm, setShowHistoryForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const deletePatientMutation = useDeletePatient()
  const { data: selectedPatient } = usePatient(selectedPatientId || '')

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId)
  }

  const handleCreatePatient = () => {
    setShowCreateForm(true)
  }

  const handleEditPatient = () => {
    setShowEditForm(true)
  }

  const handleAddHistoryEntry = () => {
    setShowHistoryForm(true)
  }

  const handleFormSuccess = () => {
    setShowCreateForm(false)
    setShowEditForm(false)
    setShowHistoryForm(false)
  }

  const handleDeletePatient = async () => {
    if (!selectedPatientId) return

    try {
      await deletePatientMutation.mutateAsync(selectedPatientId)
      showSuccessToast('Success', 'Patient deleted successfully')
      setSelectedPatientId(null)
      setShowDeleteDialog(false)
    } catch (error: any) {
      showErrorToast(error)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Patients</h1>
            <p className="text-muted-foreground">
              Manage patient records and medical history
            </p>
          </div>
          <Button onClick={handleCreatePatient}>
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Patient List */}
          <div className="xl:col-span-1 order-1">
            <PatientList
              onPatientSelect={handlePatientSelect}
              onCreatePatient={handleCreatePatient}
              selectedPatientId={selectedPatientId || undefined}
            />
          </div>

          {/* Patient Details */}
          <div className="xl:col-span-2 order-2">
            {selectedPatientId ? (
              <Tabs defaultValue="details" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details" className="text-xs sm:text-sm">
                    Patient Details
                  </TabsTrigger>
                  <TabsTrigger value="history" className="text-xs sm:text-sm">
                    Medical History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={handleEditPatient}>
                      <Edit className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Edit Patient</span>
                      <span className="sm:hidden">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Delete Patient</span>
                      <span className="sm:hidden">Delete</span>
                    </Button>
                  </div>
                  <PatientCard
                    patientId={selectedPatientId}
                    onEdit={handleEditPatient}
                  />
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={handleAddHistoryEntry}>
                      <History className="h-4 w-4 mr-2" />
                      Add Entry
                    </Button>
                  </div>
                  <MedicalHistoryTimeline
                    patientId={selectedPatientId}
                    onAddEntry={handleAddHistoryEntry}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex items-center justify-center h-[500px] border rounded-lg bg-muted/10">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">Select a Patient</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose a patient from the list to view their details and medical history
                  </p>
                  <Button onClick={handleCreatePatient}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Patient
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Patient Dialog */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
            </DialogHeader>
            <PatientForm
              onSuccess={handleFormSuccess}
              onCancel={() => setShowCreateForm(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Patient Dialog */}
        {selectedPatientId && (
          <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Patient</DialogTitle>
              </DialogHeader>
              <PatientForm
                patient={{ id: selectedPatientId }}
                onSuccess={handleFormSuccess}
                onCancel={() => setShowEditForm(false)}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Add Medical History Entry Dialog */}
        {selectedPatientId && (
          <Dialog open={showHistoryForm} onOpenChange={setShowHistoryForm}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Medical History Entry</DialogTitle>
              </DialogHeader>
              <div className="p-4 text-center text-muted-foreground">
                Medical history form component will be implemented next...
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Patient Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Patient</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{' '}
                {selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : 'this patient'}?
                This action cannot be undone and will permanently remove all patient data, including medical history and appointments.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deletePatientMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeletePatient}
                disabled={deletePatientMutation.isPending}
              >
                {deletePatientMutation.isPending ? 'Deleting...' : 'Delete Patient'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}