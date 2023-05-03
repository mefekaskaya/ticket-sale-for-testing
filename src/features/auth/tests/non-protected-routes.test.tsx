import { App } from "../../../App";
import { render, screen } from "../../../test-utils";

test.each([
  {
    routeName: "Home",
    routePath: "/",
    headingMatch: /welcome/i,
  },
  {
    routeName: "Band 1",
    routePath: "/bands/1",
    headingMatch: /joyous/i,
  },
  {
    routeName: "Shows",
    routePath: "/shows",
    headingMatch: /upcoming shows/i,
  },
])(
  "$routeName page does not redirect to the login screen",
  async ({ routePath, headingMatch }) => {
    //   render(<App />); // don't need to specify the route because just rendering App lands us on the home page. But we need to specify if we use test.each for parametrization.
    render(<App />, { routeHistory: [routePath] });
    const heading = await screen.findByRole("heading", {
      // That data is not going to show on the screen until the mock server call has resolved, until the network call has been resolved by mock server worker.
      name: headingMatch,
    });
    expect(heading).toBeInTheDocument();
  }
);
