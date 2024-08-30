export interface CreateUserDTO {
  ID: string,
  FULLNAME: string;
  email: string;
  position: string
}

export interface UpdateUserDTO {
  FULLNAME?: string;
  email?: string;
}
