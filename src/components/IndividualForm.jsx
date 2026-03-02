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
import { fetchIndividual } from "../actions";
import { RIGHT_INDIVIDUAL_UPDATE } from "../constants";
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
            createMutationId: null
        };
    }

    componentDidMount() {
        if (!!this.props.individualUuid) {
            this.props.fetchIndividual(this.props.modulesManager, [`id: "${this.props.individualUuid}"`]);
        }
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
        const { intl, rights, individual, back, setConfirmedAction, actions, saveTooltip } = this.props;
        return (
            <StyledDiv className="page">
                <Fragment>
                    <Helmet title={formatMessageWithValues(intl, "individual", "pageTitle", this.titleParams())} />
                    <Form
                        module="individual"
                        title="pageTitle"
                        titleParams={this.titleParams()}
                        edited={this.state.individual}
                        back={back}
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
    return bindActionCreators({ fetchIndividual, journalize }, dispatch);
};

export default withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(IndividualForm)));