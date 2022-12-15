import { APIGatewayProxyHandler } from 'aws-lambda'
const awsServerlessExpress = require('aws-serverless-express');
const awsapp = require('./app');

/**
 * @type {import('http').Server}
 */
const server = awsServerlessExpress.createServer(awsapp);

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export const handler: APIGatewayProxyHandler = (event, context) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};
