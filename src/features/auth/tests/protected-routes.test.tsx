import { App } from "../../../App";
import { render, screen } from "../../../test-utils";

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
