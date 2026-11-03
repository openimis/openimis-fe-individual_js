import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { RUNNING_UPLOAD_STATUSES } from '../constants';

/**
 * Progress of a running upload, from the `progress` the backend reports:
 * `{ stage: "validation" | "import", done, total }`. `total` is null while the
 * file is still being read: the bar is then indeterminate. Nothing is shown once
 * the upload is no longer running, nor for a workflow that reports no progress
 * (only the pipeline import does).
 */
function UploadProgress({ status, progress }) {
  const modulesManager = useModulesManager();
  const { formatMessageWithValues } = useTranslations('individual', modulesManager);

  if (!RUNNING_UPLOAD_STATUSES.includes(status) || !progress) return null;

  const stage = progress.stage === 'import' ? 'import' : 'validation';
  const known = Number.isFinite(progress.total) && progress.total > 0;
  const done = progress.done ?? 0;
  const value = known ? Math.min(100, Math.round((done / progress.total) * 100)) : undefined;
  const label = known
    ? formatMessageWithValues(`upload.progress.${stage}`, { done, total: progress.total })
    : formatMessageWithValues(`upload.progress.${stage}Starting`, {});

  return (
    <Box sx={{ minWidth: 160, mt: 0.5 }}>
      <LinearProgress
        variant={known ? 'determinate' : 'indeterminate'}
        value={value}
        aria-label={label}
      />
      <Typography variant="caption">{label}</Typography>
    </Box>
  );
}

export default UploadProgress;
