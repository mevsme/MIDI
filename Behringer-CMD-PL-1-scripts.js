////////////////////////////////////////////////////////////////////////
// JSHint configuration                                               //
////////////////////////////////////////////////////////////////////////
/* global engine                                                      */
/* global script                                                      */
/* global print                                                       */
/* global midi                                                        */
////////////////////////////////////////////////////////////////////////

var CMDPL = {};

//0x90, 0x91 0x92 0x93 - channels LEDs, rotary red light
//0xA0 - rotary doesn't have channels
//TODO: changeDeck to currentChannel 
//Dokuwiki глянути чи є спойлер і внести дані про Скпатч що там інт
//Запиляти змінні і функції що запам'ятовуються значення лампочок крутілок//
//TODO перевірки на від'ємні локації для hot cue
//ЕЩВЩ перевірку на пітч, щоб не опускалось нуля
//TODO groupto deck good idea внести в статтю про бес практики
// є баг з першим скретчом
//замутити пхп скрипт що генерує іксемелку
//key init into globals and run through 'for'
//винести фактори в глобальні
//пофіксити прикол з джогом

CMDPL.g = {
    'channels'        : ['[Channel1]', '[Channel2]', '[Channel3]', '[Channel4]'],
    'currentChannel'  : '[Channel1]',
    'shiftStatus'     : [false, false, false, false],
    'rotary_led': [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 1]
    ],
    'rotary_circle': [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [8, 8, 8, 8],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [8, 8, 8, 8]
    ],
    'scratch_button': [false, false, false, false],
    'sliderValue'   : [62, 62, 62, 62],
};
//CMDPL.g.channels
CMDPL.init = function (id) {
    CMDPL.g.id = id;
    
    for (var c = 0; c <= 3; c++) {
        for (var i = 1; i <= 256; i++) {
            midi.sendShortMsg(0x90 + c, i, 0x00);
            midi.sendShortMsg(0xB0 + c, i, 0x00);  
            midi.sendShortMsg(0xB0 + c, 0x0A, 0x08);        
        } 
        
        // Pitch on middle
        //midi.sendShortMsg(0x91, 0x03, 0x01);   
        midi.sendShortMsg(0xB1, 0x03, 0x08);
    }
    
    midi.sendShortMsg(0xB0, 0x04, 0x08); midi.sendShortMsg(0x90, 0x04, 0x01); // Key change init
    midi.sendShortMsg(0xB0, 0x07, 0x08); midi.sendShortMsg(0x90, 0x07, 0x01); // Super1 change init
    
    //connect LEDs
    for (var i = 0; i <= 3; i++ ) {
        engine.connectControl(CMDPL.g.channels[i],'rate'            ,'CMDPL.rateLED');
        engine.connectControl(CMDPL.g.channels[i],'play'            ,'CMDPL.LED');
        engine.connectControl(CMDPL.g.channels[i],'scratch2_enable' ,'CMDPL.LED');
        engine.connectControl(CMDPL.g.channels[i],'cue_default'     ,'CMDPL.LED');
        //engine.connectControl(CMDPL.g.channels[i],'cue_indicator'   ,'CMDPL.LED');
        engine.connectControl(CMDPL.g.channels[i],'loop_enabled'    ,'CMDPL.LED');
        engine.connectControl(CMDPL.g.channels[i],'keylock'         ,'CMDPL.LED');
        engine.connectControl(CMDPL.g.channels[i],'slip_enabled'    ,'CMDPL.LED');
        engine.connectControl(CMDPL.g.channels[i],'hotcue_1_enabled','CMDPL.LED2');
        engine.connectControl(CMDPL.g.channels[i],'hotcue_2_enabled','CMDPL.LED2');
        engine.connectControl(CMDPL.g.channels[i],'hotcue_3_enabled','CMDPL.LED2');
        engine.connectControl(CMDPL.g.channels[i],'hotcue_4_enabled','CMDPL.LED2');
        engine.connectControl(CMDPL.g.channels[i],'loop_in'         ,'CMDPL.LED2');
        engine.connectControl(CMDPL.g.channels[i],'loop_out'        ,'CMDPL.LED2');
    } 
    //midi.sendShortMsg(0x90, 0x14, 1);
}

