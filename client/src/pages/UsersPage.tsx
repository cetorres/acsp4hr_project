import { AppBar, Avatar, Box, Button, Chip, Dialog, DialogContent, FormControlLabel, Grid, IconButton, InputAdornment, Paper, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { User } from '../api/users/user';
import MainPageContainer from '../components/MainPageContainer';
import CloseIcon from '@mui/icons-material/Close';
import { Add, Delete, Save, Visibility, VisibilityOff } from '@mui/icons-material';
import { ConfirmDialog } from '../components/ConfirmDialog';
import FabFixedBottom from '../components/FabFixedBottom';
import FabFixedBottomContainer from '../components/FabFixedBottomContainer';
import { SnackBar, SnackBarInfo } from '../components/SnackBar';
import Users from '../api/users/users';
import ActiveIndicator from '../components/ActiveIndicator';

const rowsPerPage = 10;

export const UsersPage = () => {
  const [users, setUsers] = useState([] as User[] | null);
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null as User | null);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [snackBarInfo, setSnackBarInfo] = useState(null as SnackBarInfo | null);
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);

  const initialFormData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    bio: '',
    isActive: false,
    isAdmin: false
  };

  const [formData, setFormData] = useState(initialFormData);

  const loadUsers = async () => {
    const usersList = await Users.getUsers();
    setUsers(usersList);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleSaveUser = async () => {
    const form = document.getElementById('formUser') as HTMLFormElement;
    if (!form.reportValidity()) return;

    if (currentUser) {
      const { email, password, ...cleanForm } = formData;
      const [result, message] = await Users.updateUser(Number(currentUser?.id), cleanForm);
    
      if (result) {
        setSnackBarInfo({
          message: 'User saved successfully.',
          type: 'success'
        });
        loadUsers();
        handleCloseDialog();
      }
      else {
        setSnackBarInfo({
          message: 'Error: ' + message,
          type: 'error'
        });
      }
    }
    else {
      const [result, message] = await Users.createUser(formData);
    
      if (result) {
        setSnackBarInfo({
          message: 'User created successfully.',
          type: 'success'
        });
        loadUsers();
        handleCloseDialog();
      }
      else {
        let msg = message;
        if (message.includes('duplicate')) msg = 'Email already exists.'
        setSnackBarInfo({
          message: 'Error: ' + msg,
          type: 'error'
        });
      }
    }
  }

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleOpenDialog = (user: User) => {
    setCurrentUser(user);
    setFormData({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: '',
      password: '',
      bio: user?.bio ?? '',
      isActive: user?.isActive ?? false,
      isAdmin: user?.isAdmin ?? false
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleOpenDialogNewUser = () => {
    setCurrentUser(null);
    setFormData({ ...initialFormData, isActive: true });
    setDialogOpen(true);
  };

  const handleOpenDeleteDialog = (user: User) => {
    setCurrentUser(user);
    setDialogDeleteOpen(true);
  };

  const handleDelete = async () => {
    const [result, message] = await Users.deleteUser(Number(currentUser?.id));
    
    if (result) {
      loadUsers();
      setSnackBarInfo({
        message: 'User deleted successfully.',
        type: 'success'
      });
    }
    else {
      setSnackBarInfo({
        message: `Error: ${message}`,
        type: 'error'
      });
    }
  }

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - (users?.length ?? 0)) : 0;
  
  return (
    <MainPageContainer title='Users'>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <TableContainer sx={fullScreen ? { maxWidth: '87vw' } : {}}>
          <Table aria-label="users table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align='center'>Status</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Last login</TableCell>
                <TableCell>Created at</TableCell>
                <TableCell>Updated at</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow tabIndex={-1} key={user.id} sx={{ cursor: 'pointer' }}>
                    <TableCell onClick={() => handleOpenDialog(user)}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Avatar>{user.firstName.charAt(0).toUpperCase()}{user.lastName.charAt(0).toUpperCase()}</Avatar>
                        <Box sx={{ ml: 2 }}>
                          <Typography component="div" variant="inherit">
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography
                            color="text.secondary"
                            component="div"
                            variant="caption"
                          >
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center" onClick={() => handleOpenDialog(user)}>
                      <ActiveIndicator isActive={user.isActive} />
                    </TableCell>
                    <TableCell onClick={() => handleOpenDialog(user)}>
                      {user.isAdmin ? (
                        <Chip label="Admin" color="success" />
                      ) : (
                        <Chip label="User" />
                      )}
                    </TableCell>
                    <TableCell onClick={() => handleOpenDialog(user)}>{user.lastLogin ? new Date(user.lastLogin)?.toLocaleString() : '-'}</TableCell>
                    <TableCell onClick={() => handleOpenDialog(user)}>{user.createdAt ? new Date(user.createdAt)?.toLocaleString() : '-'}</TableCell>
                    <TableCell onClick={() => handleOpenDialog(user)}>{user.updatedAt ? new Date(user.updatedAt)?.toLocaleString() : '-'}</TableCell>
                    <TableCell>
                      <IconButton
                        size="large"
                        edge="end"
                        title='Delete User'
                        onClick={(e) => handleOpenDeleteDialog(user)}
                        aria-label="delete user"
                        sx={{ mr: 2 }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={users?.length ?? 0}
          rowsPerPageOptions={[rowsPerPage]}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
        />
      </Paper>

      <FabFixedBottomContainer>
        <FabFixedBottom
          title='New'
          icon={<Add sx={{ mr: 1 }} />}
          onClick={handleOpenDialogNewUser}
        />
      </FabFixedBottomContainer>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullScreen={fullScreen}>
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleCloseDialog}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {currentUser ? 'User' : 'New User'}
            </Typography>
            <Button autoFocus color="inherit" onClick={handleSaveUser}>
              <Save sx={{ mr: 1 }} />
              Save
            </Button>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <Box component="form" id='formUser'>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  id="firstName"
                  required
                  label="First name"
                  type="text"
                  fullWidth
                  variant="standard"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.currentTarget.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  required
                  id="lastName"
                  label="Last name"
                  type="text"
                  fullWidth
                  variant="standard"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.currentTarget.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="bio"
                  label="Bio"
                  name="bio"
                  multiline
                  variant="standard"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.currentTarget.value })}
                />
              </Grid>
              <Grid item xs={currentUser ? 12 : 6}>
                <TextField
                  disabled={currentUser != null}
                  required={currentUser == null}
                  id="email"
                  label="Email"
                  type="email"
                  autoComplete='off'
                  fullWidth
                  variant="standard"
                  value={currentUser ? currentUser?.email : formData.email}
                  onChange={(e) => !currentUser ? setFormData({ ...formData, email: e.currentTarget.value }) : {}}
                />
              </Grid>
              <Grid item xs={6} display={currentUser ? 'none' : 'block'}>
                <TextField
                  name="newUserPassword"
                  required={currentUser == null}
                  fullWidth
                  variant="standard"
                  id="newUserPassword"
                  type={showNewUserPassword ? 'text' : 'password'}
                  label="Password"
                  autoComplete='off'
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.currentTarget.value })}
                  InputProps={{
                    endAdornment:
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showNewUserPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.currentTarget.checked })}
                    inputProps={{ 'aria-label': 'controlled' }}
                  />
                } label="Active" />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel control={
                  <Switch
                    checked={formData.isAdmin}
                    onChange={(e) => setFormData({ ...formData, isAdmin: e.currentTarget.checked })}
                    inputProps={{ 'aria-label': 'controlled' }}
                  />
                } label="Administrator" />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <SnackBar
        snackBarInfo={snackBarInfo}
        onCloseSnackbar={() => setSnackBarInfo(null)}
      />

      {/* Confirmation dialog */}
      <ConfirmDialog
        open={dialogDeleteOpen}
        setOpen={setDialogDeleteOpen}
        title='Delete'
        body={`Confirm deleting user "${currentUser?.firstName} ${currentUser?.lastName}"?`}
        handleYes={handleDelete}
        handleNo={() => { }}
      />
    </MainPageContainer>
  );
}
