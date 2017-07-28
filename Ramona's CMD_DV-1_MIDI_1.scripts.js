/******************************************/
/*
/* Behringer CMD DV-1 controller script
/* for mixxx v1.12 beta
/*
/******************************************/


function CMDDV1() {}

// --------------------------------
// ------- Global Variables -------
// --------------------------------
CMDDV1.id = "";       // id for the particular device for use in debugging, set at init time
CMDDV1.debug = false; // Enable/disable debugging messages to the console
CMDDV1.midichan = 7;  // the CMD-DV1 uses midi channel 7 by default
CMDDV1.knob_step = 0.028;  // rotary encoder knob_step value
CMDDV1.deckFocus = "" ;

/* info about FX range
filter: lpf 0-0.5  // val*2
filter: q 0.4-4    // (val - 0.4) / 3.6
filter: hpf 0-0.5  // val*2

reverb: bandwidth 0-1 // val
reverb: damping 0-1   // val

echo: send     0-1  // val
echo: delay    0-2  // val/2
echo: feedback 0-1  // val
echo: pingpong 0-1  // val

flanger: depth  0-1           // val
flanger: delay  50-10000      // (val - 50)/9950
flanger: period 50000-2000000 // (val - 50000) / 1950000

bitcrusher: bit_depth 2-16    // (val - 2) / 14
bitcrusher: downsampling 0-1  // val
/**/

/* disabled till need arise
CMDDV1.Rotaryctrlkey = {
    'btn1': 'mix',
    'btn2': 'parameter1',
    'btn3': 'parameter2',
    'btn4': 'parameter3',
    'row3': 'super1',
} */

/*
example
B4A.buttons[0x90][0x6A]=["[Channel1]","pfl","B4A.binaryHookLEDs", 'toggle', false];
/**/

CMDDV1.state = {};

CMDDV1.color = {
    'off'   : 0x00, // orange fixe
    'on'    : 0x01, // bleu fixe
    'blink' : 0x02, // bleu clignotant
};

// conversion table for midi codes
CMDDV1.buttonLedCodes = { 'off': 0x00, 'on': 0x01, 'blink': 0x02, };
CMDDV1.midiStatus = { 'cc': 0xB6, 'noteon': 0x96, 'noteoff': 0x86, };
CMDDV1.encoderLedCodes = { 'off': 0x00,
    '1': 0x01, '2': 0x02, '3': 0x03, '4': 0x04, '5': 0x05,
    '6': 0x06, '7': 0x07, '8': 0x08, '9': 0x09, '10': 0x0A,
    '11': 0x0B, '12': 0x0C, '13': 0x0D, '14': 0x0E, '15': 0x0F,
};




CMDDV1.labels = {
    // row1 encoders
    'row1fx1encoder1' : 0x14, 'row1fx1encoder2' : 0x15, 'row1fx1encoder3' : 0x16, 'row1fx1encoder4' : 0x17,
    'row1fx2encoder1' : 0x18, 'row1fx2encoder2' : 0x19, 'row1fx2encoder3' : 0x1A, 'row1fx2encoder4' : 0x1B,
    'row1fx3encoder1' : 0x1C, 'row1fx3encoder2' : 0x1D, 'row1fx3encoder3' : 0x1E, 'row1fx3encoder4' : 0x1F,
    'row1fx4encoder1' : 0x20, 'row1fx4encoder2' : 0x21, 'row1fx4encoder3' : 0x22, 'row1fx4encoder4' : 0x23,
    // row2 encoders
    'row2fx1encoder1' : 0x24, 'row2fx1encoder2' : 0x25, 'row2fx1encoder3' : 0x26, 'row2fx1encoder4' : 0x27,
    'row2fx2encoder1' : 0x28, 'row2fx2encoder2' : 0x29, 'row2fx2encoder3' : 0x2A, 'row2fx2encoder4' : 0x2B,
    'row2fx3encoder1' : 0x2C, 'row2fx3encoder2' : 0x2D, 'row2fx3encoder3' : 0x2E, 'row2fx3encoder4' : 0x2F,
    'row2fx4encoder1' : 0x30, 'row2fx4encoder2' : 0x31, 'row2fx4encoder3' : 0x32, 'row2fx4encoder4' : 0x33,
    // row3 encoders
    'row3encoder1'    : 0x40, 'row3encoder2'    : 0x41, 'row3encoder3'    : 0x42, 'row3encoder4'    : 0x43,

    // deck buttons
    'btnfocusa'  : 0x40, 'btnfocusb'  : 0x41, 'btnfocusc'  : 0x42, 'btnfocusd'  : 0x43,
    'btnmastera' : 0x44, 'btnmasterb' : 0x45, 'btnmasterc' : 0x46, 'btnmasterd' : 0x47,
    'btndoublea' : 0x48, 'btndoubleb' : 0x49, 'btndoublec' : 0x4A, 'btndoubled' : 0x4B,
    // loop buttons
    'btnloop1'  : 0x50, 'btnloop2'  : 0x51, 'btnloop3'  : 0x52, 'btnloop4' : 0x53,
    // function buttons
    'btnslice'  : 0x54, 'btnerase'  : 0x55, 'btnstore'  : 0x56, 'btnphrase' : 0x57,
    // hotcue buttons
    'btn5'      : 0x58, 'btn6'      : 0x59, 'btn7'      : 0x5A, 'btn8'      : 0x5B,
    'btn1'      : 0x5C, 'btn2'      : 0x5D, 'btn3'      : 0x5E, 'btn4'      : 0x5F,
};

