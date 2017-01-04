import * as crypto from "./crypto";
import events = require('events');
/**
 * The KeyValStore interface used for persistent storage.
 */
export interface KeyValStore {
    /**
     * Get the value associated with name.
     * @param name
     * @param cb function(err,value)
     */
    getValue(name: string, cb: GetValueCallback): void;
    /**
     * Set the value associated with name.
     * @param name
     * @param cb function(err)
     */
    setValue(name: string, value: string, cb: ErrorCallback): any;
}
export interface MemberServices {
    /**
     * Get the security level
     * @returns The security level
     */
    getSecurityLevel(): number;
    /**
     * Set the security level
     * @params securityLevel The security level
     */
    setSecurityLevel(securityLevel: number): void;
    /**
     * Get the hash algorithm
     * @returns The security level
     */
    getHashAlgorithm(): string;
    /**
     * Set the security level
     * @params securityLevel The security level
     */
    setHashAlgorithm(hashAlgorithm: string): void;
    /**
     * Register the member and return an enrollment secret.
     * @param req Registration request with the following fields: name, role
     * @param registrar The identity of the registar (i.e. who is performing the registration)
     * @param cb Callback of the form: {function(err,enrollmentSecret)}
     */
    register(req: RegistrationRequest, registrar: Member, cb: RegisterCallback): void;
    /**
     * Enroll the member and return an opaque member object
     * @param req Enrollment request with the following fields: name, enrollmentSecret
     * @param cb Callback to report an error if it occurs.
     */
    enroll(req: EnrollmentRequest, cb: EnrollCallback): void;
    /**
     * Get an array of transaction certificates (tcerts).
     * @param req A GetTCertBatchRequest
     * @param cb A GetTCertBatchCallback
     */
    getTCertBatch(req: GetTCertBatchRequest, cb: GetTCertBatchCallback): void;
}
/**
 * A registration request is information required to register a user, peer, or other
 * type of member.
 */
export interface RegistrationRequest {
    enrollmentID: string;
    roles?: string[];
    affiliation: string;
    attributes?: Attribute[];
    registrar?: {
        roles: string[];
        delegateRoles?: string[];
    };
}
export interface Attribute {
    name: string;
    value: string;
}
export interface EnrollmentRequest {
    enrollmentID: string;
    enrollmentSecret: string;
}
export interface GetMemberCallback {
    (err: Error, member?: Member): void;
}
export interface RegisterCallback {
    (err: Error, enrollmentPassword?: string): void;
}
export interface EnrollCallback {
    (err: Error, enrollment?: Enrollment): void;
}
export interface DeployTransactionCallback {
    (err: Error, deployTx?: Transaction): void;
}
export interface InvokeOrQueryTransactionCallback {
    (err: Error, invokeOrQueryTx?: Transaction): void;
}
export interface Enrollment {
    key: Buffer;
    cert: string;
    chainKey: string;
}
export interface GRPCOptions {
    pem: string;
    hostnameOverride: string;
}
export declare class GetTCertBatchRequest {
    name: string;
    enrollment: Enrollment;
    num: number;
    attrs: string[];
    constructor(name: string, enrollment: Enrollment, num: number, attrs: string[]);
}
export declare class EventDeploySubmitted {
    uuid: string;
    chaincodeID: string;
    constructor(uuid: string, chaincodeID: string);
}
export declare class EventDeployComplete {
    uuid: string;
    chaincodeID: string;
    result: any;
    constructor(uuid: string, chaincodeID: string, result?: any);
}
export declare class EventInvokeSubmitted {
    uuid: string;
    constructor(uuid: string);
}
export declare class EventInvokeComplete {
    result: any;
    constructor(result?: any);
}
export declare class EventQueryComplete {
    result: any;
    constructor(result?: any);
}
export declare class EventTransactionError {
    error: any;
    msg: string;
    constructor(error: any);
}
export interface SubmittedTransactionResponse {
    uuid: string;
}
export interface GetTCertBatchCallback {
    (err: Error, tcerts?: TCert[]): void;
}
export interface GetTCertCallback {
    (err: Error, tcert?: TCert): void;
}
export interface GetTCertCallback {
    (err: Error, tcert?: TCert): void;
}
export declare enum PrivacyLevel {
    Nominal = 0,
    Anonymous = 1,
}
export declare class Certificate {
    cert: Buffer;
    privateKey: any;
    /** Denoting if the Certificate is anonymous or carrying its owner's identity. */
    privLevel: PrivacyLevel;
    constructor(cert: Buffer, privateKey: any, 
        /** Denoting if the Certificate is anonymous or carrying its owner's identity. */
        privLevel?: PrivacyLevel);
    encode(): Buffer;
}
/**
 * Transaction certificate.
 */
