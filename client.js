import React, { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';

import Pagination from '../../../components/navigation/Pagination';
import Loading from '../../../components/layout/Loading';
import Table from '../../../components/layout/Table/Table';
import FieldGroup from '../../../components/pwc-forms/FieldGroup';
import Multiselect from '../../../components/pwc-forms/Multiselect';
import MultiselectCheck from '../../../components/pwc-forms/MultiselectCheck';
import messages from '../../../messages'

import config from '../../../config';

import ClientsRow from './ClientsRow';

class Clients extends Component {

    constructor(props) {
        super(props);

        this.handlePageClick = this.handlePageClick.bind(this);
        this.handleRowClick = this.handleRowClick.bind(this);
        this.removeClientRow = this.removeClientRow.bind(this);
    }

    handleRowClick(clientId,page,index) {
        this.props.setActiveClientsPage(page);
        this.props.getClientRoles(clientId,config.paginationSize, (page - 1) * config.paginationSize);
    }

    handlePageClick(page) {
        this.props.setActiveClientsPage(page);
        this.props.getClients(config.paginationSize, (page - 1) * config.paginationSize);
    }

    removeClientRow(clientId)
    {
        this.props.removeClientRow(clientId)
    }
    render() {
        const clients =  this.props.clients|| [];
        let page=1,
        start= 1,
        end=this.props.userClients.length;
        const {formatMessage} = this.props.intl;
        return (

            <div className="edit-user-account-info-form">
                <div className="edit-user-roles-wrap" >
                    <div className="row" >
                        <div className="col-md-5">
                            <FieldGroup label={(<FormattedMessage id="admin.allUsers.editUser.availableClients" defaultMessage="Available Clients"/>)}>
                                <Table maxHeight={this.props.maxHeight-35}
                                    thead={
                                        <tr>
                                            <th className="col-md-6"><FormattedMessage id="admin.allUsers.editUser.clientName" defaultMessage="Client Name"/> </th>
                                            <th className="col-md-4"><FormattedMessage id="admin.allUsers.editUser.toolSets" defaultMessage="ToolSets"/> </th>
                                            <th className="col-md-2"><FormattedMessage id="admin.allUsers.editUser.actions" defaultMessage="Actions"/> </th>
                                        </tr>
                                    }
                                >
                                    {clients.length > 0 && clients.map((client, index) => (
                                        <ClientsRow key={client.clientIdentifier}
                                                    client={client}
                                                    onClick={this.props.onRowClick}
                                                    addClientRow={this.props.addClientRow}
                                                    removeClientRow={this.props.removeClientRow}
                                                    userClients={this.props.userClients}
                                                    deletes={this.props.deletes}
                                        />
                                    ))}
                                </Table>
                                <Pagination
                                    activePage={this.props.activePage}
                                    onSelect={this.handlePageClick}
                                    total={this.props.total}
                                    size={config.paginationSize}
                                    length={this.props.clients.length}
                                />
                            </FieldGroup>
                        </div>
                        <div className="col-md-4">
                            <FieldGroup label={(<FormattedMessage id="admin.allUsers.editUser.userClients" defaultMessage="User Clients"/>)}>
                                {this.props.userClients.length > 0 ?
                                    <Table footer={
                                            <span className="pull-right">
                                                <FormattedMessage id="admin.allUsers.editUser.noOfClients"
                                                    defaultMessage={`Showing {start} -  {end, number} {end, plural,
                                                                  one {Client} other {Clients}}`}
                                                    values={{start,end}}
                                                />
                                            </span>
                                        }
                                        maxHeight={this.props.maxHeight + 37}>
                                        {this.props.userClients.map((client,index) => (
                                            <tr className={this.props.selectedClient.clientIdentifier===client.clientIdentifier?"active clickableRow":"clickableRow"}
                                                key={client.clientIdentifier}>
                                                <td  className="col-md-9" onClick={()=> this.handleRowClick(client.clientIdentifier,page,index)}>
                                                    {client.clientName}</td>
                                                <td className="col-md-3"> <i className="icon-close icons font-2xl"  style={{textAlign: 'center'}}
                                                                      onClick={()=>this.removeClientRow(client.clientIdentifier)}
                                                                      onChange={this.handleChange} disabled="false"/></td>
                                            </tr>))
                                        }
                                    </Table>
                                    : <p><FormattedMessage id="admin.allUsers.editUser.noClientsSelected" defaultMessage="No User Clients added"/> </p> }
                            </FieldGroup>
                        </div>
                        <div className="col-md-3">
                            <Multiselect label={(<FormattedMessage id="admin.users.editUser.roles" defaultMessage="Roles" />)}
                                         wrapperClass="forms-full-width" maxHeight={this.props.maxHeight + 37}>
                                {this.props.loadingRoles
                                    ? <Loading/>
                                    : <div>
                                        {this.props.clientRoles.length > 0
                                            ? this.props.clientRoles.map((role) => (
                                                <MultiselectCheck key={role.roleId} label={role.roleName} onChange={(e) => this.props.selectRole(e, role.roleId)}
                                                                  checked={this.props.user.clients.some(client => client.clientIdentifier === this.props.selectedClient.clientIdentifier &&
                                                                            client.roles.some(roles => roles.roleId === role.roleId && roles.isSelected))}
                                                                  title={role.permissions.filter(p => p.isSelected === true).map((p) =>
                                                                      messages[p.permissionName] ? formatMessage(messages[p.permissionName]) : p.permissionName).join('\n')}
                                                                  disabled={role.isRestricted && !this.props.isSysAdmin}/>
                                            ))
                                            : <p><FormattedMessage
                                                id="admin.allUsers.editUser.noClientsSelectedForRoles"
                                                defaultMessage="Select User Client to toggle Roles"/></p>}
                                    </div>
                                }
                            </Multiselect>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Clients.defaultProps = {
    onClick: function(){},
    onChange:function(){},
    client: {}
};

export default (injectIntl(Clients));