CMDPL.changeDeck = function(channel) {
    CMDPL.g.currentChannel = CMDPL.g.channels[channel];
    CMDPL.lightRotaries(channel);
    print('__CMDPL.changeDeck() = ' + CMDPL.g.currentChannel);
    
}
 
CMDPL.shutdown = function() {
   print('shutdown');
}

CMDPL.getChannelN = function(value) {
    switch (value) {
        case '[Channel1]': return 0;
        case '[Channel2]': return 1;
        case '[Channel3]': return 2;
        case '[Channel4]': return 3;
        default: print("CMDPL.getChannelN Error");
    }
}

CMDPL.eqLed = function (value, group, control) {
    value = (((value - 0) * (15 - 1)) / (4 - 0)) + 1
    midi.sendShortMsg(0xB0 + CMDPL.getChannelN(group), 0x0A, value);
}

CMDPL.rateLED = function (value, group, control) {
    value = script.absoluteLin(value, 1, 15, -1, 1);
    midi.sendShortMsg(0xB0 + CMDPL.getChannelN(group), 0x0A, value);
}

CMDPL.LED = function (value, group, control) {
    var ctrl;
    switch (control) {
        case 'loop_enabled':     ctrl = 0x14; break;
        case 'slip_enabled':     ctrl = 0x17; break;
        case 'keylock':          ctrl = 0x19; break;
        case 'cue_indicator':    ctrl = 0x22; break;
        case 'play':             ctrl = 0x23; break;
        case 'scratch2_enable':  ctrl = 0x1B; break;
        default: print('CMDPL.LED Error');
    }
    midi.sendShortMsg(0x90 + CMDPL.getChannelN(group), ctrl, value);
}

CMDPL.LED2 = function (value, group, control) {
    var ctrl;
    switch (control) {
        case 'hotcue_1_enabled': ctrl = 0x10; break;
        case 'hotcue_2_enabled': ctrl = 0x11; break;
        case 'hotcue_3_enabled': ctrl = 0x12; break;
        case 'hotcue_4_enabled': ctrl = 0x13; break;
        case 'loop_in':          ctrl = 0x15; break;
        case 'loop_out':         ctrl = 0x16; break;
        default: print('CMDPL.LED2 Error');
    }
    midi.sendShortMsg(0x90 + CMDPL.getChannelN(group), ctrl, value);
        
    //This function keeps rotaries lights correspond to channels
    CMDPL.lightRotaries(CMDPL.getChannelN(group));
}

CMDPL.lightRotaries = function(deck) {
    for (var i = 0; i < 8; i++) {midi.sendShortMsg(0x90, i, CMDPL.g.rotary_led[i][deck])}; 
    for (var i = 0; i < 8; i++) {midi.sendShortMsg(0xB0, i, CMDPL.g.rotary_circle[i][deck])}; 
}

