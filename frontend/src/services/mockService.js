// import mock data
import currentUser from "../mock/currentUser.json";
import usersData from "../mock/users.json";
import clientsData from "../mock/clients.json";

// mock service functions
export async function fetchCurrentUser() {
  // Simulate an API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return currentUser;
}

export async function fetchUsers() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return usersData;
}

export async function fetchClients(userRole) {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve(
          userRole === "admin" ? clientsData.adminView : clientsData.userView,
        ),
      500,
    ),
  );
}
