import React from 'react';
import GroupSearcher from '../GroupSearcher';
import PreviewEnrollmentDialog, { connectPreviewDialog } from './PreviewEnrollmentDialog';

function GroupPreviewEnrollmentDialog({ enrollmentSummary, ...props }) {
  return (
    <PreviewEnrollmentDialog
      {...props}
      Searcher={GroupSearcher}
      previewLabelKey="individual.enrollment.previewGroups"
      nothingToEnroll={enrollmentSummary?.numberOfGroupsToUpload === '0'}
    />
  );
}

export { GroupPreviewEnrollmentDialog };
export default connectPreviewDialog(GroupPreviewEnrollmentDialog);
