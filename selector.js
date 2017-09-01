import { createSelector } from 'reselect';

const editUserState = state => state.get('editAllUser');

export const clientsSelector = () => createSelector(
    editUserState,
    editUserState => editUserState.get('clients')
);

export const clientRolesSelector = () => createSelector(
    editUserState,
    editUserState => editUserState.get('clientRoles')
);

export const clientSelector = () => createSelector(
    editUserState,
    editUserState => editUserState.get('selectedClient')
);

export const selectedUserSelector = () => createSelector(
    editUserState,
    editUserState => editUserState.get('selectedUser')
);

export const userClientSelector = () => createSelector(
    editUserState,
    editUserState => editUserState.get('userClients')
);

// is there a better, less repetitive way to do this?
export const addsSelector = () => createSelector(
    editUserState,
    editUserState => editUserState.get('roleAdds')
);

export const deletesSelector = () => createSelector(
    editUserState,
    editUserState => editUserState.get('roleDeletes')
);

export const initialRolesSelector = () => createSelector(
    editUserState,
    editUserState => editUserState.get('initialRoles')
);

export const initialUsernameSelector = () => createSelector(
    editUserState,
    (editUserState) => editUserState.get('initialUsername')
);

export const initialPasswordSelector = () => createSelector(
    editUserState,
    (editUserState) => editUserState.get('initialPassword')
);

export const initialIsSysAdminSelector = () => createSelector(
    editUserState,
    (editUserState) => editUserState.get('initialIsSysAdmin')
);

export const loadingSelector = () => createSelector(
    editUserState,
    editUserState => editUserState.get('isGetUserPending') || editUserState.get('isUpdateUserPending')
    || editUserState.get('isGetClientsPending') || editUserState.get("isDeleteUserPending")
    || editUserState.get("isDeletePasswordPending")
);

export const loadingRolesSelector = () => createSelector(
    editUserState,
    editUserState => editUserState.get('isGetClientRolesPending')
);

export const clientsTotalSelector = () => createSelector(
    editUserState,
    (editUserState) => editUserState.get('total')
);

export const requestBodySelector = () => createSelector (
    editUserState,
    (editUserState) => {
        let userName,
            password,
            addRoles,
            deleteRoles,
            isSuperUser

        let adds = editUserState.get('roleAdds');
        let deletes = editUserState.get('roleDeletes');

        if(editUserState.getIn(['selectedUser', 'userName']) !== editUserState.get('initialUsername')){
            userName = editUserState.getIn(['selectedUser', 'userName']);
        }

        if(editUserState.getIn(['selectedUser', 'password'])){
            password = editUserState.getIn(['selectedUser', 'password']);
        }

        if(editUserState.getIn(['selectedUser', 'isSuperUser']) !== editUserState.get('initialIsSuperUser'))  {
            isSuperUser = editUserState.getIn(['selectedUser', 'isSuperUser']);
        }

        if(adds.size > 0) {
            addRoles = adds;
        }

        if(deletes.size > 0) {
            deleteRoles = deletes;
        }

        return {isSuperUser, userEdits:{userName, password, addRoles, deleteRoles}};

    });

export const userRoleEditsSelector = () => createSelector(
    editUserState,
    (editUserState) => (editUserState.get('roleAdds').size + editUserState.get('roleDeletes').size) === 0
);

export const rolesTotalSelector = () => createSelector(
    editUserState,
    (editUserState) => editUserState.get('rolesTotal')
);

export const clientsActivePageSelector = () => createSelector(
    editUserState,
    (editUserState) => editUserState.get('activePage')
);