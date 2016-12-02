'use strict';

const hfc = require('hfc');
const hfcMember = hfc.Member;
const EventEmitter = require('events');
const Vehicle = require('./../../../../Server_Side/tools/utils/vehicle');
const Util = require('./../../../../Server_Side/tools/utils/util');
const SecurityContext = require('./../../../../Server_Side/tools/security/securitycontext');

const chai = require('chai');
const sinon = require('sinon');
chai.should();
const expect = chai.expect;
chai.use(require('chai-things'));

describe('./Server_Side/tools/utils/vehicle', () => {
    let sandbox;
    let securityContext;
    let securityContextList;
    let enrolledMember;

    before(() => {
    });

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        enrolledMember = sinon.createStubInstance(hfcMember);
        securityContext = new SecurityContext(enrolledMember);
        securityContext.setChaincodeID('chaincodeID');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('#Class', () => {
        it('should not be null', () => {
            let vehicle = new Vehicle();
            expect(vehicle).to.not.be.null;
        });

        it('should have a create function', () => {
            expect(Vehicle.create).to.not.be.null;
        });

        it('should have a transfer function', () => {
            expect(Vehicle.transfer).to.not.be.null;
        });

        it('should have an updateAttribute function', () => {
            expect(Vehicle.updateAttribute).to.not.be.null;
        });

        it('should have a doesV5cIDExist function', () => {
            expect(Vehicle.doesV5cIDExist).to.not.be.null;
        });

        it('should have a newV5cID function', () => {
            expect(Vehicle.newV5cID).to.not.be.null;
        });
    });

    describe('#create', () => {
        it('should trigger Util.invokeChaincode');
    });

    describe('#transfer', () => {

    });

    describe('#updateAttribute', () => {

    });

    describe('#doesV5cIDExist', () => {

    });

    describe('#newV5cID', () => {
        let v5cID = Vehicle.newV5cID();
        v5cID.should.not.be.null;
        expect(v5cID.length).to.equal(9);
    });
});
