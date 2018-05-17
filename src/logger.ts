var winston = require('winston');
require('winston-loggly-bulk');

winston.add(winston.transports.Loggly, {
  token: process.env.LOGGLY_TOKEN,
  subdomain: process.env.LOGGLY_SUBDOMAIN,
  tags: ["Winston-NodeJS"],
  json: true
});

export function logInfo(...message: any[]) {
  winston.log('info', message.join(" "));
  console.log('info', message.join(" "))
};

export function logError(...err: any[]) {
  winston.error('error', err.join(" "));
  console.error('error', err.join(" "));
}