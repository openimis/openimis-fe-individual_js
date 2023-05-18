import React, { Fragment } from "react";
import { Grid, Divider, Typography } from "@material-ui/core";
import {
    withModulesManager,
    FormPanel,
    TextAreaInput,
    TextInput,
    FormattedMessage,
    PublishedComponent,
} from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { isJsonString } from "../util/json-validate";

const styles = theme => ({
    tableTitle: theme.table.title,
    item: theme.paper.item,
    fullHeight: {
        height: "100%"
    }
});

class IndividualHeadPanel extends FormPanel {
    render() {
        const { intl, edited, classes, mandatoryFieldsEmpty, setJsonExtValid } = this.props;
        const individual = { ...edited };
        return (
            <Fragment>
                <Grid container className={classes.tableTitle}>
                    <Grid item>
                        <Grid
                            container
                            align="center"
                            justify="center"
                            direction="column"
                            className={classes.fullHeight}
                        >
                            <Grid item>
                                <Typography>
                                    <FormattedMessage module="individual" id="individual.headPanelTitle" />
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <Divider />
                {mandatoryFieldsEmpty && (
                    <Fragment>
                        <div className={classes.item}>
                            <FormattedMessage module="individual" id="individual.mandatoryFieldsEmptyError" />
                        </div>
                        <Divider />
                    </Fragment>
                )}
                <Grid container className={classes.item}>
                  <Grid item xs={3} className={classes.item}>
                    <TextInput 
                      module="individual" 
                      label="individual.firstName" 
                      required
                      onChange={v => this.updateAttribute('firstName', v)}
                      value={individual?.firstName} 
                    />
                  </Grid>
                  <Grid item xs={3} className={classes.item}>
                    <TextInput 
                      module="individual" 
                      label="individual.lastName" 
                      required
                      onChange={v => this.updateAttribute('lastName', v)}
                      value={individual?.lastName} 
                    />
                  </Grid>
                  <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                      pubRef="core.DatePicker"
                      module="individual"
                      label="individual.dob"
                      required
                      onChange={v => this.updateAttribute('dob', v)}
                      value={individual?.dob}
                    />
                  </Grid>
                  <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                      pubRef="core.DatePicker"
                      module="individual"
                      label="individual.dateValidFrom"
                      value={individual?.dateValidFrom}
                      required
                      maxDate={!!individual && !!individual.dateValidTo && individual.dateValidTo}
                      onChange={v => this.updateAttribute('dateValidFrom', v)}
                    />
                  </Grid>
                  <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                      pubRef="core.DatePicker"
                      module="individual"
                      label="individual.dateValidTo"
                      value={individual?.dateValidTo}
                      minDate={!!individual && !!individual.dateValidFrom && individual.dateValidFrom}
                      onChange={v => this.updateAttribute('dateValidTo', v)}
                    />
                  </Grid>
                  <Grid item xs={3} className={classes.item}>
                    <TextAreaInput 
                      module="individual" 
                      label="individual.json_ext" 
                      value={individual?.jsonExt} 
                      onChange={v => this.updateAttribute('jsonExt', v)}
                      error={!isJsonString(individual?.jsonExt)}
                    />
                  </Grid>
                </Grid>
            </Fragment>
        );
    }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(IndividualHeadPanel))))
