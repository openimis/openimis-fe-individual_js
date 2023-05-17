import React from "react";
import { injectIntl } from "react-intl";
import { TextInput, PublishedComponent } from "@openimis/fe-core";
import { Grid } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { CONTAINS_LOOKUP, DEFAULT_DEBOUNCE_TIME } from "../constants";
import _debounce from "lodash/debounce";
import { defaultFilterStyles } from "../util/styles";

const IndividualFilter = ({ intl, classes, filters, onChangeFilters }) => {
  const debouncedOnChangeFilters = _debounce(onChangeFilters, DEFAULT_DEBOUNCE_TIME);

  const filterValue = (filterName) => filters?.[filterName]?.value;

  const onChangeStringFilter =
    (filterName, lookup = null) =>
    (value) => {
      lookup
        ? debouncedOnChangeFilters([
            {
              id: filterName,
              value,
              filter: `${filterName}_${lookup}: "${value}"`,
            },
          ])
        : onChangeFilters([
            {
              id: filterName,
              value,
              filter: `${filterName}: "${value}"`,
            },
          ]);
    };

  return (
    <Grid container className={classes.form}>
      <Grid item xs={2} className={classes.item}>
        <TextInput
          module="individual"
          label="individual.firstName"
          value={filterValue("firstName")}
          onChange={onChangeStringFilter("firstName", CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <TextInput
          module="individual"
          label="individual.lastName"
          value={filterValue("lastName")}
          onChange={onChangeStringFilter("lastName", CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <PublishedComponent
          pubRef="core.DatePicker"
          module="individual"
          label="individual.dob"
          value={filterValue("dob")}
          onChange={(v) =>
            onChangeFilters([
              {
                id: "dob",
                value: v,
                filter: `dob: "${v}"`,
              },
            ])
          }
        />
      </Grid>
    </Grid>
  );
};

export default injectIntl(withTheme(withStyles(defaultFilterStyles)(IndividualFilter)));
