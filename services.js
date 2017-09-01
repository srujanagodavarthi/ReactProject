import axios from './axios';
import Utilities from './utilities';

/** Naming convention
 *
 * GET - get<Noun>
 * PUT - update<Noun>
 * POST - create<Noun> or set<Noun>
 * DELETE - delete<Noun>
 * Exceptions:
 *   search, assign/unassign, remove, you name it...
 */

// region User Profile API
export const getUserProfile = () => {
    return axios.get('/api/user/profile');
};

export const setActiveClient = (clientIndentifier) => {
    return axios.post('/api/client/adminActive', {adminActiveClient: clientIndentifier});
};

// Get clients and active client for current user
export const getUserClients = () => {
    return axios.get(`/api/clients`);
};

// Get clients for current admin user
export const getAdminClients = () => {
    return axios.get(`/api/admin/clients`);
};
// endregion

// region Admin SysAdmin Clients API
export const getClients = (size, start,body) => {
    return axios.post(`/api/admin/clients/${size}/${start}`,body);
};

export const getClient = (clientIdentifier) => {
    let promise = axios.get(`/api/admin/client/${clientIdentifier}`).then(response => {
        response.data.toolSets = Utilities.loadToolsets(response.data.toolSets);
        return response;
    });
    return promise;
};

export const getToolsetData = () => {
    let promise = axios.get('/api/admin/toolsets').then(response => {
        response.data = Utilities.loadToolsets(response.data);
        return response;
    });
    return promise;
};
export const getToolSets = () => {
    return axios.get('/api/admin/toolsets')
};

export const createClient = (clientName, toolsets) => {
    return axios.post(`/api/admin/client`, { clientName, toolSets: toolsets });
};

export const updateClient = (clientIdentifier, body) => {
    return axios.put(`/api/admin/client/${clientIdentifier}`, body);
};

export const deleteClients = (deletes) => {
    return axios.delete(`/api/admin/clients`, { data: deletes});
};

export const activateClients=(clients) => {
    return axios.put(`/api/admin/clients/activate`, clients);
};

export const deactivateClients=(clients) => {
    return axios.put(`/api/admin/clients/deactivate`,clients);
};
// endregion

// region Admin SysAdmin Users API
// TODO: convert isSuperUser to isSysAdmin on backend
export const createNewUser = (body) => {
    return axios.post(`/api/admin/user`, body );
};

export const searchAllUsers = (size, start, body) => {
    return axios.post(`/api/admin/users/${size}/${start}`, body);
};

export const getUser = (userId) => {
    return axios.get(`/api/admin/user/${userId}`);
};

export const deleteUsers = (deletes) => {
    return axios.delete(`/api/admin/users`, { data: deletes});
};

export const deletePassword = (userId) => {
    return axios.delete(`/api/admin/users/${userId}/password`);
};
// endregion

// region Admin Client Users API
export const searchUsersByClient = (clientId, size, start, body) => {
    return axios.post(`/api/admin/client/${clientId}/users/${size}/${start}`, body);
};

export const createUser = (clientId, userName, selectedRoles) => {
    return axios.post(`/api/admin/client/${clientId}/user`, { userName, selectedRoles });
};

export const getClientUser = (clientId, userId) => {
    return axios.get(`/api/admin/client/${clientId}/user/${userId}`);
};

export const updateClientUser = (clientId, userId, body) => {
    return axios.put(`/api/admin/client/${clientId}/user/${userId}`, body);
};

// TODO: convert isSuperUser to isSysAdmin on backend
export const updateUser = (userId, body) => {
    return axios.put(`/api/admin/user/${userId}`,body);
};

export const activateUsers=(users) => {
    return axios.put(`/api/admin/users/activate`, users);
};

export const deactivateUsers=(users) => {
    return axios.put(`/api/admin/users/deactivate`, users);
};

export const removeUsers = (clientId, deletes) => {
    return axios.delete(`/api/admin/client/${clientId}/users`, { data:  deletes });
};

// endregion

// region Admin Client Roles API
export const getRolesByClient = (clientId, size, start) => {
    return axios.get(`/api/admin/client/${clientId}/roles/${size}/${start}`);
};

export const getPermissionsByClient = (clientId) => {
    return axios.get(`/api/admin/client/${clientId}/permissions`);
};

export const createRole = (clientId, roleName, selectedPermissions) => {
    return axios.post(`/api/admin/client/${clientId}/role`, { roleName, selectedPermissions });
};

export const getRole = (clientId, roleId) => {
    return axios.get(`/api/admin/client/${clientId}/role/${roleId}`);
};

export const updateRole = (clientId, roleId, roleName, addPermissions, deletePermissions) => {
    return axios.put(`/api/admin/client/${clientId}/role/${roleId}`, { roleName, addPermissions, deletePermissions });
};

export const deleteRole = (clientId, deletes) => {
    return axios.delete(`/api/admin/client/${clientId}/roles`, { data: [ deletes ] });
};
// endregion

// region Client Policy Statement API
export const getClientPolicy = (clientIdentifier) => {
    return axios.get(`/api/admin/client/${clientIdentifier}/drools/policy`);
};

export const updateClientPolicy = (clientIdentifier, policy) => {
    return axios.put(`/api/admin/client/${clientIdentifier}/drools/policy`, { policyStatement: policy});
};
// endregion


// region BusinessDays API
export const getBusinessDays = (clientIdentifier) => {
    return axios.get(`/api/admin/client/${clientIdentifier}/drools/businessdays`);
};

export const updateBusinessDays = (clientIdentifier, businessDays) => {
    return axios.put(`/api/admin/client/${clientIdentifier}/drools/businessdays`, { businessDay: businessDays});
};
// endregion

// region Admin Client Exceptions API
export const getExceptionsByClient = (clientId) => {
    return axios.get(`/api/admin/client/${clientId}/drools/exceptions`);
};

export const updateExceptionsByClient = (clientId, body) => {
    return axios.put(`/api/admin/client/${clientId}/drools/exceptions`, body);
};
// endregion

// region Admin Client Reference Data API
export const getReferenceDataByClient = (clientIdentifier) => {
    return axios.get(`/api/admin/client/${clientIdentifier}/refdata`);
};

export const getReferenceDataTermByClient = (clientIdentifier, term) => {
    return axios.get(`/api/admin/client/${clientIdentifier}/refdata/${term}`);
};

export const updateReferenceDataTermByClient = (clientIdentifier, term, formData) => {
    return axios.put(`/api/admin/client/${clientIdentifier}/refdata/upload/${term}`, formData);
};

export const updateReferenceDataByClient = (clientIdentifier, requestBody) => {
    return axios.put(`/api/admin/client/${clientIdentifier}/refdata`, requestBody);
};

//endregion

// region Admin Client Rules API
export const searchRulesByClient = (clientId, size, start, body) => {
    return axios.post(`/api/admin/client/${clientId}/drools/rules/${size}/${start}`, body);
};

export const updateRulesByClient = (clientId, body) => {
    return axios.put(`/api/admin/client/${clientId}/drools/rules`, body);
};

//endregion

export const keepSessionAlive = () =>{
    return axios.get('/api/keepSessionAlive');
}