CMDDV1.codes = {}
for (label in CMDDV1.labels)
{
    CMDDV1.codes[CMDDV1.labels[label]] = label;
};

CMDDV1.controls = {
    'row1fx1encoder1': {'group': '[EffectRack1_EffectUnit1]', 'control': 'mix'},
    'row1fx1encoder2': {'group': '[EffectRack1_EffectUnit1_Effect1]', 'control': 'parameter1'},
    'row1fx1encoder3': {'group': '[EffectRack1_EffectUnit1_Effect1]', 'control': 'parameter2'},
    'row1fx1encoder4': {'group': '[EffectRack1_EffectUnit1_Effect1]', 'control': 'parameter3'},
    'row1fx2encoder1': {'group': '[EffectRack1_EffectUnit2]', 'control': 'mix'},
    'row1fx2encoder2': {'group': '[EffectRack1_EffectUnit2_Effect1]', 'control': 'parameter1'},
    'row1fx2encoder3': {'group': '[EffectRack1_EffectUnit2_Effect1]', 'control': 'parameter2'},
    'row1fx2encoder4': {'group': '[EffectRack1_EffectUnit2_Effect1]', 'control': 'parameter3'},
    'row1fx3encoder1': {'group': '[EffectRack1_EffectUnit3]', 'control': 'mix'},
    'row1fx3encoder2': {'group': '[EffectRack1_EffectUnit3_Effect1]', 'control': 'parameter1'},
    'row1fx3encoder3': {'group': '[EffectRack1_EffectUnit3_Effect1]', 'control': 'parameter2'},
    'row1fx3encoder4': {'group': '[EffectRack1_EffectUnit3_Effect1]', 'control': 'parameter3'},
    'row1fx4encoder1': {'group': '[EffectRack1_EffectUnit4]', 'control': 'mix'},
    'row1fx4encoder2': {'group': '[EffectRack1_EffectUnit4_Effect1]', 'control': 'parameter1'},
    'row1fx4encoder3': {'group': '[EffectRack1_EffectUnit4_Effect1]', 'control': 'parameter2'},
    'row1fx4encoder4': {'group': '[EffectRack1_EffectUnit4_Effect1]', 'control': 'parameter3'},

    'row2fx1encoder1': {'group': '[EffectRack1_EffectUnit1]', 'control': 'mix'},
    'row2fx1encoder2': {'group': '[EffectRack1_EffectUnit1_Effect1]', 'control': 'parameter1'},
    'row2fx1encoder3': {'group': '[EffectRack1_EffectUnit1_Effect1]', 'control': 'parameter2'},
    'row2fx1encoder4': {'group': '[EffectRack1_EffectUnit1_Effect1]', 'control': 'parameter3'},
    'row2fx2encoder1': {'group': '[EffectRack1_EffectUnit2]', 'control': 'mix'},
    'row2fx2encoder2': {'group': '[EffectRack1_EffectUnit2_Effect1]', 'control': 'parameter1'},
    'row2fx2encoder3': {'group': '[EffectRack1_EffectUnit2_Effect1]', 'control': 'parameter2'},
    'row2fx2encoder4': {'group': '[EffectRack1_EffectUnit2_Effect1]', 'control': 'parameter3'},
    'row2fx3encoder1': {'group': '[EffectRack1_EffectUnit3]', 'control': 'mix'},
    'row2fx3encoder2': {'group': '[EffectRack1_EffectUnit3_Effect1]', 'control': 'parameter1'},
    'row2fx3encoder3': {'group': '[EffectRack1_EffectUnit3_Effect1]', 'control': 'parameter2'},
    'row2fx3encoder4': {'group': '[EffectRack1_EffectUnit3_Effect1]', 'control': 'parameter3'},
    'row2fx4encoder1': {'group': '[EffectRack1_EffectUnit4]', 'control': 'mix'},
    'row2fx4encoder2': {'group': '[EffectRack1_EffectUnit4_Effect1]', 'control': 'parameter1'},
    'row2fx4encoder3': {'group': '[EffectRack1_EffectUnit4_Effect1]', 'control': 'parameter2'},
    'row2fx4encoder4': {'group': '[EffectRack1_EffectUnit4_Effect1]', 'control': 'parameter3'},

    'row3encoder1': {'group': '[QuickEffectRack1_[Channel1]]', 'control': 'super1'},
    'row3encoder2': {'group': '[QuickEffectRack1_[Channel2]]', 'control': 'super1'},
    'row3encoder3': {'group': '[QuickEffectRack1_[Channel3]]', 'control': 'super1'},
    'row3encoder4': {'group': '[QuickEffectRack1_[Channel4]]', 'control': 'super1'},

    'btnfocusa': {'group': 'Focus', 'control': 'radio', 'value':1},
    'btnfocusb': {'group': 'Focus', 'control': 'radio', 'value':2},
    'btnfocusc': {'group': 'Focus', 'control': 'radio', 'value':3},
    'btnfocusd': {'group': 'Focus', 'control': 'radio', 'value':4},

    'btnloop1': {'dynamic':'CMDDV1.on_beatloop_button'},
    'btnloop2': {'dynamic':'CMDDV1.on_beatloop_button'},
    'btnloop3': {'dynamic':'CMDDV1.on_beatloop_button'},
    'btnloop4': {'dynamic':'CMDDV1.on_beatloop_button'},

    'btnslice': {'dynamic':'CMDDV1.on_function_button'},
    'btnerase': {'dynamic':'CMDDV1.on_function_button'},
    'btnstore': {'dynamic':'CMDDV1.on_function_button'},
    'btnphrase': {'dynamic':'CMDDV1.on_function_button'},
};

