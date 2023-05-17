import React from "react";
import { Grid, Divider, Typography } from "@material-ui/core";
import { withModulesManager, TextInput, TextAreaInput, FormattedMessage, PublishedComponent } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { defaultHeadPanelStyles } from "../util/styles";

const IndividualHeadPanel = ({ modulesManager, classes, individual, mandatoryFieldsEmpty }) => {
  return (
    <>
      <Grid container className={classes.tableTitle}>
        <Grid item>
          <Grid container align="center" justify="center" direction="column" className={classes.fullHeight}>
            <Grid item>
              <Typography>
                <FormattedMessage module="individual" id="headPanelTitle" />
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Divider />
      {mandatoryFieldsEmpty && (
        <>
          <div className={classes.item}>
            <FormattedMessage module="individual" id="mandatoryFieldsEmptyError" />
          </div>
          <Divider />
        </>
      )}
      <Grid container className={classes.item}>
        <Grid item xs={3} className={classes.item}>
          <TextInput module="individual" label="individual.firstName" value={individual?.firstName} readOnly />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextInput module="individual" label="individual.lastName" value={individual?.lastName} readOnly />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <PublishedComponent
            pubRef="core.DatePicker"
            module="individual"
            label="individual.dob"
            value={individual?.dob}
            readOnly
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <PublishedComponent
            pubRef="core.DatePicker"
            module="individual"
            label="individual.dateValidFrom"
            value={individual?.dateValidFrom}
            readOnly
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <PublishedComponent
            pubRef="core.DatePicker"
            module="individual"
            label="individual.dateValidTo"
            value={individual?.dateValidTo}
            readOnly
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextAreaInput module="individual" label="individual.json_ext" value={individual?.jsonExt} readOnly />
        </Grid>
      </Grid>
    </>
  );
};

export default withModulesManager(injectIntl(withTheme(withStyles(defaultHeadPanelStyles)(IndividualHeadPanel))));
