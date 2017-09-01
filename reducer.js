import { fromJS } from 'immutable';
import * as types from './constants';
import {
    flattenDeep as _flattenDeep,
} from 'lodash';

const initialState = fromJS({
    isGetUserPending: false,
    isUpdateUserPending: false,
    isDeleteUserPending: false,
    isGetClientsPending: false,
    isRemoveClientPending:false,
    isDeletePasswordPending: false,
    getClientPending:false,
    getClientRolesPending:false,
    clients:[],
    initialRoles:[],
    initialUsername: '',
    initialPassword: false,
    initialIsSysAdmin: false,
    clientRoles:[],
    selectedUser: {},
    selectedClient: {},
    userClients:[],
    roleAdds: [],
    roleDeletes: [],
    total: 0,
    activePage: 1
});

const editAllUser = (state = initialState, action) => {
    switch (action.type) {
        case types.LOAD_USER:
            return state.set('isGetUserPending', true);
        case types.LOAD_USER_SUCCESS:
            return onUserLoad(state, action);
        case types.LOAD_USER_ERROR:
            return state.set('isGetUserPending', false);
        case types.SELECT_ROLE:
            return toggleRole(state, action);
        case types.EDIT_USER:
            return state.set('isUpdateUserPending', true)
        case types.EDIT_USER_SUCCESS:
            return state.set('isUpdateUserPending', false)
                .set('roleAdds', fromJS([]))
                .set('roleDeletes', fromJS([]))
                .setIn(['selectedUser', 'clients'], state.getIn(['selectedUser', 'clients']));
        case types.EDIT_USER_ERROR:
            return state.set('isUpdateUserPending', false);
        case types.SET_USERNAME:
            return state.setIn(['selectedUser', 'userName'], fromJS(action.name));
        case types.SET_PASSWORD:
            return state.setIn(['selectedUser', 'password'], fromJS(action).get('password')).setIn(['selectedUser', 'hasPassword'], true);
        case types.DELETE_USER:
            return state.set('isDeleteUserPending', true);
        case types.DELETE_USER_SUCCESS:
            return initialState;
        case types.DELETE_USER_ERROR:
            return state.set('isDeleteUserPending', false);
        case types.DELETE_PASSWORD:
            return state.set('isDeletePasswordPending', true);
        case types.DELETE_PASSWORD_SUCCESS:
            return state.setIn(['selectedUser','hasPassword'],false).set('isDeletePasswordPending', false);
        case types.DELETE_PASSWORD_ERROR:
            return state.set('isDeletePasswordPending', false);
        case types.SEARCH_CLIENTS:
            return state.set('isGetClientsPending', true);
        case types.SEARCH_CLIENTS_SUCCESS:
            return state.set('isGetClientsPending', false).set('clients', fromJS(action.clients.results))
                .set('total', action.clients.total);
        case types.SEARCH_CLIENTS_ERROR:
            return state.set('isGetClientsPending', false);
        case types.GET_CLIENT:
            return getClient(state,action);
        case types.GET_CLIENT_ROLES:
            return state.set('isGetClientRolesPending', true)
                        .setIn(['selectedClient', 'clientIdentifier'], action.clientIdentifier);
        case types.GET_CLIENT_ROLES_SUCCESS:
            return clientRoles(state, action);
        case types.GET_CLIENT_ROLES_ERROR:
            return state.set('isGetClientRolesPending', false);
        case types.DELETE_CLIENT_ROW:
            return removeRow(state, action);
        case types.SET_SYS_ADMIN:
            // TODO: convert isSuperUser to isSysAdmin on backend
            return  state.setIn(['selectedUser','isSuperUser'],action.checked);
        case types.SET_PAGE:
            return state.set('activePage', action.page);
        case types.RESET_STATE:
            return initialState;
        default:
            return state;
    }
};

export default editAllUser;

