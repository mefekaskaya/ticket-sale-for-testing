import { expectSaga } from "redux-saga-test-plan";

import { ToastOptions } from "../types";
import { logErrorToasts, sendToAnalytics } from "./LogErrorToastSaga";

const errorToastOptions: ToastOptions = {
  title: "It's time to panic",
  status: "error",
};

const errorToastAction = {
  type: "test",
  payload: errorToastOptions,
};

test("saga calls analytics when it receives error toast", () => {
  return expectSaga(logErrorToasts, errorToastAction)
    .call(sendToAnalytics, "It's time to panic")
    .run();
});

const infoToastOptions: ToastOptions = {
  title: "info is given",
  status: "info",
};

const infoToastAction = {
  type: "test",
  payload: infoToastOptions,
};

test("saga dos not call when it receives a toast other than error", () => {
  return expectSaga(logErrorToasts, infoToastAction)
    .not.call(sendToAnalytics, "info is given")
    .run();
});
