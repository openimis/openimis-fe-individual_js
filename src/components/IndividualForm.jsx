import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { useTheme, styled } from "@mui/material/styles";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

import {
    Form,
    withModulesManager,
    formatMessage,
    formatMessageWithValues,
    journalize,
    Helmet,
    coreAlert,
    withHistory,
} from "@openimis/fe-core";
import { fetchIndividual } from "../actions";
import { ACTION_TYPE } from "../reducer";
import IndividualHeadPanel from "./IndividualHeadPanel";
import IndividualTabPanel from "./IndividualTabPanel";

const StyledDiv = styled("div")(({ theme }) => ({
    ...theme.page ?? {}
}));

class IndividualForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            individual: {},
            reset: 0,
            readOnlyFields: [],
            isDirty: false,
            createMutationId: null,
            showSaveConfirmDialog: false,
            pendingLocation: null
        };
        this.history = props.history;
    }

    componentDidMount() {
        if (!!this.props.individualUuid) {
            this.props.fetchIndividual(this.props.modulesManager, [`id: "${this.props.individualUuid}"`]);
        }
        this.setupNavigationGuard();
        this.setupHistoryGuard();
    }

    componentWillUnmount() {
        this.cleanupNavigationGuard();
        this.cleanupHistoryGuard();
    }

    setupNavigationGuard = () => {
        this.beforeUnloadHandler = (e) => {
            if (this.state.isDirty) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        };
        window.addEventListener('beforeunload', this.beforeUnloadHandler);
    }

    cleanupNavigationGuard = () => {
        if (this.beforeUnloadHandler) {
            window.removeEventListener('beforeunload', this.beforeUnloadHandler);
        }
    }

    setupHistoryGuard = () => {
        if (this.history) {
            this.unblock = this.history.block((location, action) => {
                if (this.state.isDirty) {
                    this.setState({ showSaveConfirmDialog: true, pendingLocation: location });
                    return false;
                }
                return true;
            });
        }
    }

    cleanupHistoryGuard = () => {
        if (this.unblock) {
            this.unblock();
        }
    }

    handleBackNavigation = () => {
        if (this.state.isDirty) {
            this.setState({ showSaveConfirmDialog: true });
        } else {
            this.props.back();
        }
    }

    handleSaveAndBack = () => {
        this.setState({ showSaveConfirmDialog: false });
        this.props.save(this.state.individual);
        
        if (this.state.pendingLocation) {
            setTimeout(() => {
                this.history.push(this.state.pendingLocation);
            }, 1000);
        }
    }

    handleBackWithoutSave = () => {
        this.setState({ showSaveConfirmDialog: false, isDirty: false }, () => {
            if (this.state.pendingLocation) {
                this.history.push(this.state.pendingLocation);
            } else {
                this.props.back();
            }
        });
    }

    handleCloseDialog = () => {
        this.setState({ showSaveConfirmDialog: false, pendingLocation: null });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.fetchedIndividual !== this.props.fetchedIndividual && !!this.props.fetchedIndividual) {
            this.setState(
                (state, props) => ({
                    individual: props.individual,
                    reset: state.reset + 1,
                    isDirty: false,
                })
            );
        } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
            if (this.props.mutation?.actionType === ACTION_TYPE.UPDATE_INDIVIDUAL) {
                this.props.coreAlert(
                    formatMessage(this.props.intl, "individual", "individual.update.success.title"),
                    formatMessage(this.props.intl, "individual", "individual.update.success.message"),
                );
            }
            if (!!this.state.individual.id) {
                this.props.fetchIndividual(this.props.modulesManager, [`id: "${this.state.individual.id}"`]);
            } else if (!!this.state.createMutationId) {
                this.props.fetchIndividual(this.props.modulesManager, [`clientMutationId: "${this.state.createMutationId}"`]);
            } else {
                this.props.fetchIndividual(this.props.modulesManager, [`clientMutationId: "${this.props.mutation.clientMutationId}"`]);
                this.setState((_, props) => ({ createMutationId: props.mutation.clientMutationId }));
            }
        }
    }



    isMandatoryFieldsEmpty = () => {
        const { individual } = this.state;
        if (!!individual.firstName && !!individual.lastName && !!individual.dob) {
            return false;
        }
        return true;
    }

    canSave = () => !this.isMandatoryFieldsEmpty();

    save = individual => this.props.save(individual);

    onEditedChanged = individual => this.setState({ individual, isDirty: true })

    titleParams = () => ({
        firstName: this.state.individual?.firstName,
        lastName: this.state.individual?.lastName,
    });

    isUpdatable = () => !this.state.individual?.isDeleted;

    setReadOnlyFields = readOnlyFields => this.setState({ readOnlyFields });

    render() {
        const { intl, rights, individual, setConfirmedAction, actions, saveTooltip } = this.props;
        return (
            <StyledDiv className="page">
                <Fragment>
                    <Helmet title={formatMessageWithValues(intl, "individual", "pageTitle", this.titleParams())} />
                    <Form
                        module="individual"
                        title="pageTitle"
                        titleParams={this.titleParams()}
                        edited={this.state.individual}
                        back={this.handleBackNavigation}
                        canSave={this.canSave}
                        save={this.save}
                        onEditedChanged={this.onEditedChanged}
                        HeadPanel={IndividualHeadPanel}
                        Panels={[IndividualTabPanel]}
                        mandatoryFieldsEmpty={this.isMandatoryFieldsEmpty()}
                        saveTooltip={saveTooltip}
                        rights={rights}
                        savedIndividual={individual}
                        isUpdatable={this.isUpdatable()}
                        setReadOnlyFields={this.setReadOnlyFields}
                        readOnlyFields={this.state.readOnlyFields}
                        reset={this.state.reset}
                        setConfirmedAction={setConfirmedAction}
                        actions={actions}
                        openDirty
                    />
                    
                    {/* Confirmation dialog for unsaved changes */}
                    <Dialog
                        open={this.state.showSaveConfirmDialog}
                        onClose={this.handleCloseDialog}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle>
                            {formatMessage(intl, "individual", "individual.save.confirm.title")}
                        </DialogTitle>
                        <DialogContent>
                            {formatMessage(intl, "individual", "individual.save.confirm.message")}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.handleBackWithoutSave} color="primary" variant="outlined">
                                {formatMessage(intl, "individual", "dialog.cancel")}
                            </Button>
                            <Button onClick={this.handleSaveAndBack} color="primary" variant="contained">
                                {formatMessage(intl, "individual", "dialog.update")}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Fragment>
            </StyledDiv>
        )
    }
}

const mapStateToProps = state => ({
    fetchingIndividual: state.individual.fetchingIndividual,
    fetchedIndividual: state.individual.fetchedIndividual,
    individual: state.individual.individual,
    errorIndividual: state.individual.errorIndividual,
    submittingMutation: state.individual.submittingMutation,
    mutation: state.individual.mutation,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchIndividual, journalize, coreAlert }, dispatch);
};

export default withHistory(withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(IndividualForm))));
