// EditAllUser actions
import * as types from './constants';

export const resetState = () => ({ type: types.RESET_STATE });

export const getUser = (userId) => {
    return { type: types.LOAD_USER, userId };
};

export const selectUserRoleToEdit = (bool, id) => ({ type: types.SELECT_ROLE, id, bool });

export const editUser = (userId, body,pageTransition = true) => {
    return { type: types.EDIT_USER, userId, body,pageTransition};
};

export const deleteUser = ([userId]) => ({ type: types.DELETE_USER, userId});

export const deletePassword = (userId) => ({ type: types.DELETE_PASSWORD, userId});

export const getRolesByClient = (clientIdentifier, size, start) => {
    return {type:types.GET_CLIENT_ROLES, clientIdentifier, size, start};
};

export const setUsername = (name) => ({ type: types.SET_USERNAME, name })

export const setPassword = (password) => ({ type: types.SET_PASSWORD, password })

export const getClients = (size, start, body) => {
    return { type: types.SEARCH_CLIENTS, size, start, body };
};

export const getClient = (clientIdentifier, clientName, roles) => {
    return { type: types.GET_CLIENT, clientIdentifier, clientName, roles};
};

export const removeRow = (clientId) => {
    return { type: types.DELETE_CLIENT_ROW, clientId};
};
export const setSysAdmin = (checked) => {
    return { type: types.SET_SYS_ADMIN, checked};
};

export const setActiveClientsPage = (page) => {
    return  {
        type: types.SET_PAGE,
        page
    };
};