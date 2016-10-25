'use strict';

class SecurityContext {

    constructor(enrolledMember) {
        this.enrolledMember = enrolledMember;
    }

    getEnrolledMember() {
        return this.enrolledMember;
    }
}
module.exports = SecurityContext;