CMDPL.shift = function(channel, control, value) {
    if (value === 127) {
        if (!CMDPL.g.shiftStatus[channel]) { //Press SHIFT (LOAD)
            midi.sendShortMsg(0x90 + channel, 0x18, 0x01); //LOAD
            midi.sendShortMsg(0x90 + channel, 0x19, 0x02); //LOCK
            
            midi.sendShortMsg(0x90 + channel, 0x10, 0x02); 
            midi.sendShortMsg(0x90 + channel, 0x11, 0x02); 
            midi.sendShortMsg(0x90 + channel, 0x12, 0x02); 
            midi.sendShortMsg(0x90 + channel, 0x13, 0x02); 
            midi.sendShortMsg(0x90 + channel, 0x14, 0x02); 
            midi.sendShortMsg(0x90 + channel, 0x15, 0x02); 
            midi.sendShortMsg(0x90 + channel, 0x16, 0x02); 
            midi.sendShortMsg(0x90 + channel, 0x17, 0x02); 
            
            midi.sendShortMsg(0x90 + channel, 0x04, 0x00); 
            midi.sendShortMsg(0x90 + channel, 0x07, 0x00); 
            midi.sendShortMsg(0xB0, 0x04, 0x00); 
            midi.sendShortMsg(0xB0, 0x07, 0x00); 
            
            CMDPL.g.shiftStatus[channel] = true;
        } else {
            midi.sendShortMsg(0x90 + channel, 0x18, 0x00); //LOAD
            
             engine.trigger(CMDPL.g.currentChannel, 'hotcue_1_enabled'); 
             engine.trigger(CMDPL.g.currentChannel, 'hotcue_2_enabled'); 
             engine.trigger(CMDPL.g.currentChannel, 'hotcue_3_enabled'); 
             engine.trigger(CMDPL.g.currentChannel, 'hotcue_4_enabled'); 
             engine.trigger(CMDPL.g.currentChannel, 'loop_in'); 
             engine.trigger(CMDPL.g.currentChannel, 'loop_out'); 
             engine.trigger(CMDPL.g.currentChannel, 'loop_enabled'); 
             engine.trigger(CMDPL.g.currentChannel, 'keylock'); 
             engine.trigger(CMDPL.g.currentChannel, 'slip_enabled'); 
            
            CMDPL.g.shiftStatus[channel] = false;
        }
    }
}

CMDPL.pressButton  = function (channel, action, value, toggle, fireOnRelease, cvalue) {
    var state = 1;
    if (toggle === 'toggle') {
        state = engine.getValue(CMDPL.g.currentChannel, action);
        if (state === 1) state = 0;
        else state = 1;
    }
    
    if (cvalue === undefined) cvalue = state;
    if (value === 127) {
        engine.setValue(CMDPL.g.currentChannel, action, cvalue);
    } else {
        if (fireOnRelease === 'fireOnRelease') {
            engine.setValue(CMDPL.g.currentChannel, action, 0);
        }
    }
}

CMDPL.saveRotaryLightState = function (what, channel, address, status) {
    if (what) {
        CMDPL.g.rotary_led[address][channel] = status;
    } else {
        CMDPL.g.rotary_circle[address][channel] = status;
    }
}