export declare class TCert extends Certificate {
    publicKey: any;
    privateKey: any;
    constructor(publicKey: any, privateKey: any);
}
/**
 * A base transaction request common for DeployRequest, InvokeRequest, and QueryRequest.
 */
export interface TransactionRequest {
    chaincodeID: string;
    fcn: string;
    args: string[];
    confidential?: boolean;
    userCert?: Certificate;
    metadata?: Buffer;
}
/**
 * Deploy request.
 */
export interface DeployRequest extends TransactionRequest {
    chaincodePath: string;
    chaincodeName: string;
    certificatePath: string;
}
/**
 * Invoke or query request.
 */
export interface InvokeOrQueryRequest extends TransactionRequest {
    attrs?: string[];
}
/**
 * Query request.
 */
export interface QueryRequest extends InvokeOrQueryRequest {
}
/**
 * Invoke request.
 */
export interface InvokeRequest extends InvokeOrQueryRequest {
}
/**
 * A transaction.
 */
export interface TransactionProtobuf {
    getType(): string;
    setCert(cert: Buffer): void;
    setSignature(sig: Buffer): void;
    setConfidentialityLevel(value: number): void;
    getConfidentialityLevel(): number;
    setConfidentialityProtocolVersion(version: string): void;
    setNonce(nonce: Buffer): void;
    setToValidators(Buffer: any): void;
    getTxid(): string;
    getChaincodeID(): {
        buffer: Buffer;
    };
    setChaincodeID(buffer: Buffer): void;
    getMetadata(): {
        buffer: Buffer;
    };
    setMetadata(buffer: Buffer): void;
    getPayload(): {
        buffer: Buffer;
    };
    setPayload(buffer: Buffer): void;
    toBuffer(): Buffer;
}
export declare class Transaction {
    pb: TransactionProtobuf;
    chaincodeID: string;
    constructor(pb: TransactionProtobuf, chaincodeID: string);
}
/**
 * Common error callback.
 */
export interface ErrorCallback {
    (err: Error): void;
}
/**
 * A callback for the KeyValStore.getValue method.
 */
export interface GetValueCallback {
    (err: Error, value?: string): void;
}
/**
 * The class representing a chain with which the client SDK interacts.
 */
