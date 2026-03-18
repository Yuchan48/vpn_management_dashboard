const CurrentUserInfo = ({ user }) => {
  return (
    <p className="text-sm text-gray-600 mt-1">
      {user.username} • {user.role}
    </p>
  );
};

export default CurrentUserInfo;