CMDPL.button = function (channel, control, value, status, group) {
    channel = CMDPL.getChannelN(CMDPL.g.currentChannel);
    switch (control) {
        case 0: 
            if (!CMDPL.g.shiftStatus[channel]) {
                CMDPL.pressButton(channel, 'hotcue_1_clear', value);
                CMDPL.saveRotaryLightState(true, channel, 0, 0x00);
            } else {
                CMDPL.EQKill(value, 'button_parameter3');
            }
            break;
        case 1: 
            if (!CMDPL.g.shiftStatus[channel]) {
                CMDPL.pressButton(channel, 'hotcue_2_clear', value);
                CMDPL.saveRotaryLightState(true, channel, 1, 0x00);
            } else {
                CMDPL.EQKill(value, 'button_parameter2');
            }
            break;
        case 2: 
            if (!CMDPL.g.shiftStatus[channel]) {
                CMDPL.pressButton(channel, 'hotcue_3_clear', value);
                CMDPL.saveRotaryLightState(true, channel, 2, 0x00);
            } else {
                CMDPL.EQKill(value, 'button_parameter1');
            }
            break;
        case 3: 
            if (!CMDPL.g.shiftStatus[channel]) {
                CMDPL.pressButton(channel, 'hotcue_4_clear', value);
                CMDPL.saveRotaryLightState(true, channel, 3, 0x00);
            } else {
                // Nothing here
            }
            break;
        case 5: 
            if (!CMDPL.g.shiftStatus[channel]) {
                CMDPL.pressButton(channel, 'loop_start_position', value, 'no', 'no', -1);
                CMDPL.saveRotaryLightState(true, channel, 5, 0x00);
                midi.sendShortMsg(0x90, 0x05, 0x00);
            } else {
                // Nothing here
            }
            break;
        case 6: 
            if (!CMDPL.g.shiftStatus[channel]) {
                CMDPL.pressButton(channel, 'loop_end_position', value, 'no', 'no', -1);
                CMDPL.saveRotaryLightState(true, channel, 6, 0x00);
                midi.sendShortMsg(0x90, 0x06, 0x00);
            } else {
                // Nothing here
            }
            break;
            
        // BUTTONS 1-8    
        case 16: 
            if (!CMDPL.g.shiftStatus[channel]) {
                CMDPL.pressButton(channel, 'hotcue_1_activate', value, 'no', 'fireOnRelease');
                CMDPL.saveRotaryLightState(true, channel, 0, 0x01);
            } else {
                CMDPL.pressButton(channel, 'beats_translate_curpos', value, 'no', 'fireOnRelease');
            }
            break;
        case 17: 
            if (!CMDPL.g.shiftStatus[channel]) {
                CMDPL.pressButton(channel, 'hotcue_2_activate', value, 'no', 'fireOnRelease');
                CMDPL.saveRotaryLightState(true, channel, 1, 0x01);
            } else {
                CMDPL.pressButton(channel, 'quantize', value, 'toggle');
            }
            break;
        case 18: 
            if (!CMDPL.g.shiftStatus[channel]) {
                CMDPL.pressButton(channel, 'hotcue_3_activate', value, 'no', 'fireOnRelease');
                CMDPL.saveRotaryLightState(true, channel, 2, 0x01);
            } else {
                CMDPL.pressButton(channel, 'repeat', value, 'toggle');
            }
            break;
        case 19: 
            if (!CMDPL.g.shiftStatus[channel]) {
                CMDPL.pressButton(channel, 'hotcue_4_activate', value, 'no', 'fireOnRelease');
                CMDPL.saveRotaryLightState(true, channel, 3, 0x01);
            } else {
                // Nothing here
            }
            break;
            
        case 20: 
            if (!CMDPL.g.shiftStatus[channel]) {
                CMDPL.pressButton(channel, 'reloop_exit', value, 'no', 'fireOnRelease');
            } else {
                CMDPL.pressButton(channel, 'start', value);
                
            }
            break;
        case 21: 
            if (!CMDPL.g.shiftStatus[channel]) {
                CMDPL.pressButton(channel, 'loop_in', value, 'no', 'fireOnRelease');
                CMDPL.saveRotaryLightState(true, channel, 5, 0x01);
            } else {
                // Nothing here
            }
            break;
        case 22: 
            if (!CMDPL.g.shiftStatus[channel]) {
                CMDPL.pressButton(channel, 'loop_out', value, 'no', 'fireOnRelease');
                CMDPL.saveRotaryLightState(true, channel, 6, 0x01);
            } else {
                // Nothing here
            }
            break;
        case 23:
            if (!CMDPL.g.shiftStatus[channel]) {
                CMDPL.pressButton(channel, 'slip_enabled', value, 'no', 'fireOnRelease');
            }
            break;
            
            
        case 25: 
            if (!CMDPL.g.shiftStatus[channel]) {
                CMDPL.pressButton(channel, 'rate', value, 'no', 'no', 0);
            } else {
                CMDPL.pressButton(channel, 'keylock', value, 'toggle');
            }
            break;
            
        case 34: //CUE 
            CMDPL.pressButton(channel, 'cue_default', value, 'toggle', 'fireOnRelease');
            break;    
        case 35: //PLAY 
            CMDPL.pressButton(channel, 'play', value, 'toggle');
            break; 

        default: break;
    }
}

CMDPL.tapButton = function(deck) {
    var now = new Date()/1000;   // Current time in seconds
    var tapDelta = now - bpm.tapTime;
    bpm.tapTime = now;
    if (tapDelta > 2.0) { // reset if longer than two seconds between taps
        bpm.tap = [];
        return;
    }
    bpm.tap.push(60/tapDelta);
    if (bpm.tap.length > 8) bpm.tap.shift();  // Keep the last 8 samples for averaging
    var sum = 0;
    for (var i = 0; i < bpm.tap.length; i++) {
        sum += bpm.tap[i];
    }
    var average = sum/bpm.tap.length;
    
    engine.setValue("[Channel"+deck+"]", "bpm", average);
}

