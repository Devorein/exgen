# `doc-example-generator`

Easily generate examples for your api using existing unit tests.

## Motivation

Writing examples of how to consume your api is crucial but its a difficult process. We need to make sure that the examples match the latest version of the api and at the same time it should be guaranteed that the examples are using tested code. If you have added unit tests for your api, then that itself can act as a source of documentation. Because when you write tests you are aware of the side-effects of the function, what the function returns or what it takes as arguments. Why not use that as part of your official documentation. By writing your tests in a certain way this library can automatically detect which functions need to be documented and how using your test assertions.

## Packages
