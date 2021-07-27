# MIDC
MIDC(Data Collectors) and Txn Mapping in AppDynamics

## Description
This application is used for generating an excel with Txn configurations for MIDC.

## Prerequisites
Node, Javascript

Need to provide two input files:
<appName> + DC.json(for specific application)
<appName> + Txn.json(select specific midc and click on configure txn to get txn json).
These files can be obtained by doing the following:
1. Login to AppDynamics
2. Select Application  --> Configuration --> Instrumentation --> DataCollectors
3. Open Developer Tools in browser
4. Refresh the page
5. Copy the data collectors from response for specific request and create a DC json file 
6. Now select specific DC and click on Configure Txns for this DC
7. Copy the txn mappings from response for specific request and create a Txn json file 


To start the server
```sh
node server.js
```

Load the following in the browser
http://localhost:3000/midc/<appName>

This will generate an xls file with <appName>+MIDC.xls and Txn mappings in output folder.
