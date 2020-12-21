# GitHub Actions: Access server from host inside of a docker container

> What's the hardest thing you can do with Docker?
> Access the host machine!

With this example repo we do the impossible!

```
+----------------+
|                |
|     Server     |
|                |
|  0.0.0.0:3000  |  <----------------------+
|                |                         |
+----------------+                         |  fetch()
|                |                         |
|   Docker run   |           +-------------+-------------+
|                |           |                           |
+-------+--------+           |          Client           |
        |                    |                           |
        |                    |    (Docker Container)     |
        +---------------->   |                           |
                             +---------------------------+
```

## Usage

Simply run the CI. Good Luck!

If you want to test it locally:

```sh
yarn
yarn build
yarn start
```
