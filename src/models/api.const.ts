export namespace RemoteAPI {


  export const User = {
    BasePath: '/user',
    Login: '/login',
    Register: '/register',
    ProfileAvatar: '/uploadAvatar',
    ProfileSave: '/profile/save',
    ProfileMyself: '/profile/myself',
    ProfileInfo: '/profile/info',
    ProfileSearch: '/profile/search',
  }

  export const IOT = {
    BasePath: '/iot',
    DeviceSearch:'/device/search',
    DeviceInfo: '/device/info',
    DeviceSave: '/device/save',
    DeviceDelete: '/device/remove', 
    CompanyInfo: '/company/info',
    CompanySave: '/company/save',
    RoleAll: '/company/role/all',
    RoleSave: '/company/role/save',
    RoleDelete: '/company/role/delete',
    OperatorAll: '/company/operator/all',
    OperatorMyself: '/company/operator/myself',
    OperatorSave: '/company/operator/save',
    OperatorDelete: '/company/operator/delete',
  }
}