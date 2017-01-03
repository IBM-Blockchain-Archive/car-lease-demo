'use strict';
let simple_scenario = {
    'cars': [
        {
            'VIN': '287437467447767',
            'Make': 'Toyota',
            'Model': 'Auris',
            'Colour': 'Blue',
            'Reg': 'LM16 YHU',
            'Owners': ['DVLA', 'Toyota', 'Beechvale Group', 'LeaseCan']
        },
        {
            'VIN': '549523556856725',
            'Make': 'Jaguar',
            'Model': 'F-Type',
            'Colour': 'Red',
            'Reg': 'HE16 WDZ',
            'Owners': ['DVLA', 'Jaguar Land Rover', 'Beechvale Group']
        },
        {
            'VIN': '880352730316924',
            'Make': 'Alfa Romeo',
            'Model': 'MiTo',
            'Colour': 'Blue',
            'Reg': 'NL65 DTU',
            'Owners': ['DVLA', 'Alfa Romeo']
        }
    ]
};

let full_scenario = {
    'cars': [
        {
            'VIN': '720965981630055',
            'Make': 'Toyota',
            'Model': 'Yaris',
            'Colour': 'Red',
            'Reg': 'QD65 YKR',
            'Owners': ['DVLA', 'Toyota', 'Beechvale Group', 'LeaseCan', 'Joe Payne', 'Cray Bros (London) Ltd']
        },
        {
            'VIN': '287437467447767',
            'Make': 'Toyota',
            'Model': 'Auris',
            'Colour': 'Blue',
            'Reg': 'LM16 YHU',
            'Owners': ['DVLA', 'Toyota', 'Beechvale Group', 'LeaseCan']
        },
        {
            'VIN': '948881310167423',
            'Make': 'Toyota',
            'Model': 'Celica',
            'Colour': 'Silver',
            'Reg': 'DG16 FVG',
            'Owners': ['DVLA', 'Toyota', 'Beechvale Group']
        },
        {
            'VIN': '181255391772389',
            'Make': 'Jaguar',
            'Model': 'XJ',
            'Colour': 'Black',
            'Reg': 'FM65 ESL',
            'Owners': ['DVLA', 'Jaguar Land Rover', 'Beechvale Group', 'LeaseCan']
        },
        {
            'VIN': '549523556856725',
            'Make': 'Jaguar',
            'Model': 'F-Type',
            'Colour': 'Red',
            'Reg': 'HE16 WDZ',
            'Owners': ['DVLA', 'Jaguar Land Rover', 'Beechvale Group']
        },
        {
            'VIN': '523447019546831',
            'Make': 'Land Rover',
            'Model': 'Defender',
            'Colour': 'Silver',
            'Reg': 'EY16 FRV',
            'Owners': ['DVLA', 'Jaguar Land Rover', 'Beechvale Group']
        },
        {
            'VIN': '546303780997253',
            'Make': 'Alfa Romeo',
            'Model': 'Giulietta',
            'Colour': 'White',
            'Reg': 'JU65 XMH',
            'Owners': ['DVLA', 'Alfa Romeo']
        },
        {
            'VIN': '128994473011261',
            'Make': 'Alfa Romeo',
            'Model': 'MiTO',
            'Colour': 'Black',
            'Reg': 'YD65 FTB',
            'Owners': ['DVLA', 'Alfa Romeo']
        },
        {
            'VIN': '747542562791231',
            'Make': 'Alfa Romeo',
            'Model': '4C',
            'Colour': 'Red',
            'Reg': 'RX65 RNG',
            'Owners': ['DVLA', 'Alfa Romeo']
        },
        {
            'VIN': '880352730316924',
            'Make': 'Alfa Romeo',
            'Model': 'MiTo',
            'Colour': 'Blue',
            'Reg': 'NL65 DTU',
            'Owners': ['DVLA', 'Alfa Romeo']
        }
    ]
};


exports.simple = simple_scenario;
exports.full = full_scenario;
