import axios from "axios";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { StaticProvider, throwError } from "redux-saga-test-plan/providers";

import {
  holdReservation,
  purchasePayload,
  purchaseReservation,
} from "../../../test-utils/fake-data";
import { showToast } from "../../toast/redux/toastSlice";
import {
  cancelPurchaseServerCall,
  releaseServerCall,
  reserveTicketServerCall,
} from "../api";
import { TicketAction } from "../types";
import {
  cancelTransaction,
  generateErrorToastOptions,
  purchaseTickets,
  ticketFlow,
} from "./ticketSaga";
import {
  endTransaction,
  resetTransaction,
  selectors,
  startTicketAbort,
  startTicketPurchase,
  startTicketRelease,
} from "./ticketSlice";

const holdAction = {
  type: "test",
  payload: holdReservation,
};

const networkProviders: Array<StaticProvider> = [
  [matchers.call.fn(reserveTicketServerCall), null],
  [matchers.call.fn(releaseServerCall), null],
  [matchers.call.fn(cancelPurchaseServerCall), null],
];

test("cancelTransaction cancels hold and resets transaction", () => {
  return expectSaga(cancelTransaction, holdReservation)
    .provide(networkProviders)
    .call(releaseServerCall, holdReservation)
    .put(resetTransaction())
    .run();
});

describe("common to all", () => {
  test("start with hold call to server", () => {
    return expectSaga(ticketFlow, holdAction)
      .provide([
        [
          matchers.call.like({
            fn: reserveTicketServerCall,
            args: [holdReservation],
          }),
          null,
        ],
        [matchers.call.fn(releaseServerCall), null],
      ])
      .dispatch(
        startTicketAbort({ reservation: holdReservation, reason: "Abort!" })
      )
      .run();
  });
  test("show error toast and clean up after server error", async () => {
    await expectSaga(ticketFlow, holdAction)
      .provide([
        [
          matchers.call.fn(reserveTicketServerCall),
          throwError(new Error("it did not work")),
        ],
        [
          matchers.select.selector(selectors.getTicketAction),
          TicketAction.hold,
        ],
        ...networkProviders,
      ])
      .put(
        showToast(
          generateErrorToastOptions("it did not work", TicketAction.hold)
        )
      )
      .call(cancelTransaction, holdReservation)
      .run();
  });
});

describe("purchase to all flow", () => {
  test("network error on purchase shows toast and cancels transaction", () => {
    return (
      expectSaga(ticketFlow, holdAction)
        .provide([
          [
            matchers.call.like({
              fn: reserveTicketServerCall,
              args: [purchaseReservation],
            }),
            throwError(new Error("it did not work")),
          ],
          [
            matchers.select.selector(selectors.getTicketAction),
            TicketAction.hold,
          ],
          ...networkProviders,
        ])
        .dispatch(startTicketPurchase(purchasePayload))
        // .call(purchaseTickets, purchasePayload)
        .call.fn(cancelPurchaseServerCall)
        .put(
          showToast(
            generateErrorToastOptions("it did not work", TicketAction.hold)
          )
        )
        .call(cancelTransaction, holdReservation)
        .run()
    );
  });
  test("abort call for purchase while call is running", () => {
    const cancelSource = axios.CancelToken.source();
    return expectSaga(purchaseTickets, purchasePayload, cancelSource)
      .provide([
        ...networkProviders,
        {
          race: () => ({ abort: true }),
        },
        // [
        //   race({
        //     purchaseResult: call(
        //       reserveTicketServerCall,
        //       purchaseReservation,
        //       cancelSource.token
        //     ),
        //     abort: take(startTicketAbort.type),
        //   }),
        //   { abort: true },
        // ],
      ])
      .dispatch(
        startTicketAbort({ reservation: holdReservation, reason: "Abort!" })
      )
      .call(cancelSource.cancel)
      .call(cancelPurchaseServerCall, purchaseReservation)
      .not.put(showToast({ title: "tickets purchased", status: "success" }))
      .put(showToast({ title: "purchase canceled", status: "warning" }))
      .call(cancelTransaction, holdReservation)
      .run();
  });
  test("successful purchase", () => {
    const cancelSource = axios.CancelToken.source();
    return expectSaga(purchaseTickets, purchasePayload, cancelSource)
      .provide(networkProviders)
      .call(reserveTicketServerCall, purchaseReservation, cancelSource.token)
      .call(releaseServerCall, holdReservation)
      .put(showToast({ title: "tickets purchased", status: "success" }))
      .put(endTransaction())
      .not.call.fn(cancelPurchaseServerCall)
      .not.call(cancelTransaction, holdReservation)
      .not.put(showToast({ title: "purchase cancelled", status: "warning" }))
      .run();
  });
});

describe("hold cancellation", () => {
  test.each([
    { name: "cancel", actionCreator: startTicketRelease },
    { name: "abort", actionCreator: startTicketAbort },
  ])(
    "cancels hold and resets ticket transaction on $name",
    ({ actionCreator }) => {
      return expectSaga(ticketFlow, holdAction)
        .provide(networkProviders)
        .call(reserveTicketServerCall, holdReservation)
        .dispatch(
          actionCreator({ reason: "Abort", reservation: holdReservation })
        )
        .put(showToast({ title: "Abort", status: "warning" }))
        .call(cancelTransaction, holdReservation)
        .run();
    }
  );
  // test("cancels hold and resets tickets transaction on cancel", () => {
  //   return expectSaga(ticketFlow, holdAction)
  //     .provide(networkProviders)
  //     .call(reserveTicketServerCall, holdReservation)
  //     .dispatch(
  //       startTicketRelease({ reservation: holdReservation, reason: "Cancel" })
  //     )
  //     .put(showToast({ title: "Cancel", status: "warning" }))
  //     .call(cancelTransaction, holdReservation)
  //     .run();
  // });
});
