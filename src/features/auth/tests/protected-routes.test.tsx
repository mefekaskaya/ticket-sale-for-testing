import userEvent from "@testing-library/user-event";
import {
  DefaultRequestBody,
  RequestParams,
  ResponseComposition,
  rest,
  RestContext,
  RestRequest,
} from "msw";

import { App } from "../../../App";
import { baseUrl, endpoints } from "../../../app/axios/constants";
import { handlers } from "../../../mocks/handlers";
import { server } from "../../../mocks/server";
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

const signInFailure = (
  req: RestRequest<DefaultRequestBody, RequestParams>,
  res: ResponseComposition,
  ctx: RestContext
) => res(ctx.status(401));

const signInServerFailure = (
  req: RestRequest<DefaultRequestBody, RequestParams>,
  res: ResponseComposition,
  ctx: RestContext
) => res(ctx.status(500));

const signUpServerFailure = (
  req: RestRequest<DefaultRequestBody, RequestParams>,
  res: ResponseComposition,
  ctx: RestContext
) => res(ctx.status(500));

const signUpFailure = (
  req: RestRequest<DefaultRequestBody, RequestParams>,
  res: ResponseComposition,
  ctx: RestContext
) => {
  return res(
    ctx.status(400),
    ctx.json({
      errorMessage: "email already in use",
    })
  );
};

test("unsuccessful sign in after successful sign in", async () => {
  const errorHandler = rest.post(
    `${baseUrl}/${endpoints.signIn}`,
    signInFailure
  );
  server.resetHandlers(...handlers, errorHandler);

  const { history } = render(<App />, { routeHistory: ["/tickets/1"] });
  const emailField = screen.getByLabelText(/email/i);
  const passwordField = screen.getByLabelText(/password/i);
  userEvent.type(emailField, "test@test.com");
  userEvent.type(passwordField, "iheartcheese");
  const form = screen.getByTestId("sign-in-form");
  const button = getByRole(form, "button", { name: /sign in/i });
  userEvent.click(button);

  server.resetHandlers();
  userEvent.click(button);
  await waitFor(() => {
    expect(history.location.pathname).toBe("/tickets/1"); // after clicking sign up or sign in, history change asynchronously and that's why we wait history.location.pathname to update after the call has been returned as positive
    expect(history.entries).toHaveLength(1);
  });
});

test("server sign up error followed by successful sign up", async () => {
  const errorHandler = rest.post(
    `${baseUrl}/${endpoints.signUp}`,
    signUpServerFailure
  );
  server.resetHandlers(...handlers, errorHandler);
  const { history } = render(<App />, { routeHistory: ["/tickets/1"] });
  const emailField = screen.getByLabelText(/email/i);
  const passwordField = screen.getByLabelText(/password/i);
  userEvent.type(emailField, "test@test.com");
  userEvent.type(passwordField, "iheartcheese");
  const form = screen.getByTestId("sign-in-form");
  const button = getByRole(form, "button", { name: /sign up/i });
  userEvent.click(button);

  server.resetHandlers();
  userEvent.click(button);
  await waitFor(() => {
    expect(history.location.pathname).toBe("/tickets/1");
    expect(history.entries).toHaveLength(1);
  });
});

test.each([
  {
    name: "sign in server",
    errorMethod: signInServerFailure,
    endpoint: endpoints.signIn,
    buttonName: /sign in/i,
  },
  {
    name: "sign in client",
    errorMethod: signInFailure,
    endpoint: endpoints.signIn,
    buttonName: /sign in/i,
  },
  {
    name: "sign up server",
    errorMethod: signUpServerFailure,
    endpoint: endpoints.signUp,
    buttonName: /sign up/i,
  },
  {
    name: "sign up cilent",
    errorMethod: signUpFailure,
    endpoint: endpoints.signUp,
    buttonName: /sign up/i,
  },
])(
  "$name error in request followed by success",
  async ({ buttonName, errorMethod, endpoint }) => {
    const errorHandler = rest.post(`${baseUrl}/${endpoint}`, errorMethod);
    server.resetHandlers(...handlers, errorHandler);
    const { history } = render(<App />, { routeHistory: ["/tickets/1"] });
    const emailField = screen.getByLabelText(/email/i);
    const passwordField = screen.getByLabelText(/password/i);
    userEvent.type(emailField, "test@test.com");
    userEvent.type(passwordField, "iheartcheese");
    const actionForm = screen.getByTestId("sign-in-form");
    const actionButton = getByRole(actionForm, "button", { name: buttonName });
    userEvent.click(actionButton);

    server.resetHandlers();
    userEvent.click(actionButton);
    await waitFor(() => {
      expect(history.location.pathname).toBe("/tickets/1");
      expect(history.entries).toHaveLength(1);
    });
  }
);
