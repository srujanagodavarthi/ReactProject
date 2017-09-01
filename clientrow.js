import React, { Component } from 'react';

export default class ClientsRow extends Component {

    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.props.onClick(this.props.client);
        this.handleAddRemoveClient();
    }

    /**
     * Method will add/remove the available client based on the its copy
     * exists in user client row.
     **/
    handleAddRemoveClient () {
        let isAlreadyAdded = this.props.userClients.find(client => client.clientIdentifier === this.props.client.clientIdentifier);
        if(isAlreadyAdded) {
            this.props.removeClientRow(this.props.client.clientIdentifier);
        } else {
            this.props.addClientRow(this.props.client.clientIdentifier, this.props.client.clientName);
        }
    }

    render() {
        return (
            <tr style={{cursor: 'pointer'}} key={this.props.client.clientIdentifier} onClick={this.handleClick}>
                <td className="col-md-6">{this.props.client.clientName}</td>
                <td className="col-md-4">{this.props.client.toolSets.map(toolset => toolset.toolSetName).join(', ')}</td>
                <td className="col-md-2">{this.props.userClients.find(c=>c.clientIdentifier===this.props.client.clientIdentifier)?
                    <i className="icon-minus icons font-2xl d-block" style={{textAlign: 'center'}}/>:
                    <i className="icon-plus icons font-2xl d-block" style={{ textAlign: 'center'}} disabled="false"/>}
                </td>
            </tr>

        );
    }
}

ClientsRow.defaultProps = {
    onClick: function(){},
    client: {},
    clientId:'admin'
};