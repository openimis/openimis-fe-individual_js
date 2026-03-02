import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { useTheme, styled } from "@mui/material/styles";

import {
    Form,
    withModulesManager,
    formatMessage,
    formatMessageWithValues,
    journalize,
    Helmet,
} from "@openimis/fe-core";
import { fetchGroup, clearGroup } from "../actions";
import { RIGHT_GROUP_UPDATE } from "../constants";
import GroupHeadPanel from "./GroupHeadPanel";
import GroupTabPanel from "./GroupTabPanel";

const StyledDiv = styled("div")(({ theme }) => ({
    ...theme.page ?? {}
}));

class GroupForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            group: {},
            reset: 0,
            readOnlyFields: [],
            isDirty: false,
            createMutationId: null,
        };
    }

    componentDidMount() {
        if (!!this.props.groupUuid) {
            this.props.fetchGroup(this.props.modulesManager, [`id: "${this.props.groupUuid}"`]);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.fetchedGroup !== this.props.fetchedGroup && !!this.props.fetchedGroup) {
            this.setState(
                (state, props) => ({
                    group: props.group,
                    reset: state.reset + 1,
                    isDirty: false,
                })
            );
        } else if (prevProps.group !== this.props.group && !!this.props.group) {
            this.setState(
                (state, props) => ({
                    group: props.group,
                    reset: state.reset + 1,
                    isDirty: false,
                })
            );
        } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
            if (!!this.state.group.id) {
                this.props.fetchGroup(this.props.modulesManager, [`id: "${this.state.group.id}"`]);
            } else if (!!this.state.createMutationId) {
                this.props.fetchGroup(this.props.modulesManager, [`clientMutationId: "${this.state.createMutationId}"`]);
            } else {
                this.props.fetchGroup(this.props.modulesManager, [`clientMutationId: "${this.props.mutation.clientMutationId}"`]);
                this.setState((_, props) => ({ createMutationId: props.mutation.clientMutationId }));
            }
        }
    }

    componentWillUnmount() {
        this.props.clearGroup();
    }

    isMandatoryFieldsEmpty = () => {
        const { group } = this.state;
        if (!!group.code?.trim() && !!group.location?.uuid) {
            return false;
        }
        return true;
    }

    canSave = () => !this.isMandatoryFieldsEmpty();

    save = group => this.props.save(group);

    onEditedChanged = group => this.setState({ group, isDirty: true })

    titleParams = () => ({
        id: this.state.group?.code,
    });

    isUpdatable = () => !this.state.group?.isDeleted;

    setReadOnlyFields = readOnlyFields => this.setState({ readOnlyFields });

    render() {
        const { intl, rights, group, back, setConfirmedAction, actions, saveTooltip, groupIndividualIds, groupUuid, editedGroupIndividual, setEditedGroupIndividual, readOnly } = this.props;
        return (
            <StyledDiv className="page">
                <Fragment>
                    <Helmet title={formatMessageWithValues(intl, "group", "pageTitle", this.titleParams())} />
                    <Form
                        module="group"
                        title="pageTitle"
                        titleParams={this.titleParams()}
                        edited={this.state.group}
                        back={back}
                        canSave={this.canSave}
                        save={this.save}
                        onEditedChanged={this.onEditedChanged}
                        HeadPanel={GroupHeadPanel}
                        Panels={[GroupTabPanel]}
                        mandatoryFieldsEmpty={this.isMandatoryFieldsEmpty()}
                        saveTooltip={saveTooltip}
                        rights={rights}
                        savedGroup={group}
                        isUpdatable={this.isUpdatable()}
                        setReadOnlyFields={this.setReadOnlyFields}
                        readOnlyFields={this.state.readOnlyFields}
                        reset={this.state.reset}
                        setConfirmedAction={setConfirmedAction}
                        actions={actions}
                        openDirty
                        groupIndividualIds={groupIndividualIds}
                        groupId={groupUuid}
                        editedGroupIndividual={editedGroupIndividual}
                        setEditedGroupIndividual={setEditedGroupIndividual}
                        readOnly={readOnly}
                    />
                </Fragment>
            </StyledDiv>
        )
    }
}

const mapStateToProps = state => ({
    fetchingGroup: state.individual.fetchingGroup,
    fetchedGroup: state.individual.fetchedGroup,
    group: state.individual.group,
    errorGroup: state.individual.errorGroup,
    submittingMutation: state.individual.submittingMutation,
    mutation: state.individual.mutation,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchGroup, journalize, clearGroup }, dispatch);
};

export default withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(GroupForm)));