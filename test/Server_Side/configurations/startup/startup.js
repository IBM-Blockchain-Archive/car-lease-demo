'use strict';

const hfc = require('hfc');
const hfcChain = hfc.Chain;
const hfcMember = hfc.Member;
const hfcEventHub = hfc.EventHub;
const EventEmitter = require('events');

const chai = require('chai');
const sinon = require('sinon');
chai.should();
const expect = chai.expect;
chai.use(require('chai-things'));

let config = require('./../../../../Server_Side/configurations/configuration').config;
let startup = require('./../../../../Server_Side/configurations/startup/startup');

const ca = {
    'c4d1ce242d714845893190e349bbdd3a-ca': {
        'discovery_host': 'localhost',
        'discovery_port': 7054
    }
};

const peers = [
    {
        'discovery_host': 'vp0',
        'discovery_port': 7051,
        'api_host': 'vp0',
        'api_port_tls': 7050,
        'api_port': 7050,
        'event_host': 'vp0',
        'event_port': 7053,
        'api_url': 'http://localhost:8080'
    },
    {
        'discovery_host': 'vp1',
        'discovery_port': 7051,
        'api_host': 'vp1',
        'api_port_tls': 7050,
        'api_port': 7050,
        'event_host': 'vp1',
        'event_port': 7053,
        'api_url': 'http://localhost:8080'
    }
];

