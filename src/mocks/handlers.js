import { rest } from "msw";

import { baseUrl, endpoints } from "../app/axios/constants";
import { bandUrl } from "../features/band/redux/bandApi";
import { showsUrl } from "../features/tickets/redux/showApi";
import { bands, shows } from "../test-utils/fake-data";

const authHnadler = (req, res, ctx) => {
  const { email } = req.body;
  return res(
    ctx.json({
      user: {
        id: "123",
        email,
        token: "abc123",
      },
    })
  );
};

export const handlers = [
  rest.get(showsUrl, (req, res, ctx) => {
    return res(ctx.json({ shows }));
  }),
  rest.get(`${bandUrl}/:bandId`, (req, res, ctx) => {
    const { bandId } = req.params;
    return res(ctx.json({ band: bands[bandId] }));
  }),
  rest.get(`${showsUrl}/:showId`, (req, res, ctx) => {
    const { showId } = req.params;
    return res(ctx.json({ show: shows[showId] }));
  }),
  rest.patch(`${showsUrl}/:showId/hold/:holdId`, (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  rest.post(`${baseUrl}/${endpoints.signIn}`, authHnadler), // We used baseUrl here because if we look at signIn function which authServerCall, it uses axiosInstance which gets an config object with a baseUrl property and value.
  rest.post(`${baseUrl}/${endpoints.signUp}`, authHnadler),
];
