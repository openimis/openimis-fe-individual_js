import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { styled } from "@mui/material/styles";

import {
    Form,
    withModulesManager,
    formatMessageWithValues,
    journalize,
    Helmet,
    GetIconComponent
} from "@openimis/fe-core";
import { fetchGroup, clearGroup } from "../actions";
import { RIGHT_GROUP_UPDATE } from "../constants";
import GroupHeadPanel from "./GroupHeadPanel";
import GroupTabPanel from "./GroupTabPanel";

const ReplayIcon = GetIconComponent("replay");

const StyledGroupForm = styled("div")(({ theme }) => ({
    ...theme.page ?? {},
    "&.lockedPage": theme?.page?.locked ?? {},
}));

class GroupForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            group: {},
            reset: 0,
            readOnlyFields: [],
            isDirty: false,
            isSaved: false,
            clientMutationId: null,
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
            this.setState((state, props) => ({
                reset: state.reset + 1,
                clientMutationId: props.mutation?.clientMutationId,
            }));
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

    canSave = () => !this.isMandatoryFieldsEmpty() && this.state.isDirty;

    save = group => this.setState({ isSaved: true }, () => this.props.save(group));

    onEditedChanged = group => this.setState({ group, isDirty: true })

    reload = async () => {
        const { modulesManager, groupUuid } = this.props;
        const { clientMutationId } = this.state;

        try {
            if (groupUuid) {
                await this.props.fetchGroup(modulesManager, [`id: "${groupUuid}"`]);
                return;
            }
            if (clientMutationId) {
                await this.props.fetchGroup(modulesManager, [`clientMutationId: "${clientMutationId}"`]);
            }
        } finally {
            this.setState({ clientMutationId: null, isSaved: false });
        }
    };

    titleParams = () => ({
        id: this.state.group?.code,
    });

    isUpdatable = () => !this.state.group?.isDeleted;

    setReadOnlyFields = readOnlyFields => this.setState({ readOnlyFields });

    render() {
        const { intl, rights, group, back, setConfirmedAction, actions, saveTooltip, groupIndividualIds, groupUuid, editedGroupIndividual, setEditedGroupIndividual, readOnly } = this.props;
        const { clientMutationId } = this.state;
        const runningMutation = !!this.state.group && !!clientMutationId;
        const formActions = [
            {
                doIt: this.reload,
                icon: <ReplayIcon />,
                onlyIfDirty: !readOnly && !runningMutation && !this.state.isSaved,
            },
            ...(actions || []),
        ];
        return (
            <StyledGroupForm className={`page ${runningMutation ? "lockedPage" : ""}`.trim()}>
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
                        actions={formActions}
                        openDirty
                        groupIndividualIds={groupIndividualIds}
                        groupId={groupUuid}
                        editedGroupIndividual={editedGroupIndividual}
                        setEditedGroupIndividual={setEditedGroupIndividual}
                        readOnly={readOnly || runningMutation}
                    />
                </Fragment>
            </StyledGroupForm>
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
