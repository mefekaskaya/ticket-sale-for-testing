import { App } from "../../../App";
import { render, screen } from "../../../test-utils";

test("band page display band name for correct bandId", async () => {
  render(<App />, { routeHistory: ["/bands/0"] });
  const heading = await screen.findByRole("heading", {
    name: /Avalanche of Cheese/i,
  });
  expect(heading).toBeInTheDocument();
});