export declare class Chain {
    private name;
    private peers;
    private securityEnabled;
    private members;
    private tcertBatchSize;
    private registrar;
    private memberServices;
    private eventHub;
    private keyValStore;
    private devMode;
    private preFetchMode;
    private deployWaitTime;
    private invokeWaitTime;
    cryptoPrimitives: crypto.Crypto;
    constructor(name: string);
    /**
     * Get the chain name.
     * @returns The name of the chain.
     */
    getName(): string;
    /**
     * Add a peer given an endpoint specification.
     * @param url The URL of the peer.
     * @param opts Optional GRPC options.
     * @returns {Peer} Returns a new peer.
     */
    addPeer(url: string, opts?: GRPCOptions): Peer;
    /**
     * Get the peers for this chain.
     */
    getPeers(): Peer[];
    /**
     * Get the member whose credentials are used to register and enroll other users, or undefined if not set.
     * @param {Member} The member whose credentials are used to perform registration, or undefined if not set.
     */
    getRegistrar(): Member;
    /**
     * Set the member whose credentials are used to register and enroll other users.
     * @param {Member} registrar The member whose credentials are used to perform registration.
     */
    setRegistrar(registrar: Member): void;
    /**
     * Set the member services URL
     * @param {string} url Member services URL of the form: "grpc://host:port" or "grpcs://host:port"
     * @param {GRPCOptions} opts optional GRPC options
     */
    setMemberServicesUrl(url: string, opts?: GRPCOptions): void;
    /**
     * Get the member service associated this chain.
     * @returns {MemberService} Return the current member service, or undefined if not set.
     */
    getMemberServices(): MemberServices;
    /**
     * Set the member service associated this chain.  This allows the default implementation of member service to be overridden.
     */
    setMemberServices(memberServices: MemberServices): void;
    /**
     * Get the eventHub service associated this chain.
     * @returns {eventHub} Return the current eventHub service, or undefined if not set.
     */
    getEventHub(): EventHub;
    /**
     * Set and connect to the peer to be used as the event source.
     */
    eventHubConnect(peerUrl: string, opts?: GRPCOptions): void;
    /**
     * Set and connect to the peer to be used as the event source.
     */
    eventHubDisconnect(): void;
    /**
     * Determine if security is enabled.
     */
    isSecurityEnabled(): boolean;
    /**
     * Determine if pre-fetch mode is enabled to prefetch tcerts.
     */
    isPreFetchMode(): boolean;
    /**
     * Set prefetch mode to true or false.
     */
    setPreFetchMode(preFetchMode: boolean): void;
    /**
     * Enable or disable ECDSA mode for GRPC.
     */
    setECDSAModeForGRPC(enabled: boolean): void;
    /**
     * Determine if dev mode is enabled.
     */
    isDevMode(): boolean;
    /**
     * Set dev mode to true or false.
     */
    setDevMode(devMode: boolean): void;
    /**
     * Get the deploy wait time in seconds.
     */
    getDeployWaitTime(): number;
    /**
     * Set the deploy wait time in seconds.
     * Node.js will automatically enforce a
     * minimum and maximum wait time.  If the
     * number of seconds is larger than 2147483,
     * less than 1, or not a number,
     * the actual wait time used will be 1 ms.
     * @param secs
     */
    setDeployWaitTime(secs: number): void;
    /**
     * Get the invoke wait time in seconds.
     */
    getInvokeWaitTime(): number;
    /**
     * Set the invoke wait time in seconds.
     * @param secs
     */
    setInvokeWaitTime(secs: number): void;
    /**
     * Get the key val store implementation (if any) that is currently associated with this chain.
     * @returns {KeyValStore} Return the current KeyValStore associated with this chain, or undefined if not set.
     */
    getKeyValStore(): KeyValStore;
    /**
     * Set the key value store implementation.
     */
    setKeyValStore(keyValStore: KeyValStore): void;
    /**
     * Get the tcert batch size.
     */
    getTCertBatchSize(): number;
    /**
     * Set the tcert batch size.
     */
    setTCertBatchSize(batchSize: number): void;
    /**
     * Get the user member named 'name' or create
     * a new member if the member does not exist.
     * @param cb Callback of form "function(err,Member)"
     */
    getMember(name: string, cb: GetMemberCallback): void;
    /**
     * Get a user.
     * A user is a specific type of member.
     * Another type of member is a peer.
     */
    getUser(name: string, cb: GetMemberCallback): void;
    private getMemberHelper(name, cb);
    /**
     * Register a user or other member type with the chain.
     * @param registrationRequest Registration information.
     * @param cb Callback with registration results
     */
    register(registrationRequest: RegistrationRequest, cb: RegisterCallback): void;
    /**
     * Enroll a user or other identity which has already been registered.
     * If the user has already been enrolled, this will still succeed.
     * @param name The name of the user or other member to enroll.
     * @param secret The secret of the user or other member to enroll.
     * @param cb The callback to return the user or other member.
     */
    enroll(name: string, secret: string, cb: GetMemberCallback): void;
    /**
     * Register and enroll a user or other member type.
     * This assumes that a registrar with sufficient privileges has been set.
     * @param registrationRequest Registration information.
     * @params
     */
    registerAndEnroll(registrationRequest: RegistrationRequest, cb: GetMemberCallback): void;
    /**
     * Send a transaction to a peer.
     * @param tx A transaction
     * @param eventEmitter An event emitter
     */
    sendTransaction(tx: Transaction, eventEmitter: events.EventEmitter): boolean;
}
/**
 * A member is an entity that transacts on a chain.
 * Types of members include end users, peers, etc.
 */
