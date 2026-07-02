'use client'

import type { DataTableValue } from 'primereact/datatable'
import type { JSX } from 'react'
import { useMemo } from 'react'

import {
  type EntityFieldInterface,
  NucDialog,
  NucEntityDataTableCard,
  useNucDialog,
  userRequests,
  useUserFields,
} from 'nucleify'

type NucDashboardProps = {
  data?: DataTableValue[]
  loading?: boolean
  getData: () => Promise<void>
}

export function NucUserDashboard({
  data = [],
  loading = false,
  getData,
}: NucDashboardProps): JSX.Element {
  const {
    visibleShow,
    visibleCreate,
    visibleEdit,
    visibleDelete,
    selectedObject,
    openDialog,
    closeDialog,
  } = useNucDialog()

  const { createFields, editFields, showFields } = useUserFields()
  const { deleteUser, storeUser, editUser } = userRequests(closeDialog, 'next')

  const dialogs = useMemo(
    () => [
      {
        entity: 'user',
        action: 'show',
        visible: visibleShow,
        cancelButtonLabel: 'Close',
        fields: showFields,
      },
      {
        entity: 'user',
        action: 'delete',
        visible: visibleDelete,
        title: 'Delete user?',
        confirmButtonLabel: 'Confirm',
        cancelButtonLabel: 'Cancel',
        confirm: deleteUser,
        getData,
      },
      {
        entity: 'user',
        action: 'create',
        visible: visibleCreate,
        title: 'Create new user',
        confirmButtonLabel: 'Confirm',
        cancelButtonLabel: 'Cancel',
        confirm: storeUser,
        getData,
        fields: createFields,
      },
      {
        entity: 'user',
        action: 'edit',
        visible: visibleEdit,
        title: 'Edit user',
        confirmButtonLabel: 'Update',
        cancelButtonLabel: 'Cancel',
        confirm: editUser,
        getData,
        fields: editFields,
      },
    ],
    [
      createFields,
      deleteUser,
      editFields,
      editUser,
      getData,
      showFields,
      storeUser,
      visibleCreate,
      visibleDelete,
      visibleEdit,
      visibleShow,
    ]
  )

  return (
    <section id="users">
      <NucEntityDataTableCard
        nuiType="user"
        value={data}
        loading={loading}
        openDialog={openDialog}
        tag={3}
        headerText="Manage Users"
        buttonText="New User"
      />

      {dialogs.map((dialog) => (
        <NucDialog
          key={dialog.action}
          entity={dialog.entity as ObjectNameType}
          action={dialog.action as ActionType}
          visible={dialog.visible}
          selectedObject={selectedObject as ObjectType}
          title={dialog.title}
          fields={
            dialog.fields
              ? ([...dialog.fields] as EntityFieldInterface[])
              : undefined
          }
          confirmButtonLabel={dialog.confirmButtonLabel}
          cancelButtonLabel={dialog.cancelButtonLabel}
          confirm={dialog.confirm as never}
          getData={dialog.getData}
          close={closeDialog}
          onHide={() => closeDialog(dialog.action as ActionType)}
        />
      ))}
    </section>
  )
}