// declare all LEDs for (group/control) pairs
CMDDV1.leds = {
    "[EffectRack1_EffectUnit1]": {
        "mix": [CMDDV1.labels['row1fx1encoder1'], CMDDV1.labels['row2fx1encoder1']],
        "enabled": [CMDDV1.labels['row1fx1encoder1'], CMDDV1.labels['row2fx1encoder1']]
    },
    "[EffectRack1_EffectUnit1_Effect1]": {
        "parameter1": [CMDDV1.labels['row1fx1encoder2'], CMDDV1.labels['row2fx1encoder2']],
        "parameter2": [CMDDV1.labels['row1fx1encoder3'], CMDDV1.labels['row2fx1encoder3']],
        "parameter3": [CMDDV1.labels['row1fx1encoder4'], CMDDV1.labels['row2fx1encoder4']]
    },
    "[EffectRack1_EffectUnit2]": {
        "mix": [CMDDV1.labels['row1fx2encoder1'], CMDDV1.labels['row2fx2encoder1']],
        "enabled": [CMDDV1.labels['row1fx2encoder1'], CMDDV1.labels['row2fx2encoder1']]
    },
    "[EffectRack1_EffectUnit2_Effect1]": {
        "parameter1": [CMDDV1.labels['row1fx2encoder2'], CMDDV1.labels['row2fx2encoder2']],
        "parameter2": [CMDDV1.labels['row1fx2encoder3'], CMDDV1.labels['row2fx2encoder3']],
        "parameter3": [CMDDV1.labels['row1fx2encoder4'], CMDDV1.labels['row2fx2encoder4']]
    },
    "[EffectRack1_EffectUnit3]": {
        "mix": [CMDDV1.labels['row1fx3encoder1'], CMDDV1.labels['row2fx3encoder1']],
        "enabled": [CMDDV1.labels['row1fx3encoder1'], CMDDV1.labels['row2fx3encoder1']]
    },
    "[EffectRack1_EffectUnit3_Effect1]": {
        "parameter1": [CMDDV1.labels['row1fx3encoder2'], CMDDV1.labels['row2fx3encoder2']],
        "parameter2": [CMDDV1.labels['row1fx3encoder3'], CMDDV1.labels['row2fx3encoder3']],
        "parameter3": [CMDDV1.labels['row1fx3encoder4'], CMDDV1.labels['row2fx3encoder4']]
    },
    "[EffectRack1_EffectUnit4]": {
        "mix": [CMDDV1.labels['row1fx4encoder1'], CMDDV1.labels['row2fx4encoder1']],
        "enabled": [CMDDV1.labels['row1fx4encoder1'], CMDDV1.labels['row2fx4encoder1']]
    },
    "[EffectRack1_EffectUnit4_Effect1]": {
        "parameter1": [CMDDV1.labels['row1fx4encoder2'], CMDDV1.labels['row2fx4encoder2']],
        "parameter2": [CMDDV1.labels['row1fx4encoder3'], CMDDV1.labels['row2fx4encoder3']],
        "parameter3": [CMDDV1.labels['row1fx4encoder4'], CMDDV1.labels['row2fx4encoder4']]
    },
    '[QuickEffectRack1_[Channel1]]': {
        "super1": [CMDDV1.labels['row3encoder1']],
    },
    '[QuickEffectRack1_[Channel2]]': {
        "super1": [CMDDV1.labels['row3encoder2']],
    },
    '[QuickEffectRack1_[Channel3]]': {
        "super1": [CMDDV1.labels['row3encoder3']],
    },
    '[QuickEffectRack1_[Channel4]]': {
        "super1": [CMDDV1.labels['row3encoder4']],
    },

    'Focus': {
        'members': [
            [CMDDV1.labels['btnfocusa']],
            [CMDDV1.labels['btnfocusb']],
            [CMDDV1.labels['btnfocusc']],
            [CMDDV1.labels['btnfocusd']],
        ],
        'values': [1, 2, 3, 4], // A B C D
        'on_set': function() { CMDDV1.on_focus_change(); },
    },

    '[Channel1]'                  : {
        "beatloop_1_enabled"      : [CMDDV1.labels['btnloop1']],
        "beatloop_4_enabled"      : [CMDDV1.labels['btnloop2']],
        "beatloop_8_enabled"      : [CMDDV1.labels['btnloop3']],
        "beatloop_16_enabled"     : [CMDDV1.labels['btnloop4']],
        "beatloop_0.0625_enabled" : [CMDDV1.labels['btnloop1']],
        "beatloop_0.125_enabled"  : [CMDDV1.labels['btnloop2']],
        "beatloop_0.25_enabled"   : [CMDDV1.labels['btnloop3']],
        "beatloop_0.5_enabled"    : [CMDDV1.labels['btnloop4']],
    },

    '[Slice]': { 'enable': [CMDDV1.labels['btnslice']]},
    '[Erase]': { 'enable': [CMDDV1.labels['btnerase']]},
    '[Store]': { 'enable': [CMDDV1.labels['btnstore']]},
    '[Phrase]': { 'enable': [CMDDV1.labels['btnphrase']]},

/*
        case "[QuickEffectRack1_[Channel1]]":
            midicontrol = CMDDV1.labels.row3encoder1;
            break;
        case "[QuickEffectRack1_[Channel2]]":
            midicontrol = CMDDV1.labels.row3encoder2;
            break;
        case "[QuickEffectRack1_[Channel3]]":
            midicontrol = CMDDV1.labels.row3encoder3;
            break;
        case "[QuickEffectRack1_[Channel4]]":
            midicontrol = CMDDV1.labels.row3encoder4;
            break;
*/
};

