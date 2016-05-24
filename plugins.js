
'use strict';

const Bell          = require('bell');
const Good          = require('good');
const GoodConsole   = require('good-console');
const HapiAuthJWT   = require('hapi-auth-jwt2');
const Inert         = require('inert');
const Lout          = require('lout');
const Vision        = require('vision');

module.exports = [
    Vision, Inert,
    {
        register: Bell
    },
    {
        register: Good,
        options: {
            reporters: [{
                reporter: GoodConsole,
                events: {
                    response: '*',
                    log: '*'
                }
            }]
        }
    },
    {
        register: HapiAuthJWT
    },
    {
        register: Lout,
        options: {
            endpoint: 'docs',
            apiVersion: '1.0'
        }
    }
];
