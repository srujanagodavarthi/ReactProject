import React, { Component } from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import ReactDOM from 'react-dom';

//region Actions
import { getUser, getClients,getClient, getRolesByClient, selectUserRoleToEdit, editUser, resetState,
    deleteUser, deletePassword, setActiveClientsPage,removeRow,setSysAdmin, setUsername, setPassword } from './store/actions';
// endregion

// region Selectors
import {
    userClientSelector, addsSelector, deletesSelector, loadingSelector, loadingRolesSelector, clientsSelector,
    clientsActivePageSelector,clientsTotalSelector, clientRolesSelector, rolesTotalSelector, clientSelector,
    selectedUserSelector, initialRolesSelector, userRoleEditsSelector, initialUsernameSelector, initialPasswordSelector,
    initialIsSysAdminSelector, requestBodySelector
}
    from './store/selectors';
import { appActiveClientSelector, appIsSysAdminSelector } from '../App/store/selectors';
import { browserHeightSelector } from '../../selectors';
// endregion

import ViewLayout from '../../components/layout/ViewLayout/ViewLayout';
import ConfirmModal from '../../components/modals/ConfirmModal';
import UserInfo from './components/UserInfo';
import Clients from './components/Clients';
import config from '../../config';


class EditAllUser extends Component {

    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: '',
            showRemoveUserModal : false,
            userNameError: false,
            userNameSuccess: false,
            validationError: false,
            validationSuccess: false
        };


        this.onSave = this.onSave.bind(this);
        this.onSaveAndContinue = this.onSaveAndContinue.bind(this);
        this.remove = this.remove.bind(this);
        this.openRemoveUserModal = this.openRemoveUserModal.bind(this);
        this.closeRemoveUserModal = this.closeRemoveUserModal.bind(this);
        this.selectRole = this.selectRole.bind(this);
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.addClientRow = this.addClientRow.bind(this);
        this.removeClientRow = this.removeClientRow.bind(this);
        this.handleDeletePassword = this.handleDeletePassword.bind(this);

    }

    componentDidMount() {
          this.props.getUser(this.props.routeParams.userId);
          this.props.getClients(config.paginationSize, 0,{});
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selectedUser.get('userName') !== '') {
            this.setState({ username: nextProps.selectedUser.get('userName')});
        }
    }
    componentWillUnmount() {
        this.props.resetState();
    }

    selectRole(e, id) {
        // to edit existing roles:
        this.props.selectUserRoleToEdit(e.target.checked, id);
    }

    onSave() {
        let pageTransition = true; // 'true' so that there is a page transition
        this.save(pageTransition);

    }

    onSaveAndContinue() {
        let pageTransition = false; // 'false' so that there is no page transition
        this.save(pageTransition);
    }

    scrollToTop() {
        let domNode = ReactDOM.findDOMNode(this.refs['top']);
        if (domNode){
            domNode.scrollIntoView();
        }
    }

    save(pageTransition=false) {
        const userId = this.props.routeParams.userId;

        let errorState = false;

        if (this.state.username.length === 0) {
            errorState = true;
            this.setState({userNameError: true});
            this.scrollToTop();
        }

        if(this.props.isAppSysAdmin && this.state.edited === true && this.state.password.length < 8) {
            errorState = true;
            this.setState({validationError: true});
            this.scrollToTop();
        }

        if (!errorState) {
            this.setState({password: ''});
            this.props.editUser(userId, this.props.requestBody, pageTransition);
        }
    }

    openRemoveUserModal() {
        this.setState({ showRemoveUserModal: true });
    }

    closeRemoveUserModal() {
        this.setState({ showRemoveUserModal: false });
    }

    remove() {
        const userId = this.props.selectedUser.get('userId');
        this.props.deleteUser([userId]);
    }

    addClientRow(clientIdentifier, clientName, roles) {
        roles = [];
        const page = 1;
        this.props.getClientRoles(clientIdentifier,config.paginationSize, (page - 1) * config.paginationSize);
        this.props.getClient(clientIdentifier, clientName, roles);
    }

    removeClientRow(clientId){
        if(this.props.userClients.map(client => client.clientId !== clientId)) {
            this.props.removeRow(clientId);
        }
    }

    handleUsernameChange(e) {
        let userName = e.target.value;
        if (this.state.userNameError && userName.length > 0) {
            this.setState({ userNameError: false, userNameSuccess: true, username: e.target.value});
        }
        else if (this.state.userNameSuccess && userName.length === 0) {
            this.setState({userNameError: true, userNameSuccess: false, username:e.target.value});
        }
        else {
            this.props.setUsername(e.target.value);
            this.setState({ username: e.target.value});
        }
    }

    handlePasswordChange(password) {
        this.props.setPassword(password);
        this.setState({password});
    }

    handleDeletePassword(){
        this.props.deletePassword(this.props.selectedUser.get('userId'));
    }


    render() {
       const user = this.props.selectedUser.toJS();
       const clients = this.props.clients.toJS();
       const activeClients = this.props.activePage;
       const selectedClient = this.props.selectedClient.toJS();
       const disabled = this.props.areRoleEdits && this.props.initialUsername === this.state.username
           && this.props.initialIsSysAdmin === this.props.selectedUser.get('isSuperUser')
           && this.state.password === '';

       const footerButtons = (
            <div>
                <div className="pull-left">
                    <button className="btn btn--transparent" onClick={this.openRemoveUserModal}><FormattedMessage id="admin.allUsers.editUser.deleteUser" defaultMessage="Delete User" /></button>
                </div>
                <div className="pull-right">
                    <Link to="/admin/users"><button className="btn btn--transparent"><FormattedMessage id="admin.allUsers.editUser.cancel" defaultMessage="Cancel" /></button></Link>
                    <button className="btn btn--primary" style={{ margin: '0 0 0 15px' }} disabled={disabled}
                            onClick={this.onSave}><FormattedMessage id="admin.allUsers.editUser.save" defaultMessage="Save" /></button>
                    <button className="btn btn--primary" style={{ margin: '0 0 0 15px' }} disabled={disabled}
                            onClick={this.onSaveAndContinue}><FormattedMessage id="admin.allUsers.editUser.saveAndContinue" defaultMessage="Save and Continue Editing" /></button>
                </div>
            </div>
        );

        return (
            <div className="animated fadeIn">
                <ViewLayout title={this.props.route.name} subtitle={this.state.username} loading={this.props.loading} isFooterShowing={true} footerButtons={footerButtons}>
                    <div className="row">
                        <div className="col-md-12">
                            <UserInfo
                                user={this.props.selectedUser.toJS()}
                                onSubmit={this.onSubmit}
                                username={this.state.username}
                                password={this.state.password}
                                hasPassword={this.props.selectedUser.get('hasPassword')}
                                isAppSysAdmin={this.props.isAppSysAdmin}
                                isSysAdmin={this.props.isSysAdmin}
                                onUsernameChange={this.handleUsernameChange}
                                error={this.state.userNameError}
                                success={this.state.userNameSuccess}
                                lastLogin={user.lastLogin}
                                onPasswordChange={this.handlePasswordChange}
                                onPasswordClick={this.handlePasswordClick}
                                deletePassword={this.handleDeletePassword}
                                validationError={this.state.validationError}
                                validationSuccess={this.state.validationSuccess}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <Clients
                                userClients={this.props.userClients.toJS()}
                                user={this.props.selectedUser.toJS()}
                                clientRoles={this.props.clientRoles.toJS()}
                                getClient={this.props.getClient}
                                getClientRoles={this.props.getClientRoles}
                                rolesTotal={this.props.rolesTotal}
                                setActiveClientsPage={this.props.setActiveClientsPage}
                                selectRole={this.selectRole}
                                selectedClient={selectedClient}
                                removeClientRow={this.removeClientRow}
                                clients={clients}
                                deletes={this.props.deletes.toJS()}
                                initialRoles={this.props.initialRoles.toJS()}
                                getClients={this.props.getClients}
                                addClientRow={this.addClientRow}
                                activePage={activeClients}
                                maxHeight={this.props.browserHeight-525}
                                total={this.props.total}
                                loadingRoles={this.props.loadingRoles}
                                isSysAdmin={this.props.isSysAdmin}
                            />
                        </div>
                    </div>
                    <ConfirmModal
                         show={this.state.showRemoveUserModal}
                         header={<FormattedMessage id="admin.allUsers.editUser.confirmModal.header" defaultMessage="Delete User" />}
                         message={<FormattedMessage id="admin.allUsers.editUser.confirmModal.message" defaultMessage="Are you sure you want to delete this user?"/>}
                         name={this.props.selectedUser.get('userName')}
                         onClose={this.closeRemoveUserModal}
                         onSubmit={this.remove}
                     />
                </ViewLayout>
            </div>
        );
    }
}