CMDDV1.midiCodesButtons = {
    // row1 buttons
    'row1fx1btnonsel' : 0x14, 'row1fx1btn1' : 0x15, 'row1fx1btn2' : 0x16, 'row1fx1btn3' : 0x17,
    'row1fx2btnonsel' : 0x18, 'row1fx2btn1' : 0x19, 'row1fx2btn2' : 0x1A, 'row1fx2btn3' : 0x1B,
    'row1fx3btnonsel' : 0x1C, 'row1fx3btn1' : 0x1D, 'row1fx3btn2' : 0x1E, 'row1fx3btn3' : 0x1F,
    'row1fx4btnonsel' : 0x20, 'row1fx4btn1' : 0x21, 'row1fx4btn2' : 0x22, 'row1fx4btn3' : 0x23,
    // row2 buttons
    'row2fx1btnonsel' : 0x14, 'row2fx1btn1' : 0x15, 'row2fx1btn2' : 0x16, 'row2fx1btn3' : 0x17,
    'row2fx2btnonsel' : 0x18, 'row2fx2btn1' : 0x19, 'row2fx2btn2' : 0x1A, 'row2fx2btn3' : 0x1B,
    'row2fx3btnonsel' : 0x1C, 'row2fx3btn1' : 0x1D, 'row2fx3btn2' : 0x1E, 'row2fx3btn3' : 0x1F,
    'row2fx4btnonsel' : 0x20, 'row2fx4btn1' : 0x21, 'row2fx4btn2' : 0x22, 'row2fx4btn3' : 0x23,
    // deck buttons
    'btnfocusa'  : 0x40, 'btnfocusb'  : 0x41, 'btnfocusc'  : 0x42, 'btnfocusd'  : 0x43,
    'btnmastera' : 0x44, 'btnmasterb' : 0x45, 'btnmasterc' : 0x46, 'btnmasterd' : 0x47,
    'btndoublea' : 0x48, 'btndoubleb' : 0x49, 'btndoublec' : 0x4A, 'btndoubled' : 0x4B,
    // loop buttons
    'btnloop1'  : 0x50, 'btnloop2'  : 0x51, 'btnloop3'  : 0x52, 'btnloop4' : 0x53,
    // function buttons
    'btnslice'  : 0x54, 'btnerase'  : 0x55, 'btnstore'  : 0x56, 'btnphrase' : 0x57,
    // hotcue buttons
    'btn5'      : 0x58, 'btn6'      : 0x59, 'btn7'      : 0x5A, 'btn8'      : 0x5B,
    'btn1'      : 0x5C, 'btn2'      : 0x5D, 'btn3'      : 0x5E, 'btn4'      : 0x5F,
};

