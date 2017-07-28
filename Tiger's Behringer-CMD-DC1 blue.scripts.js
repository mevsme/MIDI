function cmddc1 () {}
// Behringer CMD DC-1 Midi interface script for Mixxx Software
// Author  : Tiger <tiger@braineed.org> / Tiger #Mixxx@irc.freenode.net
// Version : 0.1.0

// Default channel of this device
// We substitute 1 because count starts from 0 (See MIDI specs)
cmddc1.defch = 6-1;

cmddc1.LEDCmd = 0x90; // Command Byte : Note On
cmddc1.LEDOff = 0x01; // LEDs can't be turned off, the Off status is LEDs to Orange/Amber color
cmddc1.LEDBlue = 0x00;
cmddc1.LEDBlueBlink = 0x02;

cmddc1.encLeft = 0x3F;
cmddc1.encRight = 0x41;

cmddc1.encLEDMid = 0x08;
cmddc1.encLEDOff = 0x00;
cmddc1.encLEDCnt = 16; // Ring of 15 LEDs -> 16 for round maths, special handling for max
cmddc1.encLEDUnit = 1/cmddc1.encLEDCnt;
cmddc1.encLEDCmd = 0xB0; // Command byte : Continuous Controller (CC)


cmddc1.FXCtrlCnt = 4;
cmddc1.FXCtrlStart = 0x14;

// Stores the physicals controls addresses with their affected effect parameters string
// Example : '[EffectRack1_EffectUnitX].super1': 0x14
cmddc1.FXControls = {};

// Stores the physicals controls addresses with their affected special effects and parameters string
cmddc1.SFXControls = {
    "0x10":"[Channel1].pitch_adjust",
    "0x11":"[QuickEffectRack1_[Channel1]].super1",
    "0x12":"[QuickEffectRack1_[Channel2]].super1",
    "0x13":"[Channel2].pitch_adjust"
};

// Decks count
cmddc1.deckCnt = 4;

// Stores the active cue mode
// 0 => Set cue ; 1 => Goto Cue ; -1 => Clear cue
cmddc1.cueMode = undefined;

// Cue mode physical control addresses
cmddc1.playCueCtrl = 0x15;
cmddc1.gotoCueCtrl = 0x16;
cmddc1.clearCueCtrl = 0x17;

// Stores the status of the decks
cmddc1.deckStatus = {};
// Decks physical controls addresses (used of LEDs initialization only)
cmddc1.deckControls = [ 0x00 , 0x03, 0x04, 0x07 ];

// Physical controls related to cues buttons
cmddc1.CUECnt = 16;
cmddc1.CUESStartCtrl = 0x24;
cmddc1.CUESStopCtrl = 0x33;

// Stores the physicals controls addresses of hotcues and their affected functions
// Example : '0x58': hotcue_5_set
cmddc1.CUESetControls = {};
cmddc1.CUEGotoControls = {};
cmddc1.CUEClearControls = {};


/*
 * Initialize decks LEDs
 */
cmddc1.initDecksLEDs = function() {
    for(var i=0; i < cmddc1.deckCnt; i++ ) {
        midi.sendShortMsg(cmddc1.defch | cmddc1.LEDCmd, cmddc1.deckControls[i], cmddc1.LEDOff);
    }
};

/*
 * Initialize decks status for active mode
 */
cmddc1.initDecksStatus = function() {
    for(var i=1; i <= cmddc1.deckCnt; i++) {
        cmddc1.deckStatus[i] = false;
    }
    cmddc1.initDecksLEDs();
};

/*
 * Add/Set deck for cue mode
 */
cmddc1.enableDeck = function(channel, control, value, status, group) {
    var deck = group.substring( (group.length - 2), (group.length - 1));
    
    cmddc1.deckStatus[deck] ^= true;
    
    midi.sendShortMsg(cmddc1.defch | cmddc1.LEDCmd,
                      control,
                      (cmddc1.deckStatus[deck] == true ? cmddc1.LEDBlueBlink : cmddc1.LEDOff)
         );
};

/*
 * Affect the hotcues to their respective physical control addresses
 */
cmddc1.initCUEControls = function() {
    var cuectrl = cmddc1.CUESStartCtrl;
    
    for(var i=1; i <= cmddc1.CUECnt; i++) {
        cmddc1.CUESetControls[cuectrl] = "hotcue_"+i+"_set";
        cmddc1.CUEGotoControls[cuectrl] = "hotcue_"+i+"_goto";
        cmddc1.CUEClearControls[cuectrl] = "hotcue_"+i+"_clear";
        cuectrl++;
    }
};

/*
 * 
 */
cmddc1.initCueMode = function() {
    midi.sendShortMsg(cmddc1.defch | cmddc1.LEDCmd, cmddc1.playCueCtrl, cmddc1.LEDOff);
    midi.sendShortMsg(cmddc1.defch | cmddc1.LEDCmd, cmddc1.gotoCueCtrl, cmddc1.LEDOff);
    midi.sendShortMsg(cmddc1.defch | cmddc1.LEDCmd, cmddc1.clearCueCtrl, cmddc1.LEDOff);
    cmddc1.cueMode = undefined;
}

/*
 * 
 */