EditAllUser.defaultProps = {
    setActiveClientsPage: function(){},
    browserHeight: {}
};

const mapStateToProps = createStructuredSelector({
    activeClient: appActiveClientSelector(),
    isAppSysAdmin: appIsSysAdminSelector(),
    clients:clientsSelector(),
    selectedUser : selectedUserSelector(),
    selectedClient : clientSelector(),
    requestBody : requestBodySelector(),
    userClients: userClientSelector(),
    clientRoles: clientRolesSelector(),
    initialRoles: initialRolesSelector(),
    initialUsername: initialUsernameSelector(),
    initialPassword: initialPasswordSelector(),
    initialIsSysAdmin: initialIsSysAdminSelector(),
    adds: addsSelector(),
    deletes: deletesSelector(),
    areRoleEdits: userRoleEditsSelector(),
    loading: loadingSelector(),
    loadingRoles: loadingRolesSelector(),
    total: clientsTotalSelector(),
    rolesTotal:rolesTotalSelector(),
    activePage: clientsActivePageSelector(),
    browserHeight: browserHeightSelector()
});

const mapDispatchToProps = dispatch => {
    return {
        getUser: bindActionCreators(getUser, dispatch),
        isSysAdmin: bindActionCreators(setSysAdmin, dispatch),
        getClients:bindActionCreators(getClients, dispatch),
        getClient:bindActionCreators(getClient, dispatch),
        setActiveClientsPage: bindActionCreators(setActiveClientsPage, dispatch),
        selectUserRoleToEdit: bindActionCreators(selectUserRoleToEdit, dispatch),
        editUser: bindActionCreators(editUser, dispatch),
        resetState: bindActionCreators(resetState, dispatch),
        deleteUser: bindActionCreators(deleteUser, dispatch),
        deletePassword:bindActionCreators(deletePassword, dispatch),
        removeRow: bindActionCreators(removeRow, dispatch),
        getClientRoles: bindActionCreators(getRolesByClient, dispatch),
        setUsername: bindActionCreators(setUsername, dispatch),
        setPassword: bindActionCreators(setPassword, dispatch),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditAllUser);