import messages_en from "./translations/en.json";
import reducer from "./reducer";
import flatten from "flat";
import BeneficiaryMainMenu from "./menus/BeneficiaryMainMenu";
import IndividualsPage from "./pages/IndividualsPage";
import IndividualPage from "./pages/IndividualPage";

const ROUTE_INDIVIDUALS = "individuals";
const ROUTE_INDIVIDUAL = "individuals/individual";

const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: flatten(messages_en) }],
  "reducers": [{ key: "individual", reducer }],
  "core.MainMenu": [BeneficiaryMainMenu],
  "core.Router": [
    { path: ROUTE_INDIVIDUALS, component: IndividualsPage },
    { path: ROUTE_INDIVIDUAL + "/:individual_uuid?", component: IndividualPage },
  ],
  "refs": [
    { key: "individual.route.individual", ref: ROUTE_INDIVIDUAL },
  ],
}

export const IndividualModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}
