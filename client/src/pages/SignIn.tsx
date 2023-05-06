import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Copyright, SignInTop } from '../components/Common';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { Alert, Avatar, Card, CardContent, Stack, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Auth from '../api/auth/auth';

export default function SignIn() {
  const [errorMsgs, setErrorMsgs] = useState([] as string[]);
  const navigate = useNavigate();
  const { authLoginSuccess } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    const email = data.get('email')?.toString() ?? '';
    const password = data.get('password')?.toString() ?? '';

    const [result, status, message] = await Auth.loginUser(email, password);
    
    if (result) {
      setErrorMsgs([]);
      form.reset();

      const user = await Auth.getMe();
      authLoginSuccess(user);
      
      // Redirect to home
      navigate('/');
    }
    else {
      // Show error
      if (status == 404) {
        setErrorMsgs([`User email or password incorrect.`]);
      }
      else {
        setErrorMsgs([message]);
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
      <Container component="main" maxWidth="xs">
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
                  Sign in
                </Typography>
              </Stack>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  type='email'
                  autoComplete="email"
                  autoFocus
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                />
                {errorMsgs?.length ?
                  <Stack sx={{ width: "100%", mt: 2 }} spacing={2}>
                    {errorMsgs.map((errorMsg, i) => (<Alert key={i} severity="error"><span className='error-message'>{errorMsg}</span></Alert>))}
                  </Stack>
                  : ''}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Sign In
                </Button>
                <Grid container>
                  <Grid item xs>
                    <Link href="/auth/forgot-password" variant="body2">
                      Forgot password?
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link href="/auth/signup" variant="body2">
                      {"Don't have an account? Sign Up"}
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