export declare class Member {
    private chain;
    private name;
    private roles;
    private affiliation;
    private enrollmentSecret;
    private enrollment;
    private memberServices;
    private keyValStore;
    private keyValStoreName;
    private tcertGetterMap;
    private tcertBatchSize;
    /**
     * Constructor for a member.
     * @param cfg {string | RegistrationRequest} The member name or registration request.
     * @returns {Member} A member who is neither registered nor enrolled.
     */
    constructor(cfg: any, chain: Chain);
    /**
     * Get the member name.
     * @returns {string} The member name.
     */
    getName(): string;
    /**
     * Get the chain.
     * @returns {Chain} The chain.
     */
    getChain(): Chain;
    /**
     * Get the member services.
     * @returns {MemberServices} The member services.
     */
    getMemberServices(): MemberServices;
    /**
     * Get the roles.
     * @returns {string[]} The roles.
     */
    getRoles(): string[];
    /**
     * Set the roles.
     * @param roles {string[]} The roles.
     */
    setRoles(roles: string[]): void;
    /**
     * Get the affiliation.
     * @returns {string} The affiliation.
     */
    getAffiliation(): string;
    /**
     * Set the affiliation.
     * @param affiliation The affiliation.
     */
    setAffiliation(affiliation: string): void;
    /**
     * Get the transaction certificate (tcert) batch size, which is the number of tcerts retrieved
     * from member services each time (i.e. in a single batch).
     * @returns The tcert batch size.
     */
    getTCertBatchSize(): number;
    /**
     * Set the transaction certificate (tcert) batch size.
     * @param batchSize
     */
    setTCertBatchSize(batchSize: number): void;
    /**
     * Get the enrollment info.
     * @returns {Enrollment} The enrollment.
     */
    getEnrollment(): any;
    /**
     * Determine if this name has been registered.
     * @returns {boolean} True if registered; otherwise, false.
     */
    isRegistered(): boolean;
    /**
     * Determine if this name has been enrolled.
     * @returns {boolean} True if enrolled; otherwise, false.
     */
    isEnrolled(): boolean;
    /**
     * Register the member.
     * @param cb Callback of the form: {function(err,enrollmentSecret)}
     */
    register(registrationRequest: RegistrationRequest, cb: RegisterCallback): void;
    /**
     * Enroll the member and return the enrollment results.
     * @param enrollmentSecret The password or enrollment secret as returned by register.
     * @param cb Callback to report an error if it occurs
     */
    enroll(enrollmentSecret: string, cb: EnrollCallback): void;
    /**
     * Perform both registration and enrollment.
     * @param cb Callback of the form: {function(err,{key,cert,chainKey})}
     */
    registerAndEnroll(registrationRequest: RegistrationRequest, cb: ErrorCallback): void;
    /**
     * Issue a deploy request on behalf of this member.
     * @param deployRequest {Object}
     * @returns {TransactionContext} Emits 'submitted', 'complete', and 'error' events.
     */
    deploy(deployRequest: DeployRequest): TransactionContext;
    /**
     * Issue a invoke request on behalf of this member.
     * @param invokeRequest {Object}
     * @returns {TransactionContext} Emits 'submitted', 'complete', and 'error' events.
     */
    invoke(invokeRequest: InvokeRequest): TransactionContext;
    /**
     * Issue a query request on behalf of this member.
     * @param queryRequest {Object}
     * @returns {TransactionContext} Emits 'submitted', 'complete', and 'error' events.
     */
    query(queryRequest: QueryRequest): TransactionContext;
    /**
     * Create a transaction context with which to issue build, deploy, invoke, or query transactions.
     * Only call this if you want to use the same tcert for multiple transactions.
     * @param {Object} tcert A transaction certificate from member services.  This is optional.
     * @returns A transaction context.
     */
    newTransactionContext(tcert?: TCert): TransactionContext;
    /**
     * Get a user certificate.
     * @param attrs The names of attributes to include in the user certificate.
     * @param cb A GetTCertCallback
     */
    getUserCert(attrs: string[], cb: GetTCertCallback): void;
    /**
   * Get the next available transaction certificate with the appropriate attributes.
   * @param cb
   */
    getNextTCert(attrs: string[], cb: GetTCertCallback): void;
    /**
     * Save the state of this member to the key value store.
     * @param cb Callback of the form: {function(err}
     */
    saveState(cb: ErrorCallback): void;
    /**
     * Restore the state of this member from the key value store (if found).  If not found, do nothing.
     * @param cb Callback of the form: function(err}
     */
    restoreState(cb: ErrorCallback): void;
    /**
     * Get the current state of this member as a string
     * @return {string} The state of this member as a string
     */
    fromString(str: string): void;
    /**
     * Save the current state of this member as a string
     * @return {string} The state of this member as a string
     */
    toString(): string;
}
/**
 * A transaction context emits events 'submitted', 'complete', and 'error'.
 * Each transaction context uses exactly one tcert.
 */
