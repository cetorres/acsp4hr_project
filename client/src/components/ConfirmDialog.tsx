import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { useEffect, useState } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  setOpen: (a:boolean) => void;
  title?: string | null;
  body?: string | null;
  yesText?: string | null;
  noText?: string | null;
  handleYes: () => void;
  handleNo: () => void;
}

export const ConfirmDialog = (props: ConfirmDialogProps) => {
  const handleClose = () => {
    props.setOpen(false);
  };

  const localNo = () => {
    props.setOpen(false);
    props.handleNo();
  };

  const localYes = () => {
    props.setOpen(false);
    props.handleYes();
  };

  return (
    <Dialog
      open={props.open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {props.title ?? 'Confirm'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {props.body ?? ''}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={localNo}>{props.noText ?? 'No'}</Button>
        <Button onClick={localYes} autoFocus>{props.yesText ?? 'Yes'}</Button>
      </DialogActions>
    </Dialog>
  );
}
