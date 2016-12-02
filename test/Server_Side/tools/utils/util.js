'use strict';

const hfc = require('hfc');
const hfcMember = hfc.Member;
const EventEmitter = require('events');
const Util = require('./../../../../Server_Side/tools/utils/util');
const SecurityContext = require('./../../../../Server_Side/tools/security/securitycontext');

const chai = require('chai');
const sinon = require('sinon');
chai.should();
const expect = chai.expect;
chai.use(require('chai-things'));

describe('./Server_Side/tools/utils/util', () => {
    let sandbox;
    let securityContext;
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

    describe('#Module', () => {
        it('should not be null', () => {
            let util = new Util();
            expect(util).to.not.be.null;
        });

        it('should have a queryChaincode function', () => {
            expect(Util.queryChaincode).to.not.be.null;
        });

        it('should have a invokeChaincode function', () => {
            expect(Util.invokeChaincode).to.not.be.null;
        });
    });

    describe('#queryChaincode', () => {
        it('should throw when no securityContext is provided', () => {
            (() => {
                Util.queryChaincode(null, 'functionName', []);
            }).should.throw(/securityContext not provided/);
        });
        it('should throw when no functionName is provided', () => {
            (() => {
                Util.queryChaincode(securityContext, null, []);
            }).should.throw(/functionName not provided/);
        }),
        it('should throw when no args are provided', () => {
            (() => {
                Util.queryChaincode(securityContext, 'functionName', null);
            }).should.throw(/args not provided/);
        });
        it('should throw when invalid arg is provided', () => {
            (() => {
                Util.queryChaincode(securityContext, 'functionName', [1]);
            }).should.throw('invalid arg specified 1 in [1]');
        });
        it('should return a JSON array when successful', () => {
            enrolledMember.query.restore();
            sandbox.stub(enrolledMember, 'query', () => {
                let transactionContext = new EventEmitter();
                process.nextTick(() => transactionContext.emit('submitted'));
                process.nextTick(() => transactionContext.emit('complete', {result: 'data'}));
                return transactionContext;
            });

            Util.queryChaincode(securityContext, 'functionName', [])
            .then((result) => {
                result.should.equal('data');
            });
        });
        it('should return a generic when not successful', () => {
            enrolledMember.query.restore();
            sandbox.stub(enrolledMember, 'query', () => {
                let transactionContext = new EventEmitter();
                process.nextTick(() => transactionContext.emit('submitted'));
                process.nextTick(() => transactionContext.emit('error', 'error'));
                return transactionContext;
            });

            Util.queryChaincode(securityContext, 'functionName', [])
            .then(() => {
                // Should not get here
            })
            .catch((err) => {
                err.should.equal('data');
            });
        });
    });

    it('should return an EventTransactionError when not successful', () => {
        enrolledMember.query.restore();
        sandbox.stub(enrolledMember, 'query', () => {
            let transactionContext = new EventEmitter();
            process.nextTick(() => transactionContext.emit('submitted'));
            process.nextTick(() => transactionContext.emit('error', new hfc.EventTransactionError()));
            return transactionContext;
        });

        Util.queryChaincode(securityContext, 'functionName', [])
        .then(() => {
            // Should not get here
        })
        .catch((err) => {
            expect(err instanceof hfc.EventTransactionError).to.be.true;
            expect(err.msg).to.equal('error');
        });
    });

    describe('#invokeChaincode', () => {
        it('should throw when no securityContext is provided', () => {
            (() => {
                Util.invokeChaincode(null, 'functionName', []);
            }).should.throw(/securityContext not provided/);
        });

        it('should throw when no functionName is provided', () => {
            (() => {
                Util.invokeChaincode(securityContext, null, []);
            }).should.throw(/functionName not provided/);
        }),

        it('should throw when no args are provided', () => {
            (() => {
                Util.invokeChaincode(securityContext, 'functionName', null);
            }).should.throw(/args not provided/);
        });

        it('should throw when invalid arg is provided', () => {
            (() => {
                Util.invokeChaincode(securityContext, 'functionName', [1]);
            }).should.throw('invalid arg specified 1 in [1]');
        });

        it('should return a JSON array when successful', () => {
            enrolledMember.invoke.restore();
            sandbox.stub(enrolledMember, 'invoke', () => {
                let transactionContext = new EventEmitter();
                process.nextTick(() => transactionContext.emit('submitted'));
                process.nextTick(() => transactionContext.emit('complete', {result: 'data'}));
                return transactionContext;
            });

            Util.invokeChaincode(securityContext, 'functionName', [])
            .then((result) => {
                result.should.equal('data');
            });
        });

        it('should return a generic when not successful', () => {
            enrolledMember.invoke.restore();
            sandbox.stub(enrolledMember, 'invoke', () => {
                let transactionContext = new EventEmitter();
                process.nextTick(() => transactionContext.emit('submitted'));
                process.nextTick(() => transactionContext.emit('error', 'error'));
                return transactionContext;
            });

            Util.invokeChaincode(securityContext, 'functionName', [])
            .then(() => {
                // Should not get here
            })
            .catch((err) => {
                err.should.equal('data');
            });
        });
    });

    it('should return an EventTransactionError when not successful', () => {
        enrolledMember.invoke.restore();
        sandbox.stub(enrolledMember, 'invoke', () => {
            let transactionContext = new EventEmitter();
            process.nextTick(() => transactionContext.emit('submitted'));
            process.nextTick(() => transactionContext.emit('error', new hfc.EventTransactionError('error')));
            return transactionContext;
        });

        Util.invokeChaincode(securityContext, 'functionName', [])
        .then(() => {
            // Should not get here
        })
        .catch((err) => {
            expect(err instanceof hfc.EventTransactionError).to.be.true;
            expect(err.msg).to.equal('error');
        });
    });
});
