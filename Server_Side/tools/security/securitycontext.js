'use strict';

class SecurityContext {

    constructor(enrolledMember) {
        this.enrolledMember = enrolledMember;
        this.chaincodeID = null;
    }

    getEnrolledMember() {
        return this.enrolledMember;
    }

    setChaincodeID(chaincodeID) {
        this.chaincodeID = chaincodeID;
    }

    getChaincodeID() {
        return this.chaincodeID;
    }
}
module.exports = SecurityContext;
