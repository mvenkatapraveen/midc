# MIDC
MIDC Txn Mapping in AppDynamics

## Description
This application will generate an excel for Txn configured for MIDC.

## Prerequisites
Node, Javascript

Need to provide two input files:
midc.json(for specific application)
txn.json(select specific midc and click on configure txn to get txn json).
We can get these files from debugger mode.

To start the server
```sh
node server.js
```
This will generate an xls file in output folder.
