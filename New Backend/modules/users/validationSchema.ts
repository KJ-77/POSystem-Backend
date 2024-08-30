import * as yup from 'yup';

export const createUserValidate = yup.object({
  FULLNAME: yup.string().required('Username is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  position: yup.string()
  .oneOf(['admin', 'authorizer', 'employee'], 'Invalid position')
  .required('Position is required'),
});

