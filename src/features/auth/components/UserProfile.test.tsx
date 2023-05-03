import { App } from "../../../App";
import { logRoles, render, screen } from "../../../test-utils";
import { UserProfile } from "./UserProfile";

const testUser = {
  id: 1,
  email: "efekaskaya@gmail.com",
};

test("greets the user", () => {
  render(<UserProfile />, {
    preloadedState: { user: { userDetails: testUser } },
  });
  expect(screen.getByText(/hi, efekaskaya@gmail.com/i)).toBeInTheDocument();
});

test("redirect if user is falsy", () => {
  // If the user is falsy then it redirects us to sign in.
  render(<UserProfile />);
  expect(screen.queryByText(/hi/i)).not.toBeInTheDocument();
});

test("redirect to sign in if user undefined", () => {
  const { history } = render(<UserProfile />);
  expect(history.location.pathname).toBe("/signin");
});

test("view sign in page when loading profile page while not logged in", () => {
  render(<App />, { routeHistory: ["/profile"] });
  const header = screen.getByRole("heading", {
    name: /Sign in to your account/i,
  });
  logRoles(header);
  expect(header).toBeInTheDocument();
});