CMDPL.buttonTap = function (channel, control, value, status, group) {
    var deck = channel + 1;
    if (value === 0x7F) {
        CMDPL.tapButton(deck);
    }
}

CMDPL.rate = function (channel, control, value, status, group) {
    var rate = engine.getValue(CMDPL.g.currentChannel, 'rate');
    var new_rate = 0;
    if (!CMDPL.g.shiftStatus[channel]) {
        engine.softTakeover(CMDPL.g.currentChannel, 'rate', false);
        var tick = 0.015748031;
        if (value !== CMDPL.g.sliderValue[channel]) {
            var lambda = value - CMDPL.g.sliderValue[channel];
            
            if (lambda >= 1) {
                new_rate = rate + tick * Math.abs(lambda);
            } else if (lambda <= -1) {
                new_rate = rate - tick * Math.abs(lambda);
            } 
            engine.setValue(CMDPL.g.currentChannel, 'rate', new_rate);
        }
        CMDPL.g.sliderValue[channel] = value;
    } else {
        engine.softTakeover(CMDPL.g.currentChannel, 'rate', true);
        new_rate = script.absoluteLin(value, -1, 1);
        engine.setValue(CMDPL.g.currentChannel, 'rate', new_rate);
    }
}

CMDPL.wheelTurn = function (channel, control, value, status, group) {
    var channel = channel + 1;
    var newValue = value - 64;
    if (engine.isScratching(channel)) {
        engine.scratchTick(channel, newValue); // Scratch!
    } else {
        engine.setValue(CMDPL.g.currentChannel, 'jog', newValue); // Pitch bend
    }
}

CMDPL.wheelTouch = function (channel, control, value, status, group) {
    var channel = channel + 1;
    if (control === 0x1B) {
        if (value === 127) {
            CMDPL.g.scratch_button[CMDPL.getChannelN(group)] = true;
        } else {
            CMDPL.g.scratch_button[CMDPL.getChannelN(group)] = false;
            engine.scratchDisable(channel);
        }
    }

    if ((status & 0xF0) === 0x90 || CMDPL.g.scratch_button[CMDPL.getChannelN(group)]) {    // If button down
        //if (value === 0x7F) {  // Some wheels send 0x90 on press and release, so you need to check the value
            var alpha = 0.225;
            var beta = 0.0039;
            engine.scratchEnable(channel, 128, 33+1/3, alpha, beta);
       //}
    } else {    // If button up
        if (!CMDPL.g.scratch_button[CMDPL.getChannelN(group)]) {
            engine.scratchDisable(channel);
        }
    }
} 

CMDPL.changeKey = function (channel, control, value, status) {
    var pitch = Math.round(engine.getValue(CMDPL.g.currentChannel, 'pitch')); // 0.00001
    var led;
    if (status == 0xB0 && value == 0x41) {
        pitch++;
        engine.setValue(CMDPL.g.currentChannel, 'pitch', pitch);
        led = pitch + 8;
        CMDPL.saveRotaryLightState(false, channel, 0x04, led);
        midi.sendShortMsg(0xB0, control, led);
    } else if (status == 0xB0 && value == 0x3F) {
        pitch--;
        engine.setValue(CMDPL.g.currentChannel, 'pitch', pitch);
        led = pitch + 8;
        CMDPL.saveRotaryLightState(false, channel, 0x04, led);
        midi.sendShortMsg(0xB0, control, led);
    }
    
    if (status == 0x90) {
        engine.setValue(CMDPL.g.currentChannel, 'pitch', 0);
        CMDPL.saveRotaryLightState(false, channel, 0x04, 0x08);
        midi.sendShortMsg(0xB0, control, 0x08);
    }
}