function removeRow(state, action){
    const roles = state.getIn(['selectedUser','clients']).find(client => client.get('clientIdentifier') === fromJS(action.clientId)).get('roles');

    if (roles.size > 0) {
        const selectedRoles = roles.filter(role => role.get('isSelected'));

        // remove role adds of role id's from removed row
        const adds = state.get('roleAdds').filter(add => {
            const selectedRole = selectedRoles.find(role => role.get('roleId') === add);
            return selectedRole ?  add !== selectedRole.get('roleId') : true;
        });

        // spread any role deletes of roles id's from removed row
        // use reduce to concat subset array of deletes to new array from selectedRoles
        const deletes = state.get('roleDeletes').push(...selectedRoles.reduce((newArray, role) => {
            if(state.get('initialRoles').find(initialRole => initialRole.get('roleId') === role.get('roleId'))){
                return newArray.concat(role.get('roleId'));
            }
            return newArray;
        }, []));

        return state.set('userClients', state.get('userClients').filter(client => client.get('clientIdentifier') !== action.clientId))
            .setIn(['selectedUser','clients'], state.getIn(['selectedUser','clients']).filter(client => client.get('clientIdentifier') !== action.clientId))
            .set('roleDeletes', deletes)
            .set('roleAdds', adds)
            .set('clientRoles', fromJS([]))
            .set('isRemoveClientPending', false);
    } else{
        return state.set('userClients', state.get('userClients').filter(client => client.get('clientIdentifier') !== action.clientId))
            .setIn(['selectedUser','clients'], state.getIn(['selectedUser','clients']).filter(client => client.get('clientIdentifier') !== action.clientId))
            .set('isRemoveClientPending', false);
    }
}

function getClient(state,action){
    return state.set('userClients', state.get('userClients').push(fromJS(action)))
        .setIn(['userClients','clients','roles'],  fromJS(action.roles))
        .setIn(['selectedUser','clients'],  state.getIn(['selectedUser','clients']).push(fromJS(action)))

}

function onUserLoad(state, action) {
    return state.set('isGetUserPending', false)
        .set('isGetClientsPending', false)
        .set('selectedUser', fromJS(action.selectedUser))
        .set('roleAdds', fromJS([]))
        .set('roleDeletes', fromJS([]))
        .set('userClients', fromJS(action.selectedUser.clients))
        .set('initialUsername', fromJS(action.selectedUser.userName))
        .set('initialPassword', fromJS(action.selectedUser.hasPassword))
        .set('initialIsSysAdmin', action.selectedUser.isSuperUser)
        .set('initialRoles', fromJS(_flattenDeep(action.selectedUser.clients.map(clients=>clients.roles.filter(role => role.isSelected === true)))));
}

function clientRoles(state,action){
    const clientIndex = state.getIn(['selectedUser','clients']).findIndex(c=>c.get('clientIdentifier')===fromJS(action.clientIdentifier));
    const userClientIndex = state.get('userClients').findIndex(c=>c.get('clientIdentifier')===fromJS(action.clientIdentifier));

    if (state.getIn(['selectedUser','clients',clientIndex]).get('roles').size===0) {
        return state.set('isGetClientRolesPending', false)
            .set('clientRoles',fromJS(action.clientRoles.results))
            .set('rolesTotal', action.clientRoles.total)
            .set('selectedClient',fromJS(action))
            .setIn(['userClients',userClientIndex,'roles'],fromJS(action.clientRoles.results))
            .setIn(['selectedUser','clients',clientIndex,'roles'],fromJS(action.clientRoles.results));
    } else {
        return state.set('isGetClientRolesPending', false)
            .set('clientRoles',fromJS(action.clientRoles.results))
            .set('rolesTotal', action.clientRoles.total)
            .set('selectedClient',fromJS(action))
            .setIn(['userClients',userClientIndex,'roles'],fromJS(action.clientRoles.results));
    }
}


function toggleRole(state, action) {
    const actionId = fromJS(action.id),
        actionBool =fromJS(action.bool);

    const client = state.getIn(['selectedUser','clients']).find(c=>c.get('clientIdentifier')===state.getIn(['selectedClient','clientIdentifier']));
    const index = client.get('roles').findIndex(role => { return role.get('roleId') === actionId; });
    const clientIndex= state.getIn(['selectedUser','clients']).findIndex(c=>c.get('clientIdentifier')===state.getIn(['selectedClient','clientIdentifier']));

    // this checks if an incoming actionId is already present in the roleAdds array
    const presentInAdds = state.get('roleAdds').some(id => id === actionId);

    // this checks if an incoming actionId is already present in the initialRoles array
    const presentInInitial = state.get('initialRoles').some(role => role.get('roleId') === actionId);

    const newState = state.setIn(['selectedUser', 'clients', clientIndex, 'roles', index, 'isSelected'], actionBool);

    if (presentInInitial && !(actionBool)) {
        return newState.set('roleDeletes', state.get('roleDeletes').push(actionId));
    } else if (presentInInitial && actionBool) {
        return newState.set('roleDeletes', state.get('roleDeletes').filter(id => id !== actionId));
    } else if (presentInAdds) {
        return newState.set('roleAdds', state.get('roleAdds').filter(id => id !== actionId));
    } else {
        return newState.set('roleAdds', state.get('roleAdds').push(actionId));
    }
}