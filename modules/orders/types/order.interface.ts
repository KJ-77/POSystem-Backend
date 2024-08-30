import { RowDataPacket } from "mysql2";

export interface Order extends RowDataPacket {
    ID: number;
    order_name: string;
    order_desc: string;
    link: string;
    price_diff: boolean;
    order_status: string;
    worker_id: number;
    order_date: string;
    quantity: number;
    unit_price: string;
    total_price: string;
  }
  
  export interface User extends RowDataPacket {
    FULLNAME: string;
  }