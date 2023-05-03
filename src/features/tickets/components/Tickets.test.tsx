import { App } from "../../../App";
import { fireEvent, render, screen } from "../../../test-utils";

test("route with url param", async () => {
  render(<App />, {
    routeHistory: ["/tickets/0"],
    preloadedState: {
      user: { userDetails: { id: 1, email: "efe@gmail.com" } },
    },
  });
  const heading = await screen.findByRole("heading", {
    name: "308 seats left",
  });
  expect(heading).toBeInTheDocument();
});

test("'purchase button pushes the correct url", async () => {
  const { history } = render(<App />, {
    routeHistory: ["/tickets/0"],
    preloadedState: {
      user: { userDetails: { id: 1, email: "efe@gmail.com" } },
    },
  });
  const purchaaseButton = await screen.findByRole("button", {
    // show data comes from the server, async rendering.
    name: "purchase",
  });
  fireEvent.click(purchaaseButton);
  expect(history.location.pathname).toBe("/confirm/0");
  const searchRegex = expect.stringMatching(/holdId=\d+&seatCount=2/);
  expect(history.location.search).toEqual(searchRegex);
});
