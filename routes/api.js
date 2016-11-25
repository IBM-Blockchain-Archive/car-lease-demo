'use strict';
let app = require('express');

let Router = app.Router();

//Our own modules
let blocks             = require(__dirname+'/../Server_Side/blockchain/blocks/blocks.js');
let block             = require(__dirname+'/../Server_Side/blockchain/blocks/block/block.js');
let participants     = require(__dirname+'/../Server_Side/blockchain/participants/participants.js');
let identity          = require(__dirname+'/../Server_Side/admin/identity/identity.js');
let vehicles         = require(__dirname+'/../Server_Side/blockchain/assets/vehicles/vehicles.js');
let vehicle          = require(__dirname+'/../Server_Side/blockchain/assets/vehicles/vehicle/vehicle.js');
let demo              = require(__dirname+'/../Server_Side/admin/demo/demo.js');
let chaincode          = require(__dirname+'/../Server_Side/blockchain/chaincode/chaincode.js');
let transactions     = require(__dirname+'/../Server_Side/blockchain/transactions/transactions.js');

module.exports = function(usersToSecurityContext) {
//===============================================================================================
//    Routing
//===============================================================================================

//-----------------------------------------------------------------------------------------------
//    Admin - Identity
//-----------------------------------------------------------------------------------------------
    Router.post('/admin/identity', function(req, res, next)     //Sets the session user to have the account address for the page they are currently on
    {
        identity.create(req, res, usersToSecurityContext);
    });

//-----------------------------------------------------------------------------------------------
//    Admin - Demo
//-----------------------------------------------------------------------------------------------

    Router.post('/admin/demo', function(req, res, next)
    {
        demo.create(req, res, next, usersToSecurityContext);
    });

    Router.get('/admin/demo', function(req, res, next)
    {
        demo.read(req, res, next, usersToSecurityContext);
    });

//-----------------------------------------------------------------------------------------------
//    Blockchain - chaincode
//-----------------------------------------------------------------------------------------------
    Router.post('/blockchain/chaincode/vehicles', function(req, res,next){
        chaincode.vehicles.create(req, res,next,usersToSecurityContext);
    });

//-----------------------------------------------------------------------------------------------
//    Blockchain - Blocks8d55b8daf0
//-----------------------------------------------------------------------------------------------
    Router.get('/blockchain/blocks', function(req, res,next){
        blocks.read(req, res,next,usersToSecurityContext);
    });

    Router.get('/blockchain/blocks/:blockNum(\\d+)', function(req, res, next){
        block.read(req, res, next, usersToSecurityContext);
    });

//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles
//-----------------------------------------------------------------------------------------------
    Router.post('/blockchain/assets/vehicles' , function(req,res,next)
    {
        vehicles.create(req,res,next,usersToSecurityContext);
    });

    Router.get('/blockchain/assets/vehicles' , function(req,res, next)
    {
        vehicles.read(req,res,next,usersToSecurityContext);
    });

//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles - Vehicle
//-----------------------------------------------------------------------------------------------

    Router.get('/blockchain/assets/vehicles/:v5cID' , function(req,res,next)
    {
        vehicle.read(req,res,next,usersToSecurityContext);
    });

//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles - Vehicle - Owner
//-----------------------------------------------------------------------------------------------
    Router.get('/blockchain/assets/vehicles/:v5cID/owner' , function(req,res,next)
    {
        vehicle.owner.read(req,res,next,usersToSecurityContext);
    });

    Router.put('/blockchain/assets/vehicles/:v5cID/owner' , function(req,res,next)
    {
        vehicle.owner.update(req,res,next,usersToSecurityContext);
    });

//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles - Vehicle - VIN
//-----------------------------------------------------------------------------------------------
    Router.get('/blockchain/assets/vehicles/:v5cID/VIN' , function(req,res,next)
    {
        vehicle.VIN.read(req,res,next,usersToSecurityContext);
    });

    Router.put('/blockchain/assets/vehicles/:v5cID/VIN' , function(req,res,next)
    {
        vehicle.VIN.update(req,res,next,usersToSecurityContext);
    });

//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles - Vehicle - Colour
//-----------------------------------------------------------------------------------------------
    Router.get('/blockchain/assets/vehicles/:v5cID/colour' , function(req,res,next)
    {
        vehicle.colour.read(req,res,next,usersToSecurityContext);
    });

    Router.put('/blockchain/assets/vehicles/:v5cID/colour' , function(req,res,next)
    {
        vehicle.colour.update(req,res,next,usersToSecurityContext);
    });


//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles - Vehicle - Make
//-----------------------------------------------------------------------------------------------
    Router.get('/blockchain/assets/vehicles/:v5cID/make' , function(req,res,next)
    {
        vehicle.make.read(req,res,next,usersToSecurityContext);
    });

    Router.put('/blockchain/assets/vehicles/:v5cID/make' , function(req,res,next)
    {
        vehicle.make.update(req,res,next,usersToSecurityContext);
    });

//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles - Vehicle - Model
//-----------------------------------------------------------------------------------------------
    Router.get('/blockchain/assets/vehicles/:v5cID/model' , function(req,res,next)
    {
        vehicle.model.read(req,res,next,usersToSecurityContext);
    });

    Router.put('/blockchain/assets/vehicles/:v5cID/model' , function(req,res,next)
    {
        vehicle.model.update(req,res,next,usersToSecurityContext);
    });

//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles - Vehicle - Reg
//-----------------------------------------------------------------------------------------------
    Router.get('/blockchain/assets/vehicles/:v5cID/reg' , function(req,res,next)
    {
        vehicle.reg.read(req,res,next,usersToSecurityContext);
    });

    Router.put('/blockchain/assets/vehicles/:v5cID/reg' , function(req,res,next)
    {

        vehicle.reg.update(req,res,next,usersToSecurityContext);
    });

//-----------------------------------------------------------------------------------------------
//    Blockchain - Assets - Vehicles - Vehicle - ScrRoutered
//-----------------------------------------------------------------------------------------------
    Router.delete('/blockchain/assets/vehicles/:v5cID' , function(req,res,next)
    {
        vehicle.delete(req,res,next,usersToSecurityContext);
    });

    Router.get('/blockchain/assets/vehicles/:v5cID/scrap' , function(req,res,next)
    {
        vehicle.scrRoutered.read(req,res,next,usersToSecurityContext);
    });

//-----------------------------------------------------------------------------------------------
//    Blockchain - Participants
//-----------------------------------------------------------------------------------------------
    Router.post('/blockchain/participants', function(req,res,next){
        participants.create(req, res,next,usersToSecurityContext);
    });

    Router.get('/blockchain/participants', function(req,res,next){
        participants.read(req,res,next,usersToSecurityContext);
    });

    Router.get('/blockchain/participants/regulators', function(req, res,next){
        participants.regulators.read(req,res,next,usersToSecurityContext);
    });

    Router.get('/blockchain/participants/manufacturers', function(req, res,next){
        participants.manufacturers.read(req,res,next,usersToSecurityContext);
    });

    Router.get('/blockchain/participants/dealerships', function(req, res,next){
        participants.dealerships.read(req,res,next,usersToSecurityContext);
    });

    Router.get('/blockchain/participants/lease_companies', function(req, res,next){
        participants.lease_companies.read(req,res,next,usersToSecurityContext);
    });

    Router.get('/blockchain/participants/leasees', function(req, res,next){
        participants.leasees.read(req,res,next,usersToSecurityContext);
    });

    Router.get('/blockchain/participants/scrap_merchants', function(req, res,next){
        participants.scrap_merchants.read(req,res,next,usersToSecurityContext);
    });


//-----------------------------------------------------------------------------------------------
//    Blockchain - Transactions
//------------------------chain.setDeployWaitTime(100);-----------------------------------------------------------------------
    Router.get('/blockchain/transactions', function(req, res,next){
        transactions.read(req, res,next,usersToSecurityContext);
    });

    return Router;
};