describe('./Server_Side/configurations/startup/startup', () => {
    let sandbox;
    let mockHFC;
    let enrolledMember;

    before(() => {
    });

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        mockHFC = sandbox.stub(hfc);
        enrolledMember = sinon.createStubInstance(hfcMember);
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('#Module', () => {
        it('should not be null', () => {
            expect(startup).to.not.be.null;
        });

        it('should return 8 functions', () => {
            expect(Object.keys(startup).length).to.be.equal(8);
        });
    });

    describe('#connectToPeers', () => {
        it('should connect to 2 peers', () => {
            // Set up the hfc mock.
            let mockChain = sinon.createStubInstance(hfcChain);
            mockHFC.getChain.returns(mockChain);

            startup.connectToPeers(mockChain, peers);

            // Check for the correct interactions with hfc.
            sinon.assert.calledWith(mockChain.addPeer, config.hfcProtocol + '://' + peers[0].discovery_host + ':' + peers[0].discovery_port);
            sinon.assert.calledWith(mockChain.addPeer, config.hfcProtocol + '://' + peers[1].discovery_host + ':' + peers[1].discovery_port);
        });
    });

    describe('#connectToCS', () => {
        it('should connect to the member service', () => {
            // Set up the hfc mock.
            let mockChain = sinon.createStubInstance(hfcChain);
            mockHFC.getChain.returns(mockChain);

            startup.connectToCA(mockChain, ca);

            let actualCA = ca['c4d1ce242d714845893190e349bbdd3a-ca'];
            // Check for the correct interactions with hfc.
            sinon.assert.calledWith(mockChain.setMemberServicesUrl, config.hfcProtocol + '://' + actualCA.discovery_host + ':' + actualCA.discovery_port);
        });
    });

    describe('#connectToEventHub', () => {
        it('should connect to the event hub', () => {
            // Set up the hfc mock.
            let mockChain = sinon.createStubInstance(hfcChain);

            startup.connectToEventHub(mockChain, peers[0]);

            // Check for the correct interactions with hfc.
            sinon.assert.calledWith(mockChain.eventHubConnect, config.hfcProtocol + '://' + peers[0].event_host + ':' + peers[0].event_port);
        });
    });

    describe('#enrollRegistrar', () => {
        it('should enroll a registrar', () => {
            // Set up the hfc mock.
            let mockChain = sinon.createStubInstance(hfcChain);
            let mockMember = sinon.createStubInstance(hfcMember);
            let mockEventHub = sinon.createStubInstance(hfcEventHub);
            mockChain.enroll.callsArgWith(2, null, mockMember);
            mockChain.getEventHub.returns(mockEventHub);

            // Login to the Hyperledger Fabric using the mock hfc.
            let enrollmentID = 'doge';
            let enrollmentSecret = 'suchsecret';
            startup
                .enrollRegistrar(mockChain, 'doge', 'suchsecret')
                .then((registrar) => {
                    sinon.assert.calledOnce(mockChain.enroll);
                    sinon.assert.calledWith(mockChain.enroll, enrollmentID, enrollmentSecret);
                    registrar.should.not.be.null;
                    expect(registrar instanceof hfcMember).to.be.true;
                });
        });
    });

    describe('#enrollUser', () => {
        it('should enroll a new user', () => {
            // Set up the hfc mock.
            let mockChain = sinon.createStubInstance(hfcChain);
            let mockMember = sinon.createStubInstance(hfcMember);
            let mockEventHub = sinon.createStubInstance(hfcEventHub);
            mockChain.registerAndEnroll.callsArgWith(2, null, mockMember);
            mockChain.getEventHub.returns(mockEventHub);

            let user  = {
                'affiliation':'institution_a',
                'attributes':[
                    {
                        'name':'role',
                        'value':'regulator'
                    },
                    {
                        'name':'username',
                        'value':'DVLA'
                    }
                ],
                'enrollmentID':'DVLA',
                'registrar':{

                },
                'roles':[

                ]
            };

            startup
                .enrollUser(mockChain, user)
                .then((member) => {
                    sinon.assert.calledOnce(mockChain.registerAndEnroll);
                    sinon.assert.calledWith(mockChain.registerAndEnroll, user);
                    member.should.not.be.null;
                    expect(member instanceof hfcMember).to.be.true;
                });
        });
    });

    describe('#enrollUsers', () => {
        it('should enroll new users', () => {
            // Set up the hfc mock.
            let mockChain = sinon.createStubInstance(hfcChain);
            let mockMember = sinon.createStubInstance(hfcMember);
            let mockEventHub = sinon.createStubInstance(hfcEventHub);
            mockChain.registerAndEnroll.callsArgWith(2, null, mockMember);
            mockChain.getEventHub.returns(mockEventHub);

            let users  = [{
                'affiliation':'institution_a',
                'attributes':[
                    {
                        'name':'role',
                        'value':'regulator'
                    },
                    {
                        'name':'username',
                        'value':'DVLA'
                    }
                ],
                'enrollmentID':'DVLA',
                'registrar':{

                },
                'roles':[

                ]
            },
                {
                    'affiliation':'institution_a',
                    'attributes':[
                        {
                            'name':'role',
                            'value':'regulator'
                        },
                        {
                            'name':'username',
                            'value':'DVLA'
                        }
                    ],
                    'enrollmentID':'DVLA',
                    'registrar':{

                    },
                    'roles':[

                    ]
                }];

            startup.enrollUsers(mockChain, users)
            .then((members) => {
                sinon.assert.calledWith(mockChain.registerAndEnroll, users[0]);
                sinon.assert.calledWith(mockChain.registerAndEnroll, users[1]);
                members.should.not.be.null;
                expect(members instanceof Array).to.be.true;
                expect(members[0] instanceof hfcMember).to.be.true;
                expect(members[1] instanceof hfcMember).to.be.true;
            });
        });
    });

    describe('#deployChaincode', () => {
        it('should deploy chaincode', () => {
            enrolledMember.deploy.restore();
            sandbox.stub(enrolledMember, 'deploy', () => {
                let transactionContext = new EventEmitter();
                process.nextTick(() => transactionContext.emit('submitted'));
                process.nextTick(() => transactionContext.emit('complete', {chaincodeID: 'muchchaincodeID'}));
                return transactionContext;
            });

            startup.deployChaincode(enrolledMember, 'vehicle_code', 'Init', [], '/')
            .then((result) => {
                expect(result).to.equal({chaincodeID: 'muchchaincodeID'});
            });
        });
    });
});
