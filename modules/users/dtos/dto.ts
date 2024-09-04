export interface CreateUserDTO {
  FULLNAME: string;
  email: string;
  position: string
}

export interface UpdateUserDTO {
  FULLNAME?: string;
  email?: string;
}