cmddc1.cueMode = function(channel, control, value, status, group) {
    
    cmddc1.initCueMode();
    
    switch(control) {
        case cmddc1.playCueCtrl:
            cmddc1.cueMode = "play";
            break;
        case cmddc1.gotoCueCtrl:
            cmddc1.cueMode = "goto";
            break;
        case cmddc1.clearCueCtrl:
            cmddc1.cueMode = "clear";
            break;
        default:
            cmddc1.cueMode = undefined;
            break;
    }
    
    if(cmddc1.cueMode !== undefined) {
        midi.sendShortMsg(cmddc1.defch | cmddc1.LEDCmd, control, cmddc1.LEDBlueBlink);
    }
};

/*
 * Set/Clear/Goto the cues on selected decks and under mode "Focus"
 */
cmddc1.setCues = function(channel, control, value, status, group) {
    if(cmddc1.cueMode !== undefined) {
        var changrp="[Channel";
        
        for(var i=1; i <= cmddc1.deckCnt; i++) {
            if(cmddc1.deckStatus[i] == true) {
                switch(cmddc1.cueMode) {
                    case "play":
                        engine.setValue(changrp+i+"]", cmddc1.CUESetControls[control], value);
                        break;
                    case "goto":
                        engine.setValue(changrp+i+"]", cmddc1.CUEGotoControls[control], value);
                        break;
                    case "clear":
                        engine.setValue(changrp+i+"]", cmddc1.CUEClearControls[control], value);
                        break;
                    default:
                        break;
                }
            }
        }
    }
};

/*
 * Turn to default color (orange) all LEDs and turn Off all encoders LEDs rings
 */
cmddc1.initLEDs = function() {
    // Turn into orange all buttons LEDs
    for(var i=0x00; i <= 0x33; i++)
        midi.sendShortMsg(cmddc1.defch | cmddc1.LEDCmd, i, cmddc1.LEDOff);
    
    // Turn off all encoders ring of LEDs 
    for(var i=0x10; i <= 0x17; i++)
        midi.sendShortMsg(cmddc1.defch | cmddc1.encLEDCmd, i, cmddc1.encLEDOff);
};

/*
 * Encoders handle for effect parameters
 */
cmddc1.encoderFXParam = function(channel, control, value, status, group) {
    // Get the parameter and its number
    var param = group.split(".");
    
    // Grab the current parameter value
    var fxreal = engine.getParameter(param[0], param[1]);
    
    // Increment the effect parameter value
    if(value == cmddc1.encRight) {
        fxreal += (fxreal == 1 ? 0 : cmddc1.encLEDUnit);
        engine.setParameter(param[0], param[1], fxreal);
    }
    
    // Decrement the effect parameter value
    if(value == cmddc1.encLeft) {
        fxreal -= (fxreal == 0 ? 0 : cmddc1.encLEDUnit);
        engine.setParameter(param[0], param[1], fxreal);
    }
};

/*
 * Convert an effect parameter value to the LED ring encoder scale
 */
cmddc1.encoderParamLEDValue = function(group, param) {
    var val = script.absoluteLinInverse(engine.getParameter(group, param), 0, 1, 1, cmddc1.encLEDCnt);
    if( val == cmddc1.encLEDCnt ) {
        val--; // Truncate the max value
    }
    return val;
};

/*
 * Turn on any encoder LED for a given value
 * connectControled function
 */
cmddc1.encoderFXLitLED = function(value, group, control) {
    // Bright the corresponding LED(s)
    midi.sendShortMsg(cmddc1.defch | cmddc1.encLEDCmd,
                        cmddc1.FXControls[group+"."+control],
                        cmddc1.encoderParamLEDValue(group, control)
                        );
};


/*
 * Initialize FX related variables and connectControl the effects parameters
 */
cmddc1.connectFXEncoders = function() {
    var fxunit = 1;
    var fxctrl = cmddc1.FXCtrlStart;
    
    var grpref = "[EffectRack1_EffectUnit";
    var grpara = "super1";
    
    for(var i=1; i <= cmddc1.FXCtrlCnt; i++) {
        cmddc1.FXControls[grpref+i+"]."+grpara] = fxctrl;
        engine.connectControl(grpref+i+"]", grpara, "cmddc1.encoderFXLitLED");
        engine.trigger(grpref+i+"]", grpara);
        fxctrl++;
    }
};


/*
 * Initialize Special FX related variables and connectControl the effects parameters
 */
cmddc1.connectSFXEncoders = function() {
    for(var sfxctrl in cmddc1.SFXControls) {
        var sfxgrparam = cmddc1.SFXControls[sfxctrl].split(".");
        // Add an entry and affect a physical control address to the parameter string
        // A virtual line is added with same control for compatibility with encoderFXLitLED()
        cmddc1.FXControls[cmddc1.SFXControls[sfxctrl]] = sfxctrl;
        
        engine.connectControl(sfxgrparam[0], sfxgrparam[1], "cmddc1.encoderFXLitLED");
        // Init LEDs of SFX Encoders
        engine.trigger(sfxgrparam[0], sfxgrparam[1]);
    }
};


/*** Constructor ***/
cmddc1.init = function() {
    cmddc1.initLEDs();
    cmddc1.connectFXEncoders();
    cmddc1.connectSFXEncoders();
    cmddc1.initDecksStatus();
    cmddc1.initCUEControls();
};

/*** Destructor ***/
cmddc1.shutdown = function() {
    cmddc1.initLEDs();
};
