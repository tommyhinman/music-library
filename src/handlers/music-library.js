const { scanDynamoTable, putDataInDynamo } = require("./util/dynamo-db")
const { v4: uuidv4 } = require("uuid")

/**
 * A Lambda function that returns a static string
 */
exports.getLibraryItems = async () => {
    var params = {
        TableName: "music-library-items",
    }

    var libraryData = await scanDynamoTable(params)

    const message = JSON.stringify(libraryData)

    // All log statements are written to CloudWatch
    console.info(`${message}`)

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        },
        body: JSON.stringify(libraryData),
    }
}

exports.createLibraryItem = async (data) => {
    console.log("Create library item with data: " + JSON.stringify(data))
    let item = JSON.parse(data.body)
    item.itemId = uuidv4()
    var params = {
        TableName: "music-library-items",
        Item: item,
    }

    var libraryData = await putDataInDynamo(params)

    console.info("Successfully put item in dynamo")

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        },
        body: "success!",
    }
}
