import userEvent from "@testing-library/user-event";

import { App } from "../../../App";
import { getByRole, render, screen, waitFor } from "../../../test-utils";

test.each([
  {
    routePath: "/profile",
    routeName: "Profile",
  },
  {
    routeName: "Tickets",
    routePath: "/tickets/0",
  },
  {
    routeName: "Confirm",
    routePath: "/confirm/0?holdId=12345&seatCount=2",
  },
])(
  "redirect to sign-in from $routeName when not authenticated",
  async ({ routePath }) => {
    render(<App />, { routeHistory: [routePath] });
    const heading = await screen.findByRole("heading", {
      name: /Sign in to your account/i,
    });
    expect(heading).toBeInTheDocument();
  }
);

test("successful sign-in flow", async () => {
  // go to protected page
  const { history } = render(<App />, { routeHistory: ["/tickets/1"] }); // If we break the test into arrange, act and assert parts, this line is arrange part. From finding emailField till clicking signInButton is act part. We wanna know we were redirected back to the original page, that we first went to.
  // sign in (after redirect)
  const emailField = screen.getByLabelText(/email/i);
  userEvent.type(emailField, "test@test.com");
  const passwordField = screen.getByLabelText(/password/i);
  userEvent.type(passwordField, "iheartcheese");
  const signInForm = screen.getByTestId("sign-in-form");
  const signInButton = getByRole(signInForm, "button", { name: /sign in/i }); // If we use getByRole imported directly and not as a method of screen, and that way we specify which element we want to search within as the first argument.
  userEvent.click(signInButton);
  await waitFor(() => {
    expect(history.location.pathname).toBe("/tickets/1");

    expect(history.entries).toHaveLength(1);
  });
});

test("successful sign--up flow", async () => {
  const { history } = render(<App />, { routeHistory: ["/tickets/1"] });
  const emailField = screen.getByLabelText(/email/i);
  const passwordField = screen.getByLabelText(/password/i);
  userEvent.type(emailField, "test@test.com");
  userEvent.type(passwordField, "iheartcheese");
  const signUpForm = screen.getByTestId("sign-in-form");
  const signUpButton = getByRole(signUpForm, "button", { name: /sign up/i });
  userEvent.click(signUpButton);
  await waitFor(() => {
    expect(history.location.pathname).toBe("/tickets/1");
    expect(history.entries).toHaveLength(1);
  });
});

test.each([
  {
    flowName: "sign-in",
    testId: "sign-in-form",
    buttonName: /sign in/i,
  },
  {
    flowName: "sign-up",
    testId: "sign-in-form",
    buttonName: /sign up/i,
  },
])("successful $flowName flow", async ({ testId, buttonName }) => {
  const { history } = render(<App />, { routeHistory: ["/tickets/1"] });
  const emailField = screen.getByLabelText(/email/i);
  const passwordField = screen.getByLabelText(/password/i);
  userEvent.type(emailField, "test@test.com");
  userEvent.type(passwordField, "iheartcheese");
  const form = screen.getByTestId(testId);
  const button = getByRole(form, "button", { name: buttonName });
  userEvent.click(button);
  await waitFor(() => {
    expect(history.location.pathname).toBe("/tickets/1");
    expect(history.entries).toHaveLength(1);
  });
});
