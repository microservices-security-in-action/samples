## Build Steps

1. Run the following command in this directory:
```
$ ./gradlew installDist
```

This creates the scripts `inventory-server` and `inventory-client`
in the `build/install/sample01/bin/` directory. The `inventory-server`
needs to be running before starting the client.

2. Execute the command below to run the inventory server.

```
$ ./build/install/sample01/bin/inventory-server
```

If you are using a Windows machine, execute the .bat process of the same.

```
$ ./build/install/sample01/bin/inventory-server.bat
```

3. Execute the command on a different terminal window to run the inventory client.

```
$ ./build/install/sample01/bin/inventory-client
```

If you are using a Windows machine, execute the .bat process of the same.

```
$ ./build/install/sample01/bin/inventory-client.bat
```

You should see the output of the inventory client on the terminal.