// -------------------------
// ------- functions -------
// -------------------------

CMDDV1.init = function (id, debug) {
    CMDDV1.id = id;
    CMDDV1.debug = debug;

    // Focus deck A
    CMDDV1.state['FocusOld'] = false;
    CMDDV1.state['Focus'] = 1;
    CMDDV1.on_focus_change();

    for ( i = 1; i <= 4; i++)
    {
        CMDDV1.connect_and_trigger("[EffectRack1_EffectUnit"+i+"]", "mix", "CMDDV1.update_led");
        CMDDV1.connect_and_trigger("[EffectRack1_EffectUnit"+i+"_Effect1]", "parameter1", "CMDDV1.update_led");
        CMDDV1.connect_and_trigger("[EffectRack1_EffectUnit"+i+"_Effect1]", "parameter2", "CMDDV1.update_led");
        CMDDV1.connect_and_trigger("[EffectRack1_EffectUnit"+i+"_Effect1]", "parameter3", "CMDDV1.update_led");

        CMDDV1.connect_and_trigger("[EffectRack1_EffectUnit"+i+"]", "enabled", "CMDDV1.update_button");
        CMDDV1.connect_and_trigger("[EffectRack1_EffectUnit"+i+"_Effect1]", "loaded", "CMDDV1.on_loaded_effect");
        CMDDV1.connect_and_trigger("[QuickEffectRack1_[Channel"+i+"]]", "super1", "CMDDV1.update_led");
    }

    print (" "+CMDDV1.id+" >>>>> initialized ");
};

CMDDV1.connect_and_trigger = function(group, name, func)
{
    engine.connectControl(group, name, func);
    engine.trigger(group, name);
}

CMDDV1.extract_effect_unit_nb = function(group)
{
    return group.substring(23, 24);
}

CMDDV1.on_focus_change = function()
{
    CMDDV1.connect_beatloop_buttons(CMDDV1.state['FocusOld'], true);
    CMDDV1.connect_beatloop_buttons(CMDDV1.state['Focus']);
}

CMDDV1.connect_beatloop_buttons = function(focus, disconnect)
{
    if (focus === false) return;

    disconnect = typeof disconnect !== 'undefined' ? disconnect : false;

print('disconnect = '+disconnect);
    var bindings = {
        "beatloop_1_enabled"  : "CMDDV1.update_beatloop_button",
        "beatloop_4_enabled"  : "CMDDV1.update_beatloop_button",
        "beatloop_8_enabled"  : "CMDDV1.update_beatloop_button",
        "beatloop_16_enabled" : "CMDDV1.update_beatloop_button",
    };
    if ('Slice' in CMDDV1.state && CMDDV1.state['Slice'])
    {
        bindings = {
            "beatloop_0.0625_enabled" : "CMDDV1.update_beatloop_button",
            "beatloop_0.125_enabled"      : "CMDDV1.update_beatloop_button",
            "beatloop_0.25_enabled"      : "CMDDV1.update_beatloop_button",
            "beatloop_0.5_enabled"     : "CMDDV1.update_beatloop_button",
        };
    }

    for (binding in bindings)
        engine.connectControl("[Channel"+focus+"]", binding, bindings[binding], disconnect);

}

