import * as yup from 'yup';

export const orderSchema = yup.object({
  order_name: yup.string().required('Order name is required').max(255),
  order_desc: yup.string().nullable(),
  link: yup.string().nullable(),
  price_diff: yup.number().integer().min(0).max(1).required('Price difference is required'),
  order_status: yup.string().required('Order status is required').max(255),
  worker_id: yup.string().required('Worker ID is required'),
  order_date: yup.date().required('Order date is required'),
  quantity: yup.number().integer().positive().required('Quantity is required'),
  unit_price: yup.number().positive().required('Unit price is required'),
  total_price: yup.number().positive().required('Total price is required'),
});
