import { App } from "../../../App";
import { fireEvent, render, screen } from "../../../test-utils";
import { NavBar } from "./NavBar";

const testUser = {
  id: 1,
  email: "efekaskaya@gmail.com",
};

describe("sign-in button navigation", () => {
  test("clicking sign in button pushes sign in to history", async () => {
    const { history } = render(<NavBar />);
    const signInButton = screen.getByRole("button", { name: /Sign in/i });
    fireEvent.click(signInButton);
    expect(history.location.pathname).toBe("/signin");
  });

  test("clicking sign in button shows sign in page", () => {
    render(<App />);
    const signInButton = screen.getByRole("button", { name: /Sign in/i });
    fireEvent.click(signInButton);
    expect(
      screen.getByRole("heading", { name: /Sign in to your account/i })
    ).toBeInTheDocument();
  });
});

describe("displayed signed in / not signed in", () => {
  test("shows sign out button when user logged in", () => {
    render(<NavBar />, { preloadedState: { user: { userDetails: testUser } } });
    const signoutButton = screen.getByRole("button", { name: /Sign out/i });
    expect(signoutButton).toBeInTheDocument();
  });

  test("shows sign in button when user logged out", () => {
    render(<NavBar />);
    const signInButton = screen.getByRole("button", { name: /Sign in/i });
    expect(signInButton).toBeInTheDocument();
  });
});