CMDPL.globalFX = function (channel, control, value, status) {
    var super1 = Math.round(engine.getValue('[QuickEffectRack1_'+CMDPL.g.currentChannel+']', 'super1') * 10000); // 0.00001
    var factor = 350;
    var led;
    
    if (status == 0xB0 && value == 0x41) {
        super1 = (super1 + factor) / 10000;
        engine.setValue('[QuickEffectRack1_'+CMDPL.g.currentChannel+']', 'super1', super1);
        led = script.absoluteLin(super1, 1, 16, 0, 1);
        CMDPL.saveRotaryLightState(false, channel, 0x07, led);
        midi.sendShortMsg(0xB0, control, led);
    } else if (status == 0xB0 && value == 0x3F) {
        super1 = (super1 - factor) / 10000;
        led = script.absoluteLin(super1, 1, 16, 0, 1);
        engine.setValue('[QuickEffectRack1_'+CMDPL.g.currentChannel+']', 'super1', super1);
        CMDPL.saveRotaryLightState(false, channel, 0x07, led);
        midi.sendShortMsg(0xB0, control, led);
    }
    
    if (status == 0x90) {
        engine.setValue('[QuickEffectRack1_'+CMDPL.g.currentChannel+']', 'super1', 0.5);
        CMDPL.saveRotaryLightState(false, channel, 0x07, 0x08);
        midi.sendShortMsg(0xB0, control, 0x08);
    }
}
 
/*
CMDPL.LEDfromLoopLength = function (length) {
    var LED;
    //print(pitch);
    switch (length) {
        case 64: LED = 0x0D; break;
        case 32: LED = 0x0C; break;
        case 16: LED = 0x0B; break;
        case 8: LED = 0x0A; break;
        case 4: LED = 0x09; break;
        case 2: LED = 0x08; break;
        case 1: LED = 0x07; break;
        case 0.5: LED = 0x06; break;
        case 0.25: LED = 0x05; break;
        case 0.125: LED = 0x04; break;
        case 0.0625: LED = 0x03; break;
        case 0.03125: LED = 0x02; break;
        default: LED = 0x04;
    }
    return LED;
}

CMDPL.beatloop = function (channel, control, value, status, group) {
    if (status == 0x90) {
        if (!CMDPL.g.loopIsActive) {
            engine.setValue(CMDPL.g.currentChannel, 'beatloop_' + CMDPL.g.loopLength + '_activate', 1);
            CMDPL.g.loopIsActive = true;
            midi.sendShortMsg(0x90, control, 0x01);
            print('beatlooproll 1');
        } else {
            engine.setValue(CMDPL.g.currentChannel, 'reloop_exit', 1);
            CMDPL.g.loopIsActive = false;
            midi.sendShortMsg(0x90, control, 0x00);
            
            CMDPL.g.loopLeftLocatorIsActive  = false;
            CMDPL.g.loopRightLocatorIsActive = false;
        engine.setValue(CMDPL.g.currentChannel, 'loop_in', 0);
        engine.setValue(CMDPL.g.currentChannel, 'loop_out', 0);
            midi.sendShortMsg(0x90, ++control, 0x00);
        }
    }
     
    CMDPL.loopLengthFunc(channel, control, value, status, group);
}

CMDPL.loopinout = function (channel, control, value, status, group) {
    if (status == 0x90) {
        if (!CMDPL.g.loopLeftLocatorIsActive && !CMDPL.g.loopIsActive) {
            engine.setValue(CMDPL.g.currentChannel, 'loop_in', 1);
            
            CMDPL.g.loopLeftLocatorIsActive = true;
        } else {
            engine.setValue(CMDPL.g.currentChannel, 'loop_out', 1);
            
            CMDPL.g.loopRightLocatorIsActive = true;
            midi.sendShortMsg(0x90, control, 0x01);
        }
    }
    
    if (CMDPL.g.loopLeftLocatorIsActive && CMDPL.g.loopRightLocatorIsActive) {
        CMDPL.g.loopIsActive = true;
        engine.setValue(CMDPL.g.currentChannel, 'loop_in', 0);
        engine.setValue(CMDPL.g.currentChannel, 'loop_out', 0);
    }
    
    
    CMDPL.loopLengthFunc(channel, control, value, status, group);
}

*/