CMDDV1.on_beatloop_button = function(channel, control, value, status, group)
{
    if ( !value) return; // on key up

    var focus = CMDDV1.state['Focus'];

    if ( ! focus) return;

    var beat = [1,4,8,16][parseInt(group.substring(9, 10))-1];
    if ('Slice' in CMDDV1.state && CMDDV1.state['Slice'])
        beat = ['0.0625', '0.125', '0.25', '0.5'][parseInt(group.substring(9, 10))-1];

        print(beat);

    var enabled = engine.getValue('[Channel'+focus+']', 'beatloop_'+beat+'_enabled');

    engine.setValue('[Channel'+focus+']', 'loop_enabled', enabled?0:1);
    engine.setValue('[Channel'+focus+']', 'beatloop_'+beat+'_toggle', 1);

    // light button now to provider visual feedback
    // CMDDV1.update_beatloop_button(666, group, control);
}

CMDDV1.on_function_button = function(channel, control, value, status, group)
{
    if ( !value) return; // on key up

    var name = group.substring(1, group.length-1);

    if (name == 'Slice')
        CMDDV1.connect_beatloop_buttons(CMDDV1.state['Focus'], true);

    if (name in CMDDV1.state)
        CMDDV1.state[name] = ! CMDDV1.state[name];
    else
        CMDDV1.state[name] = true;

    CMDDV1.set_color(
        CMDDV1.leds[group]['enable'],
        CMDDV1.state[name]
    );

    if (name == 'Slice')
        CMDDV1.connect_beatloop_buttons(CMDDV1.state['Focus']);
}


// trigger parameter knob updates or turn off LEDs and buttons
CMDDV1.on_loaded_effect = function(value, group, control)
{
    var num_params = engine.getValue(group, 'num_parameters');
    var effect_unit_nb = CMDDV1.extract_effect_unit_nb(group);

    for (row = 1; row <= 2; row++) {
        for (param_nb = 1; param_nb <= 3; param_nb++)
        {
            // trigger knob update or turn off button LED
            if (param_nb <= num_params)
            {
                engine.trigger(group, "parameter"+param_nb);
            }
            else
            {
                // turn off knob LED
                midi.sendShortMsg(CMDDV1.midiStatus.cc, CMDDV1.labels['row'+row+'fx'+effect_unit_nb+'encoder'+(param_nb+1)], CMDDV1.encoderLedCodes.off);
                // turn off button
                CMDDV1.set_color(CMDDV1.labels['row'+row+'fx'+effect_unit_nb+'encoder'+(param_nb+1)], CMDDV1.color.off);
            }
        }
    }
}

CMDDV1.shutdown = function() {

    if (CMDDV1.debug) {print (" <<<<<<<<<<<<<<<<<<<<<<< CMDDV1.shutdown");}
    // turning off all encoders LEDs
    for (i = 1; i < 5; i++) {
        for (j = 1; j < 5; j++) {
            midi.sendShortMsg(CMDDV1.midiStatus.cc,CMDDV1.labels['row1fx'+j+'encoder'+i], CMDDV1.encoderLedCodes.off);
            midi.sendShortMsg(CMDDV1.midiStatus.cc,CMDDV1.labels['row2fx'+j+'encoder'+i], CMDDV1.encoderLedCodes.off);
        }
        midi.sendShortMsg(CMDDV1.midiStatus.cc,CMDDV1.labels['row3encoder'+i], CMDDV1.encoderLedCodes.off);
    }
    if (CMDDV1.debug) {print (" >>>>>>>>>>>>>>>>>>>>>>> end CMDDV1.shutdown");}
};

// ------------------------------
// ------- LEDs functions -------
// ------------------------------

CMDDV1.initEncoderLed = function(channel, control, value, status, group, ctrlkey) {
/**
/* read internal value, light corresponding rotary encoder LED
/**/
//    var curInternalValue = engine.getValue(group, ctrlkey);
    var curInternalValue = engine.getParameter(group, ctrlkey);
    var curInternalValueLed = Math.round(1 + curInternalValue * 14);
    midi.sendShortMsg(status, control, CMDDV1.encoderLedCodes[curInternalValueLed]);
};

CMDDV1.set_color = function(button, color)
{
    midi.sendShortMsg(
        CMDDV1.midiStatus.noteon,
        button,
        color
    );
}


// ---------------------------------------
// ------- script binding functions ------
// ---------------------------------------

CMDDV1.r3EncoderLed = function(channel, control, value, status, group) {
    var ctrlkey  = "super1";
    // mto a désactivé car tout est dans on_knob_change
    // CMDDV1.encoderLed (channel, control, value, status, group, ctrlkey);
};


/*********************************************************************
 *                               mtou                                *
 *********************************************************************/

CMDDV1.code_to_control = function(code)
{
    var label = (code in CMDDV1.codes) ? CMDDV1.codes[code] : false;
    if ( ! label)
        return;
    return (label in CMDDV1.controls) ? CMDDV1.controls[label] : false;
}

