const {
    scanDynamoTable,
    putDataInDynamo,
    getDataFromDynamo,
    updateDataInDynamo,
} = require("./util/dynamo-db")
const { v4: uuidv4 } = require("uuid")

const TABLE_NAME = "music-library-items"

const getSuccessResponse = (data) => {
    const body = data ? JSON.stringify(data) : "success!"
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        },
        body: body,
    }
}

/**
 * A Lambda function that returns a static string
 */
exports.getLibraryItems = async () => {
    var params = {
        TableName: TABLE_NAME,
    }

    var libraryData = await scanDynamoTable(params)

    const message = "Retrieving library items: " + JSON.stringify(libraryData)

    console.info(`${message}`)

    return getSuccessResponse(libraryData)
}

exports.createLibraryItem = async (data) => {
    console.log("Create library item with data: " + JSON.stringify(data))
    let item = JSON.parse(data.body)
    item.itemId = uuidv4()
    var params = {
        TableName: TABLE_NAME,
        Item: item,
    }

    var libraryData = await putDataInDynamo(params)

    console.info("Successfully put item in dynamo")

    return getSuccessResponse()
}

exports.patchLibraryItem = async (data) => {
    console.log("Patch library item with data: " + JSON.stringify(data))
    const requestBody = JSON.parse(data.body)
    const { updateExpression, expressionAttributeValues } = Object.keys(
        requestBody
    ).reduce(
        (acc, fieldName) => {
            acc.updateExpression += fieldName + " = " + ":" + fieldName + "V "
            acc.expressionAttributeValues[":" + fieldName + "V"] =
                requestBody[fieldName]
            return acc
        },
        {
            updateExpression: "set ",
            expressionAttributeValues: {},
        }
    )

    const itemId = data.pathParameters.itemId

    const params = {
        TableName: TABLE_NAME,
        Key: {
            itemId: data.pathParameters.itemId,
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
    }

    var libraryData = await updateDataInDynamo(params)

    return getSuccessResponse()
}

exports.getLibraryItem = async (data) => {
    console.log("Get library item: " + JSON.stringify(data))

    const params = {
        TableName: TABLE_NAME,
        Key: {
            itemId: data.pathParameters.itemId,
        },
    }

    var libraryData = await getDataFromDynamo(params)

    return getSuccessResponse(libraryData)
}
