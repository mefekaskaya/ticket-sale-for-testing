import { App } from "../../../App";
import { render } from "../../../test-utils";

test("redirect to ticketShowId if seatCount is missng.", () => {
  const { history } = render(<App />, {
    // We needed to render app here instead of rendering the confirm component because the confirm component needs access to URL param in order to pass it along when we redirect.
    routeHistory: ["/confirm/0?holdId=12345"],
    // otherwise redirect to sign in
    preloadedState: {
      // We also need preloadedState because the confirm component is auth protected.
      user: { userDetails: { id: 1, email: "test@test.com" } },
    },
  });
  expect(history.location.pathname).toBe("/tickets/0"); // query params are in the current route, not the pushed route. Because the seatCount is missing, we expect to be redirected to ticktes and whatever the show id.
});
