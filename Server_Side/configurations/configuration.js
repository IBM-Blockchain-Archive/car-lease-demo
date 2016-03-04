var config = {};

config.trace = true;

config.api_url = JSON.parse(process.env.VCAP_SERVICES)[Object.keys(JSON.parse(process.env.VCAP_SERVICES))[0]][0]["credentials"]["peers"][0]["api_url"];
config.app_url = JSON.parse(process.env.VCAP_APPLICATION)["application_uris"][0];

config.credentials = JSON.parse(process.env.VCAP_SERVICES)[Object.keys(JSON.parse(process.env.VCAP_SERVICES))[0]][0]["credentials"]

config.traceFile = __dirname+'/../logs/trace.log'

config.vehicle_log_address = '2b93a8cdcbec1ef4909071fd85531fcf3ef21db17343568a73916bad010966913c480475864a6da4e3193bbd2300c9fe140bcf3bf8fa675aba078632a7564456'
config.vehicle_address = 'd3a75d97dde3be9c6492dd52bce2e94d9a0465be55bbd830d0a0392d13e81564000753aac4201f7bea645f957dcc64b67c67302a57f4c3b27dab53de84272b74'

exports.config = config;