CMDDV1.on_knob_change = function(channel, control, value, status, group)
{
    var def = CMDDV1.code_to_control(control);

    if ( ! def) return; // exit if knob is unknown

    // exit if parameter does not exist
    if (def['control'].substring(0, 9) == 'parameter'
    && parseInt(def['control'].substring(9, 10)) > engine.getValue(def['group'], 'num_parameters'))
        return;

    print("Control = "+control);
    print("Group = "+group);
    print("Value = "+value);

    var current_value = engine.getParameter(def['group'], def['control']);

    if (def['control'] == 'mix' && group in CMDDV1.state)
    {
        // mix knob is "shifted" by its associated button
        var effect_group = group.substring(0, group.length-1)+'_Effect1]';
        engine.setValue(effect_group, 'effect_selector', value - 0x40);
        // HACK trigger effect load in 200ms to ensure proper parameter update
        engine.beginTimer(
            200,
            "engine.trigger('"+effect_group+"', 'loaded')",
            true
        );

        CMDDV1.state[group] = 'shift';
        return;
    }



    // if (CMDDV1.debug)
    if (false)
    {
        script.midiDebug(channel, control, value, status, group);
        print ("\nctrlkey= " + def['control'] +"\nvalue=" + value + "\ngroup=" + group + "\ncontrol=" + control + "\ncurInternalValue= "+current_value);
    }
    print('def[group] = '+def['group']);
    print('def[control] = '+def['control']);

    var step = CMDDV1.knob_step;

    // slow step if parameter knob is shifted
    if (def['control'].substring(0, 9) == 'parameter' && group+def['control'] in CMDDV1.state)
        step = step / 10.0;

    if (value === 0x3F) {
        current_value -= step;
    }
    else if (value === 0x41) {
        current_value += step;
    }
    print('ok');
    engine.setParameter(def['group'], def['control'], current_value);
    print('fin');
}

CMDDV1.update_radio_leds = function(radio_group)
{
    for (var i=0; i < CMDDV1.leds[radio_group]['members'].length; i++)
    {
        CMDDV1.set_color(
            CMDDV1.leds[radio_group]['members'][i],
            (CMDDV1.state[radio_group] == CMDDV1.leds[radio_group]['values'][i] ? CMDDV1.color.on : CMDDV1.color.off)
        );
    };
}

CMDDV1.on_button_on = function(channel, control, value, status, group)
{
    var def = CMDDV1.code_to_control(control);

print("button_on");
print(group);
print(control);
    if ( ! def) return; // exit if button is unknown

    if ('dynamic' in def)
        return eval(def['dynamic'])(channel, control, value, status, group);

    // exit if parameter does not exist
    if (def['control'].substring(0, 9) == 'parameter'
    && parseInt(def['control'].substring(9, 10)) > engine.getValue(def['group'], 'num_parameters'))
    {
        return;
    }

    print("endbuttonon");
    // mix button : keep state
    if (def['control'] == 'mix')
        CMDDV1.state[def['group']] = 'on';
    else if (def['control'].substring(0, 9) == 'parameter')
        CMDDV1.state[def['group']+def['control']] = 'on';
    else if (def['control'] == 'radio')
    {
        if (!(def['group'] in CMDDV1.state) || CMDDV1.state[def['group']] != def['value'])
        {
            CMDDV1.state[def['group']+"Old"] = (def['group'] in CMDDV1.state) ? CMDDV1.state[def['group']] : false;
            CMDDV1.state[def['group']] = def['value'];
            CMDDV1.update_radio_leds(def['group']);
            if ('on_set' in CMDDV1.leds[def['group']])
            {
                // Callback on_set
                CMDDV1.leds[def['group']]['on_set']();
            }
        }
    }
}

CMDDV1.on_button_off = function(channel, control, value, status, group)
{
    var def = CMDDV1.code_to_control(control);

    if ( ! def) return; // exit if button is unknown

    if ('dynamic' in def)
        return eval(def['dynamic'])(channel, control, value, status, group);

    // exit if parameter does not exist
    if (def['control'].substring(0, 9) == 'parameter'
    && parseInt(def['control'].substring(9, 10)) > engine.getValue(def['group'], 'num_parameters'))
    {
        return;
    }

    // mix button :
    // if not used as a "shift", swap enabled value
    if (def['control'] == 'mix')
    {
        if (CMDDV1.state[def['group']] == 'on')
            engine.setValue(def['group'], 'enabled', !engine.getValue(def['group'], 'enabled'));

        delete(CMDDV1.state[def['group']]);
    }
    else if (def['control'].substring(0, 9) == 'parameter')
    {
        delete(CMDDV1.state[def['group']+def['control']]);
    }
    else if (def['control'] == 'internal')
    {
        // Nothing to do
    }

}