CMDPL.rotary = function (channel, control, value, status, group) {
        print("__control: ");
        print("__channel: " + channel);
        print("__group: " + group);
    channel = CMDPL.getChannelN(CMDPL.g.currentChannel);
    
    if (CMDPL.g.shiftStatus[channel]) {
        switch (control) {
            case 0x00:
                CMDPL.FX(value, 'parameter3');
                break;
            case 0x01:
                CMDPL.FX(value, 'parameter2');
                break;
            case 0x02:
                CMDPL.FX(value, 'parameter1');
                break;
            case 0x03: // GAIN
                var gain = engine.getValue(CMDPL.g.currentChannel, 'pregain') * 100;
                print("__gain: " + gain)
                if (value === 0x41) {
                    gain = (gain + 5) / 100
                    engine.setValue(CMDPL.g.currentChannel, 'pregain', gain);
                } else if (value === 0x3f) {
                    gain = (gain - 5) / 100
                    engine.setValue(CMDPL.g.currentChannel, 'pregain', gain);
                }
                print("__channel current: " + CMDPL.g.currentChannel);
                break;
                
            case 0x04: // MOVE GREAD
                if (value === 0x41) {
                    
                    engine.setValue(CMDPL.g.currentChannel, 'beats_translate_later', 1);
                } else if (value === 0x3f) {
                    engine.setValue(CMDPL.g.currentChannel, 'beats_translate_earlier', 1);
                }
                print("__channel current: " + CMDPL.g.currentChannel);
                break;
        }
    } else {
        switch (control) {
            case 0x04: CMDPL.changeKey(channel, control, value, status); break;
            case 0x05: CMDPL.positionChange(value, 'loop_start_position'); break;
            case 0x06: CMDPL.positionChange(value, 'loop_end_position'); break;
            case 0x07: CMDPL.globalFX(channel, control, value, status); break;

            case 0x00: CMDPL.positionChange(value, 'hotcue_1_position'); break;
            case 0x01: CMDPL.positionChange(value, 'hotcue_2_position'); break;
            case 0x02: CMDPL.positionChange(value, 'hotcue_3_position'); break;
            case 0x03: CMDPL.positionChange(value, 'hotcue_4_position'); break;

        }
    }
    
}

CMDPL.positionChange = function (value, parameter) {
    var new_position;
    var precision = 200;
    var position = engine.getValue(CMDPL.g.currentChannel, parameter);
    if (-1 !== engine.getValue(CMDPL.g.currentChannel, parameter)) {
        if (value === 0x41) {
            engine.setValue(CMDPL.g.currentChannel, parameter, position + precision);
            print("__position: " + position);
        } else if (value === 0x3F) {
            new_position = position - precision;
            if (new_position <= 0) new_position = 0;
            engine.setValue(CMDPL.g.currentChannel, parameter, new_position);
            print("__position: " + position);
        };
    }
}


CMDPL.FX = function (value, parameter) {
    var precision = 100;
    var step      = 5;
    var amount = engine.getValue('[EqualizerRack1_'+CMDPL.g.currentChannel+'_Effect1]', parameter) * precision;
    if (value === 0x41) {
        amount = (amount + step) / precision;
        print("FIRE");
        engine.setValue('[EqualizerRack1_'+CMDPL.g.currentChannel+'_Effect1]', parameter, amount);
    } else if (value === 0x3f) {
        amount = (amount - step) / precision;
        engine.setValue('[EqualizerRack1_'+CMDPL.g.currentChannel+'_Effect1]', parameter, amount);
    }
}

CMDPL.EQKill = function (value, parameter) {
    if (value === 127) {
        if (engine.getValue('[EqualizerRack1_'+CMDPL.g.currentChannel+'_Effect1]', parameter)) {
            engine.setValue('[EqualizerRack1_'+CMDPL.g.currentChannel+'_Effect1]', parameter, 0)
        } else {
            engine.setValue('[EqualizerRack1_'+CMDPL.g.currentChannel+'_Effect1]', parameter, 1)
        }
    }
    
}