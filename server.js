const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.static(__dirname + '/dist/midc'));

app.listen(process.env.PORT || 3000, () => {
    console.log('Server listening on port');
});

app.get('/midc/:application', (req,res)=> {
    const appName = req.params.application;
    const dcFilePath = './mappings/'+appName+'DC.json';
    const txnFilePath = './mappings/'+appName+'Txn.json';
    const dcFileExists = fs.existsSync(dcFilePath);
    const txnFileExists = fs.existsSync(txnFilePath);
    if(dcFileExists && txnFileExists) {
        const midcData = fs.readFileSync(dcFilePath, 
            {encoding:'utf8', flag:'r'});
            const parsedMidcData =  JSON.parse(midcData);
            let content = "";
            let header="DataGathererID"+"\t"+"Name"+"\t"+" attachToNewDiscoveredBTs"+"\t"+"enabledForApm"+"\t"+"enabledForAnalytics"+"\t"+"className"+"\t"+"methodName"+"\t"+"matchCondition"+"\t"+"midc"+"\t"+"txnNames"+"\n";
            content = content + header;
            for (const element of parsedMidcData) {
                if("pojo" == element["type"]) {
                    const id = element["id"];
                    const name = element["name"];
                    const attachToNewDiscoveredBTs = element["attachToNewDiscoveredBTs"];
                    const enabledForApm = element["enabledForApm"];
                    const enabledForAnalytics = element["enabledForAnalytics"];
                    const className =element["definition"]["className"];
                    const methodName = element["definition"]["methodName"];
        
                    const methodParameterTypes = element["definition"]["methodParameterTypes"];
                    const matchConditions = element["definition"]["matchConditions"];
                    let idx = 0;
                    let matchConditionString = "";
                    for (const matchConditionElements of matchConditions) {
                        let value = midcValue(matchConditionElements["methodDataGathererConfig"]["gathererType"], matchConditionElements["methodDataGathererConfig"]["position"], matchConditionElements["methodDataGathererConfig"]["objectDataTransformer"]["transformerType"], matchConditionElements["methodDataGathererConfig"]["objectDataTransformer"]["objectStateGetterMethods"]);
                        value = value + " " +matchConditionElements["match"]["matchType"] + " " + matchConditionElements["match"]["matchPattern"]
            
                        if(idx>0) {
                            matchConditionString = matchConditionString+";"+ value;
                        }
                        else {
                            matchConditionString = matchConditionString+ value;
                        }
                        idx++;
                        
                        //console.log(value);
                    }
                    //console.log("****\n"+matchConditionString)
                    const methodDataGathererConfigs = element["methodDataGathererConfigs"];
                    let midcString = ""
                    idx =0;
                    for (const midcElement of methodDataGathererConfigs) {
                        const midcName = midcElement["name"];
                        let value = midcValue(midcElement["gathererType"], midcElement["position"], midcElement["objectDataTransformer"]["transformerType"],midcElement["objectDataTransformer"]["objectStateGetterMethods"]);
                        
                        if(idx > 0) {
                            midcString = midcString+";"+ midcName+ " :: "+ value;
                        }  
                        else {
                            midcString = midcString+ midcName+ " :: "+ value;
                        }
                        idx++;
                    }
        
                    const txnData = fs.readFileSync(txnFilePath, 
                    {encoding:'utf8', flag:'r'});
                    const parsedTxnData =  JSON.parse(txnData);
                    let txnNames="";
                    
                    for(let txnElement of parsedTxnData) {
                        
                        let dataConfigIds = txnElement["dataGathererConfigIds"];
                        for(let configId of dataConfigIds) {
                            if (id == configId) {
                                if("" == txnNames) {
                                    txnNames = txnNames +txnElement["internalName"];
                                }
                                else {
                                    txnNames = txnNames + ";"+txnElement["internalName"];
                                }
                                break;
                            }
                            
                        }
                        
                    }
        
                    let row = id + "\t" +name + "\t" + attachToNewDiscoveredBTs+ "\t" + enabledForApm+ "\t" + enabledForAnalytics+ "\t" + className+ "\t" + methodName+ "\t" + matchConditionString+ "\t" + midcString +  "\t" + txnNames +"\n";
                    content = content + row;
                }
                
                
                
            }
            fs.appendFile('./output/'+appName+'MIDC.xls', content, (err) => {
                if (err) throw err;
                console.log('File created');
             });
            res.send(content);
    }
    else {
        if(!dcFileExists && !txnFileExists) {
            res.send(dcFilePath + " and "+ txnFilePath + " Not Found");
        }
        else if(!dcFileExists) {
            res.send(dcFilePath + " Not Found");
        }
        else if(!txnFileExists) {
            res.send(txnFilePath + " Not Found");
        }
        
    }

    
});


const midcValue = (gathererType, position, transformerType, objectStateGetterMethods) => {
    let value = "";
    if ("POSITION_GATHERER_TYPE" == gathererType) {
        value = value + "ParamIndex_"+position;
    }
    else if ("RETURN_VALUE_GATHERER_TYPE" == gathererType) {
       value = value + "ReturnValue"
    }
    else {
        value = value + "Invokedobject"
    }

    if ("GETTER_METHODS_OBJECT_DATA_TRANSFORMER_TYPE" == transformerType) {
        
        for(const transformerElements of objectStateGetterMethods) {
            value = value + "." + transformerElements
        }
    }
    else if ("TO_STRING_OBJECT_DATA_TRANSFORMER_TYPE" == transformerType) {
        value = value+".toString()";
    }
    
    return value;
};