CMDDV1.get_led_value = function (group, control)
{
    return CMDDV1.encoderLedCodes[Math.round(1 + engine.getParameter(group, control) * 14)];
}

CMDDV1.update_beatloop_button = function(value, group, control)
{
    leds = ((group in CMDDV1.leds && control in CMDDV1.leds[group]) ? CMDDV1.leds[group][control] : []);
    for (var i=0; i < leds.length; i++)
    {
        var color = (value ? CMDDV1.color.on : CMDDV1.color.off);
        CMDDV1.set_color(
            CMDDV1.leds[group][control][i],
            color
        );

        // if ON (immediate visual feedback), blink in 0.1s
        if (color == CMDDV1.color.on)
            CMDDV1.delay_blink(CMDDV1.leds[group][control][i], 100);
    }
}

CMDDV1.delay_blink = function(obj, time)
{
    engine.beginTimer(
        time,
        "CMDDV1.set_color("+obj+", CMDDV1.color.blink)",
        true
    );
}

// Updates LEDs found in CMDDV1.leds for the (group/control) pair
CMDDV1.update_led = function(value, group, control)
{
    // exit if effect is not loaded
    if ( ! engine.getValue(group, 'loaded'))
        return;

    leds = ((group in CMDDV1.leds && control in CMDDV1.leds[group]) ? CMDDV1.leds[group][control] : []);
    for (var i=0; i < leds.length; i++)
    {
        // Knob LEDs
        midi.sendShortMsg(
            CMDDV1.midiStatus.cc,
            CMDDV1.leds[group][control][i],
            CMDDV1.get_led_value(group, control)
        );
        // Button LED
        // don't light up row3 super1 filter buttons
        if (group.substring(0,18) != '[QuickEffectRack1_')
            CMDDV1.set_color(CMDDV1.leds[group][control][i], CMDDV1.color.on);
    }
};

// Updates on/off button light
CMDDV1.update_button = function(value, group, control)
{
    leds = ((group in CMDDV1.leds && control in CMDDV1.leds[group]) ? CMDDV1.leds[group][control] : []);
    for (var i=0; i < leds.length; i++)
    {
        // Button LED
        CMDDV1.set_color(
            CMDDV1.leds[group][control][i],
            (value ? CMDDV1.color.on : CMDDV1.color.off)
        );
    }
};

// -----------------------------------
// ----------- TEST n DEV ------------

CMDDV1.test = function() {
    print ('DEBUG!!');
//        script.midiDebug(channel, control, value, status, group);
    var paramtable = ['parameter1','parameter2', 'parameter3'];
    for (var idx in paramtable) {
        var curctrlkey = paramtable[idx];
        var group = '[EffectRack1_EffectUnit1_Effect1]';
//        var curInternalValue = engine.getValue(group, curctrlkey);
        var curInternalValue = engine.getParameter(group, curctrlkey);
        var rank = parseInt(idx,10) + 2;
         var curInternalValueLed = Math.round(1 + curInternalValue * 14);
        print ('idx = '+idx+'\ncurctrlkey = '+curctrlkey+'rank = '+rank+"internal val = "+curInternalValue+'  curInternalValueLed = '+curInternalValueLed);
        CMDDV1.initEncoderLed( CMDDV1.midichan,
                               CMDDV1.labels['row1fx1encoder'+rank],
                               0x41,
                               CMDDV1.midiStatus.cc,
                               '[EffectRack1_EffectUnit1_Effect1]',
                               curctrlkey);
        CMDDV1.initEncoderLed( CMDDV1.midichan,
                               CMDDV1.labels['row2fx1encoder'+rank],
                               0x41,
                               CMDDV1.midiStatus.cc,
                               '[EffectRack1_EffectUnit1_Effect1]',
                               curctrlkey);
    }
    print ('DEBUGDONE!!');
}

/** useful references

midi.sendShortMsg(status, byte2, byte3);
    Midi Status
    Midi Codes
    Led Codes


ControllerName.functionName = function (channel, control, value, status, group) {

    MIDI channel (0x00 = Channel 1..0x0F = Channel 16,)
    Control/note number (byte 2)
    Value of the control (byte 3)
    MIDI status byte (Note (0x9#), Control Change (0xB#), Pitch (0xE#) etc.)
    MixxxControl group (from the <group> value in the XML file, since v1.8)

/**/

