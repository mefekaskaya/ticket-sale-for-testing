/*
    It is chosen because it is easy to use and it is easy to mock functions in our saga.
    There are two types of testing that we can do with redux-saga-test-plan.
    Integration Testing
        We run the saga as a whole.
        We assert on the effects. For example put or call that were triggered or not triggered when the saga was run.
        There are all sorts of features to integration testing, including that provide call for mocking that can be done with integration and not unit testing. We can also assert on partial matchers. There is generally suppport for tests that are flexible and easy to write.
    Unit Testing
        Instead of running saga as a whole, we run it step by step.
        Real advantage of unit testing is that we can assert on the order of the effects that were called. We can't do that with integration testing.
        However, we don't get some of those features that we get with integration testing.
    Integration tests are opinionatedly so much easier to use. There are some tests are not possible in integration testing, including canceling a fork.
    The only reasons to use unit testing are if particular feature is not possible in integration testing or because the order really matters. Let's say we have one path through a saga that calls effect A first and effect B. Another path through the saga that calls effect B first and then effect A. Then we probably want to use to make sure that we are going through the correct path. Not that effect A and effect B called in general but that they are called in the ordered in which they are supposed to be.
*/