export declare class TransactionContext extends events.EventEmitter {
    private member;
    private chain;
    private memberServices;
    private nonce;
    private binding;
    private tcert;
    private attrs;
    private complete;
    private timeoutId;
    private waitTime;
    private cevent;
    constructor(member: Member, tcert: TCert);
    /**
     * Get the member with which this transaction context is associated.
     * @returns The member
     */
    getMember(): Member;
    /**
     * Get the chain with which this transaction context is associated.
     * @returns The chain
     */
    getChain(): Chain;
    /**
     * Get the member services, or undefined if security is not enabled.
     * @returns The member services
     */
    getMemberServices(): MemberServices;
    /**
     * Emit a specific event provided an event listener is already registered.
     */
    emitMyEvent(name: string, event: any): void;
    /**
     * Issue a deploy transaction.
     * @param deployRequest {Object} A deploy request of the form: { chaincodeID, payload, metadata, uuid, timestamp, confidentiality: { level, version, nonce }
   */
    deploy(deployRequest: DeployRequest): TransactionContext;
    /**
     * Issue an invoke transaction.
     * @param invokeRequest {Object} An invoke request of the form: XXX
     */
    invoke(invokeRequest: InvokeRequest): TransactionContext;
    /**
     * Issue an query transaction.
     * @param queryRequest {Object} A query request of the form: XXX
     */
    query(queryRequest: QueryRequest): TransactionContext;
    /**
     * Get the attribute names associated
     */
    getAttrs(): string[];
    /**
     * Set the attributes for this transaction context.
     */
    setAttrs(attrs: string[]): void;
    /**
     * Execute a transaction
     * @param tx {Transaction} The transaction.
     */
    private execute(tx);
    private getMyTCert(cb);
    private processConfidentiality(transaction);
    private decryptResult(ct);
    /**
     * Create a deploy transaction.
     * @param request {Object} A BuildRequest or DeployRequest
     */
    private newBuildOrDeployTransaction(request, isBuildRequest, cb);
    /**
     * Create a development mode deploy transaction.
     * @param request {Object} A development mode BuildRequest or DeployRequest
     */
    private newDevModeTransaction(request, isBuildRequest, cb);
    /**
     * Create a network mode deploy transaction.
     * @param request {Object} A network mode BuildRequest or DeployRequest
     */
    private newNetModeTransaction(request, isBuildRequest, cb);
    /**
     * Create an invoke or query transaction.
     * @param request {Object} A build or deploy request of the form: { chaincodeID, payload, metadata, uuid, timestamp, confidentiality: { level, version, nonce }
     */
    private newInvokeOrQueryTransaction(request, isInvokeRequest, cb);
}
/**
 * The Peer class represents a peer to which HFC sends deploy, invoke, or query requests.
 */
