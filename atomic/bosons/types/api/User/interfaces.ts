import type {
  DeleteEntityRequestType,
  EditEntityRequestType,
  EntityCountResultsType,
  EntityResultsType,
  GetAllEntitiesRequestType,
  GetEntityRequestType,
  LoadingRefType,
  StoreEntityRequestType,
} from 'atomic'

import type { NucUserObjectInterface } from '../../object/User/interfaces'

export interface NucUserRequestsInterface {
  results: EntityResultsType<NucUserObjectInterface>
  createdLastWeek: EntityCountResultsType
  loading: LoadingRefType
  getAllUsers: GetAllEntitiesRequestType<NucUserObjectInterface>
  getCountUsersByCreatedLastWeek: GetEntityRequestType
  getUser: GetAllEntitiesRequestType<NucUserObjectInterface>
  storeUser: StoreEntityRequestType<NucUserObjectInterface>
  editUser: EditEntityRequestType<NucUserObjectInterface>
  deleteUser: DeleteEntityRequestType
}
