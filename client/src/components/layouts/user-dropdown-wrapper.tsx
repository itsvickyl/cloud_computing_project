"use client";

import { UserType } from "@/types";
import UserDropdown from "./user-dropdown";

interface UserDropdownWrapperProps {
  email: string;
  name: string;
  image: string;
  type: UserType;
}

const UserDropdownWrapper = ({ email, name, image, type }: UserDropdownWrapperProps) => {
  return <UserDropdown email={email} name={name} image={image} userType={type} />;
};

export default UserDropdownWrapper;