export declare class Peer {
    private url;
    private chain;
    private ep;
    private peerClient;
    /**
     * Constructs a Peer given its endpoint configuration settings
     * and returns the new Peer.
     * @param {string} url The URL with format of "grpcs://host:port".
     * @param {Chain} chain The chain of which this peer is a member.
     * @param {GRPCOptions} optional GRPC options to use with the gRPC,
     * protocol (that is, with TransportCredentials) including a root
     * certificate file, in PEM format, and hostnameOverride. A certificate
     * is required when using the grpcs (TLS) protocol.
     * @returns {Peer} The new peer.
     */
    constructor(url: string, chain: Chain, opts: GRPCOptions);
    /**
     * Get the chain of which this peer is a member.
     * @returns {Chain} The chain of which this peer is a member.
     */
    getChain(): Chain;
    /**
     * Get the URL of the peer.
     * @returns {string} Get the URL associated with the peer.
     */
    getUrl(): string;
    /**
     * Send a transaction to this peer.
     * @param tx A transaction
     * @param eventEmitter The event emitter
     */
    sendTransaction: (tx: Transaction, eventEmitter: events.EventEmitter) => void;
    /**
     * Remove the peer from the chain.
     */
    remove(): void;
}
/**
 * Create a new chain.  If it already exists, throws an Error.
 * @param name {string} Name of the chain.  It can be any name and has value only for the client.
 * @returns
 */
export declare function newChain(name: any): any;
/**
 * Get a chain.  If it doesn't yet exist and 'create' is true, create it.
 * @param {string} chainName The name of the chain to get or create.
 * @param {boolean} create If the chain doesn't already exist, specifies whether to create it.
 * @return {Chain} Returns the chain, or null if it doesn't exist and create is false.
 */
export declare function getChain(chainName: any, create: any): any;
/**
 * Create an instance of a FileKeyValStore.
 */
export declare function newFileKeyValStore(dir: string): KeyValStore;
/**
 * The ChainCodeCBE is used internal to the EventHub to hold chaincode event registration callbacks.
 */
export declare class ChainCodeCBE {
    ccid: string;
    eventNameFilter: RegExp;
    cb: Function;
    constructor(ccid: string, eventNameFilter: string, cb: Function);
}
/**
 * The EventHub is used to distribute events from a specific event source(peer)
 */
export declare class EventHub {
    private ep;
    private opts;
    private events;
    private client;
    private call;
    private chaincodeRegistrants;
    private blockRegistrants;
    private txRegistrants;
    private connected;
    constructor();
    setPeerAddr(peeraddr: string, opts?: GRPCOptions): void;
    isconnected(): boolean;
    connect(): void;
    disconnect(): void;
    registerChaincodeEvent(ccid: string, eventname: string, callback: Function): ChainCodeCBE;
    unregisterChaincodeEvent(cbe: ChainCodeCBE): void;
    registerBlockEvent(callback: Function): void;
    unregisterBlockEvent(callback: Function): void;
    registerTxEvent(txid: string, callback: Function): void;
    unregisterTxEvent(txid: string): void;
    private txCallback;
}
