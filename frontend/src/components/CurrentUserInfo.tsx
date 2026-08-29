import { User } from "../types/user";

type CurrentUserInfoProps = {
  user: User;
};

const CurrentUserInfo = ({ user }: CurrentUserInfoProps) => {
  return (
    <p className="text-sm text-gray-600 mt-1">
      {user.username} • {user.role}
    </p>
  );
};

export default CurrentUserInfo;
