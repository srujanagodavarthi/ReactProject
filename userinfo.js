import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';

import config from '../../../config';

import EmailInput from '../../../components/pwc-forms/EmailInput';
import SingleCheck from '../../../components/pwc-forms/SingleCheck';
import PasswordEditor from '../../../components/forms/PasswordEditor'

export default class UserInfo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isChecked: this.props.user.isSuperUser, // TODO: convert isSuperUser to isSysAdmin on backend
            clientIdentifier:'',
        };

        this.handlePageClick = this.handlePageClick.bind(this);
        this.handleRowClick = this.handleRowClick.bind(this);
        this.handleSysAdminClick = this.handleSysAdminClick.bind(this);
        this.handlePasswordSubmit = this.handlePasswordSubmit.bind(this);
    }

    handleRowClick(client) {
        this.props.setActiveClient(client);
        // browserHistory.push('users');
    }

    handlePasswordSubmit(password) {
        this.props.onPasswordChange(password);
    }

    handlePageClick(page) {
        this.props.setActiveClientsPage(page);
        this.props.getClients(config.paginationSize, (page - 1) * config.paginationSize);
    }

    handleSysAdminClick() {
        let checked=!this.state.isChecked;
        this.setState({isChecked:checked});
        this.props.isSysAdmin(checked);
    }

    render() {

        return (
            <div className="row" >
                <div className="col-md-5">
                    <EmailInput label={<FormattedMessage id="admin.allUsers.editUser.username" defaultMessage="Username"/>}
                                errorMessage={(<FormattedMessage id="admin.allUsers.editUser.userName.error.enterValueMsg"
                                                                 defaultMessage="{title} Please enter a value."
                                                                 values={{title: "Invalid Email Format"}}/>)}
                                value={this.props.username}
                                required={true}
                                isError={this.props.error}
                                isSuccess={this.props.success}
                                onChange={this.props.onUsernameChange}
                                wrapperClass="forms-full-width" />
                </div>
                <div className="col-md-4">
                    {this.props.isSysAdmin &&
                    <PasswordEditor hasPassword={this.props.hasPassword}
                                    value={this.props.password}
                                    onDeletePassword={this.props.deletePassword}
                                    onSubmit={this.handlePasswordSubmit}
                    />
                    }
                </div>
                <div className="col-md-3">
                    <SingleCheck heading={(<FormattedMessage id="admin.allUsers.editUser.accountInfo" defaultMessage="Account Information"/>)}
                                 label={(<FormattedMessage id="admin.allUsers.editUser.sysAdmin" defaultMessage="sysAdmin"/>)}
                                 onChange={this.handleSysAdminClick}
                                 checked={this.state.isChecked}
                                 style={{marginBottom: 0}}/>
                </div>
            </div>
        );
    }
}

 UserInfo.defaultProps = {
 };