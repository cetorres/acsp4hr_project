import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Copyright, SignInTop } from '../components/Common';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Avatar, Card, CardContent, Stack, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Auth from '../api/auth/auth';

export default function SignUp() {
  const navigate = useNavigate();
  const [errorMsgs, setErrorMsgs] = useState([] as string[]);
  const { authLoginSuccess } = useAuth();
  const [isSubmiting, setIsSubmiting] = useState(false);

  const initialFormData = {
    firstName: '',
    lastName: '',
    bio: '',
    email: '',
    password: '',
    passwordConfirm: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formData.password !== formData.passwordConfirm) {
      setErrorMsgs(['Password does not match password confirmation.']);
      return;
    }

    const { passwordConfirm, ...cleanForm } = formData;

    setIsSubmiting(true);

    const [result, message] = await Auth.registerUser(cleanForm);

    setIsSubmiting(false);
    
    if (result) {
      // Login
      const [resultLogin, status, messageLogin] = await Auth.loginUser(formData.email, formData.password);
      if (resultLogin) {
        setErrorMsgs([]);
        setFormData(initialFormData);
        
        const user = await Auth.getMe();
        authLoginSuccess(user);
        
        // Redirect to home
        navigate('/');
      }
      else {
        setErrorMsgs(messageLogin);
      }
    }
    else {
      // Show error
      if (message instanceof Array) {
        setErrorMsgs(message);
      }
      else {
        if (message.includes('duplicate key value')) {
          setErrorMsgs(['Email already exists. Please use a different email.']);
        }
        else {
          setErrorMsgs([message]);
        }
      }
    }
  };

  return (
    <Box
      sx={{
        bgcolor: (theme) =>
          theme.palette.mode === "dark" ? "background.default" : "grey.50",
        pt: 6,
        height: { sm: '100vh' }
      }}
    >
      <Container component="main" maxWidth="sm">
        <Box sx={{ display: "flex", mb: 4, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <SignInTop />
        </Box>
        <Card>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Stack direction='row' alignItems='center'>
                <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                  <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                  Sign up
                </Typography>
              </Stack>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      autoComplete="given-name"
                      name="firstName"
                      required
                      fullWidth
                      id="firstName"
                      label="First Name"
                      autoFocus
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.currentTarget.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="lastName"
                      label="Last Name"
                      name="lastName"
                      autoComplete="family-name"
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
                      minRows={2}
                      maxRows={4}
                      inputProps={{maxLength:'200'}}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.currentTarget.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      type='email'
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.currentTarget.value })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.currentTarget.value })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      required
                      fullWidth
                      name="passwordConfirm"
                      label="Password confirmation"
                      type="password"
                      id="passwordConfirm"
                      autoComplete="new-password"
                      value={formData.passwordConfirm}
                      onChange={(e) => setFormData({ ...formData, passwordConfirm: e.currentTarget.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Checkbox value="agreeTerms" required color="primary" />}
                      label="I agree with the terms of use."
                    />
                  </Grid>
                </Grid>
                {errorMsgs?.length ?
                  <Stack sx={{ width: "100%", mt: 2 }} spacing={2}>
                    {errorMsgs.map((errorMsg, i) => (<Alert key={i} severity="error"><span className='error-message'>{errorMsg}</span></Alert>))}
                  </Stack>
                  : ''}
                <Button
                  type="submit"
                  fullWidth
                  disabled={isSubmiting}
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Sign Up
                </Button>
                <Grid container justifyContent="flex-end">
                  <Grid item>
                    <Link href="/auth/signin" variant="body2">
                      Already have an account? Sign in
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Copyright sx={{ mt: 5, mb: 4 }} />
      </Container>
    </Box>
  );
}