import { Link, Typography } from "@mui/material";
import logo from '/apple-touch-icon.png'; 

export const SignInTop = () => {
  return (
    <>
      <Typography component="h1" variant="h4" >
        <img src={logo} width="36" style={{ verticalAlign: 'text-top' }} /> SPDS
      </Typography>
      <Typography component="h1" variant="body2" sx={{ textAlign: 'center', color: '#666' }}>
        Secure and Privacy-Preserving Data Sharing<br />for Data Science Computations
      </Typography>
    </>
  );
};

export function Copyright(props: any) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" sx={props?.sx}>
      &copy; {new Date().getFullYear()} {props?.hideAppName ? null : `SPDS - `}
      <Link
        title='University of Colorado - Colorado Springs'
        color="inherit"
        sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        target='_blank'
        href="https://uccs.edu">
        UCCS
      </Link>{' - '}
      All rights reserved.
    </Typography>
  );
}

export const EntityLink: React.CSSProperties = {
  color: 'inherit',
  textDecorationStyle: 'dotted'
};
