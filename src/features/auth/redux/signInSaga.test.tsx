// adapted from https://redux-saga.js.org/docs/advanced/NonBlockingCalls/
import { createMockTask } from "@redux-saga/testing-utils";
import { expectSaga, testSaga } from "redux-saga-test-plan"; // expectSaga is used for integration test and testSaga is used for unit test.
import * as matchers from "redux-saga-test-plan/matchers";
import { StaticProvider, throwError } from "redux-saga-test-plan/providers";

import { showToast } from "../../toast/redux/toastSlice";
import { authServerCall } from "../api";
import { LoggedInUser, SignInDetails } from "../types";
import {
  cancelSignIn,
  endSignIn,
  signIn,
  signInRequest,
  signOut,
  startSignIn,
} from "./authSlice";
import { authenticateUser, signInFlow } from "./signInSaga";

const signInRequestPayload: SignInDetails = {
  email: "efe@gmail.com",
  password: "123456",
  action: "signIn",
};

const signUpRequestPayload: SignInDetails = {
  email: "efe@gmail.com",
  password: "123456",
  action: "signUp",
};

const authServerResponse: LoggedInUser = {
  email: "efe@gmail.com",
  token: "12456",
  id: 123,
};

const networkProviders: StaticProvider[] = [
  [matchers.call.fn(authServerCall), authServerResponse],
];

const sleep = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

describe("signInFlow", () => {
  test("successful sign in", () => {
    return (
      expectSaga(signInFlow)
        .provide(networkProviders)
        .dispatch(signInRequest(signInRequestPayload))
        .fork(authenticateUser, signInRequestPayload)
        .put(startSignIn())
        .call(authServerCall, signInRequestPayload)
        // .call(authServerCall, signInRequestPayload)
        // .put.actionType(signIn.type)
        // Writing signIn.type is part of redux-toolkit that we can take an action creator and we take the type of property.
        // .put(signIn(authServerResponse))
        .put(signIn(authServerResponse))
        // .put.actionType(showToast.type)
        .put(
          showToast({
            title: `Signed in as ${authServerResponse.email}`,
            status: "info",
          })
        )
        .put(endSignIn())
        .silentRun(25)
    );
  });
  test("successfull sign up", () => {
    return expectSaga(signInFlow)
      .provide(networkProviders)
      .dispatch(signInRequest(signUpRequestPayload))
      .fork(authenticateUser, signUpRequestPayload)
      .put(startSignIn())
      .call(authServerCall, signUpRequestPayload)
      .put(signIn(authServerResponse))
      .put(
        showToast({
          title: `Signed in as ${authServerResponse.email}`,
          status: "info",
        })
      )
      .put(endSignIn())
      .silentRun(25);
  });
  test("cancelled sign-in", () => {
    return expectSaga(signInFlow)
      .provide({
        call: async (effect, next) => {
          if (effect.fn === authServerCall) {
            await sleep(500);
          }
          next();
        },
      })
      .dispatch(signInRequest(signInRequestPayload))
      .fork(authenticateUser, signInRequestPayload)
      .dispatch(cancelSignIn())
      .put(showToast({ title: "Sign in canceled", status: "warning" }))
      .put(signOut())
      .put(endSignIn())
      .silentRun(25);
  });
  test("sign-in error", () => {
    return (
      expectSaga(signInFlow)
        .provide([
          [
            matchers.call.fn(authServerCall),
            throwError(new Error("It did not work")),
          ],
        ])
        .dispatch(signInRequest(signInRequestPayload))
        .fork(authenticateUser, signInRequestPayload)
        // .dispatch(endSignIn())
        .put(startSignIn())
        .put(
          showToast({
            title: `Sign in failed: It did not work`,
            status: "warning",
          })
        )
        .put(endSignIn())
        .silentRun(25)
    );
  });
});

describe("unit tests for fork cancellation", () => {
  test("saga cancel flow", () => {
    const task = createMockTask();
    const saga = testSaga(signInFlow);
    saga.next().take(signInRequest.type);
    saga
      .next({ type: "test", payload: signInRequestPayload })
      .fork(authenticateUser, signInRequestPayload);
    saga.next(task).take([cancelSignIn.type, endSignIn.type]);
    saga.next(cancelSignIn()).cancel(task);
  });
  test("saga not cancel flow", () => {
    const saga = testSaga(signInFlow);
    saga.next().take(signInRequest.type);
    saga
      .next({ type: "test", payload: signInRequestPayload })
      .fork(authenticateUser, signInRequestPayload);
    saga.next().take([cancelSignIn.type, endSignIn.type]);
    saga.next(endSignIn()).take(signInRequest.type);
  });
});
