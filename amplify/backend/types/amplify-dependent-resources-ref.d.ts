export type AmplifyDependentResourcesAttributes = {
    "function": {
        "authfunction": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        },
        "registerfunction": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        }
    },
    "api": {
        "ecommercebackend": {
            "RootUrl": "string",
            "ApiName": "string",
            "ApiId": "string"
        }
    }
}