var AWS = require("aws-sdk")
const awsRegion = "us-west-2"

const makeClient = () => {
    const options = {
        region: awsRegion,
    }
    if (process.env.AWS_SAM_LOCAL) {
        options.endpoint = "http://dynamodb:8000"
    }
    const docClient = new AWS.DynamoDB.DocumentClient(options)
    return docClient
}

function getDataFromDynamo(params) {
    return new Promise((resolve) => {
        const docClient = makeClient()
        docClient.get(params, function (err, data) {
            if (err) {
                console.log("Error: ", err)
            } else {
                console.log("Success: ", data.Item)
                resolve(data.Item)
            }
        })
    })
}

function putDataInDynamo(params) {
    return new Promise((resolve) => {
        const docClient = makeClient()
        docClient.put(params, function (err, data) {
            if (err) {
                console.log("Error: ", err)
            } else {
                console.log("Success: ", data)
                resolve(data)
            }
        })
    })
}

function queryDynamo(params) {
    return new Promise((resolve) => {
        const docClient = makeClient()
        docClient.query(params, function (err, data) {
            if (err) {
                console.log(err)
            } else {
                console.log("Success: ", data)
                resolve(data)
            }
        })
    })
}

/*
	One iteration of the scanTable function - see below.
*/
function scanDynamoIteration(params) {
    return new Promise((resolve) => {
        const docClient = makeClient()
        docClient.scan(params, function (err, data) {
            if (err) {
                console.log("Error when scanning table: ", err)
            } else {
                console.log("Successfully scanned table: ", data)
                resolve(data)
            }
        })
    })
}

/*
	AWS scans only 1MB of data at a time, before applying any filters. This scan
	wraps the logic of making scan calls until the entire table is scanned.

	Eventually this gets pretty inefficient, but I don't think it matters at this scale.
*/
async function scanDynamoTable(params) {
    var currentParams = params
    var scanItems = []
    var scannedAllItems = false

    do {
        console.log("Doing iteration with params " + currentParams)
        const scanIterationResult = await scanDynamoIteration(params)
        scanItems = scanItems.concat(scanIterationResult.Items)
        if (scanIterationResult.LastEvaluatedKey) {
            currentParams.ExclusiveStartKey =
                scanIterationResult.LastEvaluatedKey
        } else {
            scannedAllItems = true
        }
    } while (!scannedAllItems)

    return scanItems
}

function updateDataInDynamo(params) {
    return new Promise((resolve) => {
        const docClient = makeClient()
        docClient.update(params, function (err, data) {
            if (err) {
                console.log("Error updating request with error: ", err)
            } else {
                console.log("Success updating request with data: ", data)
                resolve(data)
            }
        })
    })
}

module.exports = {
    getDataFromDynamo: getDataFromDynamo,
    putDataInDynamo: putDataInDynamo,
    queryDynamo: queryDynamo,
    updateDataInDynamo: updateDataInDynamo,
    scanDynamoTable: scanDynamoTable,
}
