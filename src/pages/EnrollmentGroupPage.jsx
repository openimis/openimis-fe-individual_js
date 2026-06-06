import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { styled } from '@mui/material/styles';

import {
  Form,
  useHistory,
  useModulesManager,
  useTranslations,
  coreConfirm,
  clearConfirm,
  journalize,
} from '@openimis/fe-core';
import EnrollmentGroupHeadPanel from '../components/EnrollmentGroupHeadPanel';
import { DEFAULT_BENEFICIARY_STATUS } from '../constants';

const StyledDiv = styled('div')(({ theme }) => ({
  ...theme?.page,
}));

function EnrollmentGroupPage({
  rights,
}) {
  const modulesManager = useModulesManager();
  const history = useHistory();
  const { formatMessage } = useTranslations('individual', modulesManager);

  const [editedEnrollment, setEditedEnrollment] = useState({
    status: DEFAULT_BENEFICIARY_STATUS,
  });

  const back = () => history.goBack();

  const actions = [];

  return (
    <StyledDiv>
      <Form
        key=""
        module="individual"
        title={formatMessage('individual.enrollment.titleGroup')}
        titleParams="Enrollment"
        edited={editedEnrollment}
        onEditedChanged={setEditedEnrollment}
        back={back}
        mandatoryFieldsEmpty={null}
        canSave={() => { }}
        save={null}
        HeadPanel={EnrollmentGroupHeadPanel}
        rights={rights}
        actions={actions}
      />
    </StyledDiv>
  );
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

// eslint-disable-next-line no-unused-vars
const mapStateToProps = (state, props) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  confirmed: state.core.confirmed,
  submittingMutation: state.payroll.submittingMutation,
});

export { StyledDiv };
export default connect(mapStateToProps, mapDispatchToProps)(EnrollmentGroupPage);
