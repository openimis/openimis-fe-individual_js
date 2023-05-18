# openIMIS Frontend Individual module
This repository holds the files of the openIMIS Frontend Individual module.
It is dedicated to be bootstrap development of [openimis-fe_js](https://github.com/openimis/openimis-fe_js) modules, providing an empty (yet deployable) module.

Please refer to [openimis-fe_js](https://github.com/openimis/openimis-fe_js) to see how to build and and deploy (in developement or server mode).

The module is built with [rollup](https://rollupjs.org/).
In development mode, you can use `npm link` and `npm start` to continuously scan for changes and automatically update your development server.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/openimis/openimis-fe-individual_js.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/openimis/openimis-fe-individual_js/alerts/)

## Main Menu Contributions
* **Beneficiares and Households** (individual.mainMenu translation key)

  **Individuals** (individual.menu.individuals key), displayed if user has the right `159001`

## Other Contributions
* `core.Router`: registering `individuals`, `individual`, routes in openIMIS client-side router

## Available Contribution Points

## Dispatched Redux Actions
* `INDIVIDUAL_INDIVIDUALS_{REQ|RESP|ERR}` fetching Individuals (as triggered by the searcher)
* `INDIVIDUAL_INDIVIDUAL_{REQ|RESP|ERR}` fetching chosen Individual
* `INDIVIDUAL_MUTATION_{REQ|ERR}`, sending a mutation
* `INDIVIDUAL_DELETE_INDIVIDUAL_RESP` receiving a result of delete Individual mutation
* `INDIVIDUAL_UPDATE_INDIVIDUAL_RESP` receiving a result of update Individual mutation

## Other Modules Listened Redux Actions
None

## Other Modules Redux State Bindings
* `state.core.user`, to access user info (rights,...)

## Configurations Options
None
