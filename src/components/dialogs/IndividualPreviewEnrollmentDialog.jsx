import React from 'react';
import IndividualSearcher from '../IndividualSearcher';
import PreviewEnrollmentDialog, { connectPreviewDialog } from './PreviewEnrollmentDialog';

function IndividualPreviewEnrollmentDialog({ enrollmentSummary, ...props }) {
  return (
    <PreviewEnrollmentDialog
      {...props}
      Searcher={IndividualSearcher}
      previewLabelKey="individual.enrollment.previewIndividuals"
      nothingToEnroll={enrollmentSummary?.numberOfIndividualsToUpload === '0'}
    />
  );
}

export { IndividualPreviewEnrollmentDialog };
export default connectPreviewDialog(IndividualPreviewEnrollmentDialog);
