import { call, put, takeLatest } from 'redux-saga/effects';
import * as types from './constants';
import * as api from '../../../services';
import ServiceError from '../../ErrorHandler/ServiceError';
import { browserHistory } from 'react-router';

// region Get User
function* getUser(action) {
    const {userId } = action;
    try {
        const response = yield call(api.getUser, userId);
        yield put({ type: types.LOAD_USER_SUCCESS, selectedUser: response.data, userId });
    } catch (err) {
        const error = new ServiceError('fetching Admin user', err);
        yield put({ type: types.LOAD_USER_ERROR, error, userId });
    }
}

function* watchGetUser() {
    yield takeLatest(types.LOAD_USER, getUser);
}
// endregion

//region Get All Clients
function* getClients(action) {
    try {

        // Pass inline params with for size and start with arg 1 & 2
        const response = yield call(api.getClients, action.size, action.start,action.body);
        yield put({ type: types.SEARCH_CLIENTS_SUCCESS, clients: response.data });
    } catch (error) {
        yield put({ type: types.SEARCH_CLIENTS_ERROR, error: new ServiceError('loading All Clients', error) });
    }
}

function* watchGetClients() {
    yield takeLatest(types.SEARCH_CLIENTS, getClients);
}
//end region

// region Update User
function* updateUser(action) {
    const {userId,body,pageTransition} = action;

    try {
        const response = yield call(api.updateUser,userId,body);
        yield put({
            type: types.EDIT_USER_SUCCESS,
            selectedUser: response.data,
            userId,body,pageTransition
        });
        if (pageTransition) {
            browserHistory.push('/admin/users');
        }
        else {
            yield put({type: types.LOAD_USER, userId});
        }
    } catch (err) {
        const error = new ServiceError('editing user', err);
        yield put({ type: types.EDIT_USER_ERROR, error,userId,body,pageTransition });
    }
}

function* watchUpdateUser() {
    yield takeLatest(types.EDIT_USER, updateUser);
}
// endregion

// region Delete Admin User
function* deleteUser(action) {
    const {userId} = action;

    try {
        const response = yield call(api.deleteUsers, [userId]);
        yield put({ type: types.DELETE_USER_SUCCESS, response,userId });
        browserHistory.push('/admin/users');
    } catch (err) {
        const error = new ServiceError('deleting user', err);
        yield put({ type: types.DELETE_USER_ERROR, error, userId });
    }
}

function* watchDeleteUser() {
    yield takeLatest(types.DELETE_USER, deleteUser);
}
// endregion

// region Delete Password
function* deletePassword(action) {
    const {userId} = action;

    try {
        const response = yield call(api.deletePassword, userId);
        yield put({ type: types.DELETE_PASSWORD_SUCCESS, response,userId });
    } catch (err) {
        const error = new ServiceError('deleting password', err);
        yield put({ type: types.DELETE_PASSWORD_ERROR, error, userId });
    }
}

function* watchDeletePassword() {
    yield takeLatest(types.DELETE_PASSWORD, deletePassword);
}
// endregion


//region Get Roles By Client
function* getClientRoles(action) {
    try {
        const response = yield call(api.getRolesByClient, action.clientIdentifier, action.size, action.start);
        yield put({ type: types.GET_CLIENT_ROLES_SUCCESS, clientRoles: response.data, clientIdentifier:action.clientIdentifier });
    } catch (error) {
        yield put({ type: types.GET_CLIENT_ROLES_ERROR, error: new ServiceError('Fetching All Rows for Client', error) });
    }
}

function* watchGetClientRoles() {
    yield takeLatest(types.GET_CLIENT_ROLES, getClientRoles);
}


// root saga
export default function* editAllUserRoot() {
    yield [
        watchGetUser(),
        watchGetClients(),
        watchUpdateUser(),
        watchDeleteUser(),
        watchDeletePassword(),
        watchGetClientRoles()
    ];
}