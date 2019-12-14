var CMDPL = new Object();

//0x90, 0x91 0x92 0x93 - channels LEDs, rotary red light
//0xA0 - rotary doesn't have channels
//TODO: changeDeck to cGroup 
//Dokuwiki глянути чи є спойлер і внести дані про Скпатч що там інт
//Запиляти змінні і функції що запам'ятовуються значення лампочок крутілок//
//TODO перевірки на від'ємні локації для hot cue
//ЕЩВЩ перевірку на пітч, щоб не опускалось нуля
//TODO groupto deck good idea внести в статтю про бес практики
// є баг з першим скретчом
//key init into globals and run through 'for'
//винести фактори в глобальні
//пофіксити прикол з джогом

CMDPL.g = {
    'channels'        : ['[Channel1]', '[Channel2]', '[Channel3]', '[Channel4]'],
    'cGroup'  : '[Channel1]',
    'shiftStatus'     : [false, false, false, false],
    'rotary_led': [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    'rotary_circle': [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    //'scratch_button': [false, false, false, false],
    //'sliderValue'   : [62, 62, 62, 62],
    'invertJogs'    : true,
};




//CMDPL.g.invertJogs
CMDPL.init = function (id) {
	
	CMDPL.shift = [false, false, false, false];
	CMDPL.chList = ['[Channel1]', '[Channel2]', '[Channel3]', '[Channel4]'];
	CMDPL.cGroup = '[Channel1]';
	
	CMDPL.beat_size = [0.5, 1, 2, 4, 8, 16, 32, 64, 128];
	CMDPL.beat_size_pos = 3;
	CMDPL.loop_size = [0.25, 0.5, 1, 2, 4, 8, 16, 32, 64, 128];
	CMDPL.loop_size_pos = 3;
	
	CMDPL.syncTimer;
	CMDPL.syncLongPress = false;
	
	CMDPL.permaScratch = [false, false, false, false, ];
	CMDPL.rpm = 33+1/8;
	CMDPL.alpha = 1/2;
	CMDPL.beta  = CMDPL.alpha/32;
	
	
	
    for (var c = 0; c <= 3; c++) {
        for (var i = 1; i <= 256; i++) {
            //midi.sendShortMsg(0x90 + c, i, 0x00);
            //midi.sendShortMsg(0xB0 + c, i, 0x00);  
            //midi.sendShortMsg(0xB0 + c, 0x0A, 0x08);        
        } 
        
        // Pitch on middle
        //midi.sendShortMsg(0x91, 0x03, 0x01);   
        //midi.sendShortMsg(0xB1, 0x03, 0x08);
    }
      
    //midi.sendShortMsg(0xB0, 0x04, 0x08); midi.sendShortMsg(0x90, 0x00, 0x01); // Key change init
    //midi.sendShortMsg(0xB0, 0x07, 0x08); midi.sendShortMsg(0x90, 0x04, 0x01); // Super1 change init
    
	// Connect no-channel Rotaries
	engine.makeConnection('[QuickEffectRack1_' + CMDPL.cGroup + ']', 'super1', CMDPL.super1red).trigger(); 
	engine.makeConnection(CMDPL.cGroup, 'loop_enabled', CMDPL.beatszch).trigger(); 
	engine.makeConnection(CMDPL.cGroup, 'quantize', CMDPL.qntz).trigger(); 

	
	
    // Connect LEDs /w Channels
    for (var i = 0; i <= 3; i++ ) {  
		
		engine.makeConnection(CMDPL.chList[i],'rate'            , CMDPL.rateLED).trigger(); 
        
		engine.makeConnection(CMDPL.chList[i], 'sync_enabled',  function (value, group, control) {midi.sendShortMsg(0x90 + CMDPL.getChannelN(group), 0x20, value);}).trigger();
		engine.makeConnection(CMDPL.chList[i], 'play',          function (value, group, control) {midi.sendShortMsg(0x90 + CMDPL.getChannelN(group), 0x23, value);}).trigger();
		engine.makeConnection(CMDPL.chList[i], 'cue_indicator', function (value, group, control) {midi.sendShortMsg(0x90 + CMDPL.getChannelN(group), 0x22, value);}).trigger();
		
		engine.makeConnection(CMDPL.chList[i], 'keylock',      function (value, group, control) {midi.sendShortMsg(0x90 + CMDPL.getChannelN(group), 0x19, value);}).trigger();
        
		engine.makeConnection(CMDPL.chList[i], 'hotcue_1_enabled', function (value, group, control) {midi.sendShortMsg(0x90 + CMDPL.getChannelN(group), 0x10, value);}).trigger();
		engine.makeConnection(CMDPL.chList[i], 'hotcue_2_enabled', function (value, group, control) {midi.sendShortMsg(0x90 + CMDPL.getChannelN(group), 0x11, value);}).trigger();
		engine.makeConnection(CMDPL.chList[i], 'hotcue_3_enabled', function (value, group, control) {midi.sendShortMsg(0x90 + CMDPL.getChannelN(group), 0x12, value);}).trigger();
		engine.makeConnection(CMDPL.chList[i], 'hotcue_4_enabled', function (value, group, control) {midi.sendShortMsg(0x90 + CMDPL.getChannelN(group), 0x13, value);}).trigger();
		
		engine.makeConnection(CMDPL.chList[i], 'loop_enabled',        function (value, group, control) {midi.sendShortMsg(0x90 + CMDPL.getChannelN(group), 0x14, value);}).trigger();
		engine.makeConnection(CMDPL.chList[i], 'loop_start_position', function (value, group, control) { value = value >= 0 ? 0x01 : 0x00; midi.sendShortMsg(0x90 + CMDPL.getChannelN(group), 0x15, value);}).trigger();
		engine.makeConnection(CMDPL.chList[i], 'loop_end_position',   function (value, group, control) { value = value >= 0 ? 0x01 : 0x00; midi.sendShortMsg(0x90 + CMDPL.getChannelN(group), 0x16, value);}).trigger();
        
		engine.makeConnection(CMDPL.chList[i], 'slip_enabled',        function (value, group, control) {midi.sendShortMsg(0x90 + CMDPL.getChannelN(group), 0x17, value);}).trigger();
		
		engine.makeConnection(CMDPL.chList[i], 'scratch2_enable',     function (value, group, control) {midi.sendShortMsg(0x90 + CMDPL.getChannelN(group), 0x1B, value);}).trigger();
    } 
	
	// Ping
	midi.sendShortMsg(0x90, 0x18, 0x01);
	midi.sendShortMsg(0x91, 0x18, 0x01);
	midi.sendShortMsg(0x92, 0x18, 0x01);
	midi.sendShortMsg(0x93, 0x18, 0x01);
	
	engine.softTakeover('[Channel1]', 'rate', true);
	engine.softTakeover('[Channel2]', 'rate', true);
	engine.softTakeover('[Channel3]', 'rate', true);
	engine.softTakeover('[Channel4]', 'rate', true);
}

CMDPL.super1red = function (value, group, control) {
	if (value < 0.46 || value > 0.54) midi.sendShortMsg(0x90, 0x00, 0x01); 
	else midi.sendShortMsg(0x90, 0x00, 0x00);
}
CMDPL.beatszch = function (value, group, control) {
	midi.sendShortMsg(0x90, 0x04, value);
}
CMDPL.qntz = function (value, group, control) {
	midi.sendShortMsg(0x90, 0x02, value);
}

CMDPL.button = function (channel, control, value, status, group) {
    //print('button');
    //channel = 0 1 2 3
    //print(group);
    print(channel);
	
	// First 8 buttons in rotaries always send channel 0!
	switch (control) {
		case 0x00:  // RESET FILTER
			if (value === 127) {
				engine.setValue('[QuickEffectRack1_' + CMDPL.cGroup + ']', 'super1', 0.5);
			}
        break;
		
        case 0x01: //  KEY SYNC / RESET PITCH / CHANGE PITCH
			if (value === 127) {
				midi.sendShortMsg(0x90, 0x01, 0x01);
				engine.setValue(CMDPL.cGroup, 'pitch', 0);
			}
			if (value === 0) {
				midi.sendShortMsg(0x90, 0x01, 0x00);
			}
        break;

        case 0x02: // Quantize
			if (value === 127) {
				script.toggleControl(CMDPL.cGroup, 'quantize');
			}
        break;

        case 0x03: // Adjust Beat Grid 2
			if (value === 127) {
				script.triggerControl(CMDPL.cGroup, 'beats_translate_curpos');
			}
        break;
		
        case 0x07: // Reset BPM
			if (value === 127) {
				engine.setValue(CMDPL.cGroup, 'rate', 0);
			}
        break;
		
		 
        // BUTTONS 1-8    
        case 0x10: 
			if (value === 127) {
				if (CMDPL.shift[channel]) {
					engine.setValue(CMDPL.chList[channel], 'hotcue_1_clear', 1);
					break;
				}
				engine.setValue(CMDPL.chList[channel], 'hotcue_1_activate', 1);
			}
			if (value === 0) {
				//midi.sendShortMsg(0x90 + channel, 0x01, 0x00);
				if (CMDPL.shift[channel]) {
					
					break;
				}
				//
			}
		break;	
			
        case 0x11: 
			if (value === 127) {
				if (CMDPL.shift[channel]) {
					engine.setValue(CMDPL.chList[channel], 'hotcue_2_clear', 1);
					break;
				}
				engine.setValue(CMDPL.chList[channel], 'hotcue_2_activate', 1);
			}
			if (value === 0) {
				//midi.sendShortMsg(0x90 + channel, 0x01, 0x00);
				if (CMDPL.shift[channel]) {
					
					break;
				}
				//
			}
		break;
		
        case 0x12: 
			if (value === 127) {
				if (CMDPL.shift[channel]) {
					engine.setValue(CMDPL.chList[channel], 'hotcue_3_clear', 1);
					break;
				}
				engine.setValue(CMDPL.chList[channel], 'hotcue_3_activate', 1);
			}
			if (value === 0) {
				//midi.sendShortMsg(0x90 + channel, 0x01, 0x00);
				if (CMDPL.shift[channel]) {
					
					break;
				}
				//
			}
		break;
		
        case 0x13: 
			if (value === 127) {
				if (CMDPL.shift[channel]) {
					engine.setValue(CMDPL.chList[channel], 'hotcue_4_clear', 1);
					break;
				}
				engine.setValue(CMDPL.chList[channel], 'hotcue_4_activate', 1);
			}
			if (value === 0) {
				//midi.sendShortMsg(0x90 + channel, 0x01, 0x00);
				if (CMDPL.shift[channel]) {
					
					break;
				}
				//
			}
		break;
        
		
        case 0x14: // LOOP ACTIVE
			if (value === 127) {
				if (CMDPL.shift[channel]) {
					
					engine.setValue(CMDPL.chList[channel], 'reloop_toggle', 1);
					break;
				}
				engine.setValue(CMDPL.chList[channel], 'beatloop_activate', 1);
			}
			if (value === 0) {
				//midi.sendShortMsg(0x90 + channel, 0x01, 0x00);
				if (CMDPL.shift[channel]) {
					
					break;
				}
				//
			}
		break;
			
        case 0x15: 
			if (value === 127) {
				if (CMDPL.shift[channel]) {
					engine.setValue(CMDPL.chList[channel], 'loop_start_position', -1);
					break;
				}
				engine.setValue(CMDPL.chList[channel], 'loop_in', 1);
			}
			if (value === 0) {
				if (CMDPL.shift[channel]) {
					
					break;
				}
				engine.setValue(CMDPL.chList[channel], 'loop_in', 0);
			}
		break;
		
        case 0x16: 
			if (value === 127) {
				if (CMDPL.shift[channel]) {
					engine.setValue(CMDPL.chList[channel], 'loop_end_position', -2);
					break;
				}
				engine.setValue(CMDPL.chList[channel], 'loop_out', 1);
			}
			if (value === 0) {
				if (CMDPL.shift[channel]) {
					
					break;
				}
				engine.setValue(CMDPL.chList[channel], 'loop_out', 0);
			}
		break;
		
        case 0x17:
			if (value === 127) {
				if (CMDPL.shift[channel]) {
					engine.setValue(CMDPL.chList[channel], 'loop_end_position', -2);
					break;
				}
				engine.setValue(CMDPL.chList[channel], 'slip_enabled', 1);
			}
			if (value === 0) {
				if (CMDPL.shift[channel]) {
					
					break;
				}
				engine.setValue(CMDPL.chList[channel], 'slip_enabled', 0);
			}
		break;
			
		case 0x18: // LOAD - SHIFT = function
			if (value === 127) {
				midi.sendShortMsg(0x90 + channel, 0x18, 0x00);
				CMDPL.shift[channel] = true;
			}
			if (value === 0) {
				midi.sendShortMsg(0x90 + channel, 0x18, 0x01);
				CMDPL.shift[channel] = false;
			}
        break;	
		
		case 0x19: // LOCK 
			if (value === 127) {
				if (CMDPL.shift[channel]) {
					script.triggerControl(CMDPL.chList[channel], 'sync_key');
					break;
				}
				script.toggleControl(CMDPL.chList[channel], 'keylock', 1);
			}
        break;
		
		case 0x20: // SYNC 
			if (value === 127) {
				if (CMDPL.shift[channel]) {
					engine.setValue(CMDPL.chList[channel], 'rate', 0);
					break;
				}
				script.toggleControl(CMDPL.chList[channel], 'sync_enabled', 1);
				CMDPL.syncTimer = engine.beginTimer(500, function() {CMDPL.syncLongPress = true}, true);
			}
			if (value === 0) {
				if (CMDPL.shift[channel]) {
					
					break;
				}
				engine.stopTimer(CMDPL.syncTimer);
				if (CMDPL.syncLongPress === true) {
					CMDPL.syncLongPress = false;
				} else engine.setValue(CMDPL.chList[channel], 'sync_enabled', 0);
			}
        break;
		
		case 0x21: // TAP 
			if (value === 127) {
				if (CMDPL.shift[channel]) {
					//engine.setValue(CMDPL.chList[channel], 'rate', 0);
					break;
				}
				script.toggleControl(CMDPL.chList[channel], 'bpm_tap', 1);
			}
			if (value === 0) {
				if (CMDPL.shift[channel]) {
					
					break;
				}
				script.toggleControl(CMDPL.chList[channel], 'bpm_tap', 0);
			}
        break;
        
		// <<
		case 0x24:  
			if (value === 127) {
				midi.sendShortMsg(0x90 + channel, 0x24, 0x01);
				if (CMDPL.shift[channel]) {
					script.toggleControl(CMDPL.chList[channel], 'rate_temp_down');
					break;
				}
				engine.setValue(CMDPL.cGroup, 'beatjump_backward', 1);
			}
			if (value === 0) {
				midi.sendShortMsg(0x90 + channel, 0x24, 0x00);
				if (CMDPL.shift[channel]) {
					script.toggleControl(CMDPL.chList[channel], 'rate_temp_down');
					break;
				}
				engine.setValue(CMDPL.chList[channel], 'beatjump_backward', 0);
			}
        break;
        
		// >>		
        case 0x25: 
			if (value === 127) {
				midi.sendShortMsg(0x90 + channel, 0x25, 0x01);
				if (CMDPL.shift[channel]) {
					script.toggleControl(CMDPL.chList[channel], 'rate_temp_up');
					break;
				}
				engine.setValue(CMDPL.chList[channel], 'beatjump_forward', 1);				
			}
			if (value === 0) {
				midi.sendShortMsg(0x90 + channel, 0x25, 0x00);
				if (CMDPL.shift[channel]) {
					script.toggleControl(CMDPL.chList[channel], 'rate_temp_up');
					break;
				}
				engine.setValue(CMDPL.chList[channel], 'beatjump_forward', 0);
			}
        break;
		
		// -	
		case 0x26:
			if (value === 127) {
				midi.sendShortMsg(0x90 + channel, 0x26, 0x01);
				if (CMDPL.shift[channel]) {
					engine.setValue(CMDPL.chList[channel], 'rate_perm_down', 1);
					break;
				}
				CMDPL.beat_size_pos = (CMDPL.beat_size_pos - 1) <= 0 ? 0 : CMDPL.beat_size_pos -1;
				engine.setValue(CMDPL.chList[channel], 'beatjump_size', CMDPL.beat_size[CMDPL.beat_size_pos]);
			}
			if (value === 0) {
				midi.sendShortMsg(0x90 + channel, 0x26, 0x00);
				if (CMDPL.shift[channel]) {
					engine.setValue(CMDPL.chList[channel], 'rate_perm_down', 0);
					break;
				}
				
			}
		break;
		
		// +
		case 0x27:
			if (value === 127) {
				midi.sendShortMsg(0x90 + channel, 0x27, 0x01);
				if (CMDPL.shift[channel]) {
					engine.setValue(CMDPL.chList[channel], 'rate_perm_up', 1);
					break;
				};
				CMDPL.beat_size_pos = (CMDPL.beat_size_pos + 1) >= (CMDPL.beat_size.length - 1) ? (CMDPL.beat_size.length - 1) : CMDPL.beat_size_pos + 1;
				engine.setValue(CMDPL.chList[channel], 'beatjump_size', CMDPL.beat_size[CMDPL.beat_size_pos]);
			}
			if (value === 0) {
				midi.sendShortMsg(0x90 + channel, 0x27, 0x00);
				if (CMDPL.shift[channel]) {
					engine.setValue(CMDPL.chList[channel], 'rate_perm_up', 0);
					break;
				}
				
			}
		break;
            
        case 0x22: //CUE 
			if (value === 127) {
				if (CMDPL.shift[channel]) {
					engine.setValue(CMDPL.chList[channel], 'cue_gotoandplay', 1);
					break;
				}
				engine.setValue(CMDPL.chList[channel], 'cue_default', 1);
				
			}
			if (value === 0) {
				engine.setValue(CMDPL.chList[channel], 'cue_default', 0);
			}
        break; 
			
        case 0x23: //PLAY 
			if (value === 127) {
				if (CMDPL.shift[channel]) {
					
					engine.setValue(CMDPL.chList[channel], 'start_play', 1);
					break;
				}
				script.toggleControl(CMDPL.chList[channel], 'play');
				
			}
        break; 

        case 0x1B: 
			var ch = channel + 1;
			if (value === 127) {
				if (CMDPL.permaScratch[channel] === true) {
					CMDPL.permaScratch[channel] = false;
					engine.scratchDisable(ch);
				} else {
					CMDPL.permaScratch[channel] = true;
					engine.scratchEnable(ch, 128, CMDPL.rpm, CMDPL.alpha, CMDPL.beta);
				}
				
			}
		break;

        case 0x1F:
			var ch = channel + 1;
			if (value === 127) { 
				engine.scratchEnable(ch, 128, CMDPL.rpm, CMDPL.alpha, CMDPL.beta, false);
			}
			if (value === 0) {
				if (CMDPL.permaScratch[channel] === true) {
					
				} else engine.scratchDisable(ch);
			}
		break;
		
		case 0x1A: {
			if (value === 127) {
				
				engine.makeConnection('[QuickEffectRack1_' + CMDPL.cGroup + ']', 'super1', true); 
				engine.makeConnection(CMDPL.cGroup, 'quantize', true); 
				engine.makeConnection(CMDPL.cGroup, 'loop_enabled', true); 
				
				CMDPL.cGroup = CMDPL.chList[channel];
				
				engine.makeConnection('[QuickEffectRack1_' + CMDPL.cGroup + ']', 'super1', CMDPL.super1red).trigger();  
				engine.makeConnection(CMDPL.cGroup, 'quantize', CMDPL.qntz).trigger();  
				engine.makeConnection(CMDPL.cGroup, 'loop_enabled', CMDPL.beatszch).trigger();  
			}
		}
		break;
		
		default: break;
    }
}

CMDPL.rotary = function (channel, control, value, status, group) {
	// Is shift?
	var shift = CMDPL.shift[CMDPL.getChannelN(CMDPL.cGroup)];
	//print(shift);
	
	switch (control) {
		
		// Rotary 1
		case 0x00: // Super1
			var super1 = Math.round(engine.getValue('[QuickEffectRack1_' + CMDPL.cGroup + ']', 'super1') * 10000); // 0.00001
			var factor = 350;
			
			if (value == 0x41) {
				super1 = (super1 + factor) / 10000;
				engine.setValue('[QuickEffectRack1_' + CMDPL.cGroup + ']', 'super1', super1);

			} else if (value == 0x3F) {
				super1 = (super1 - factor) / 10000;
				engine.setValue('[QuickEffectRack1_' + CMDPL.cGroup + ']', 'super1', super1);

			}
		break;
		
		// Rotary 2
		case 0x01: // PITCH
			var pitch = Math.round(engine.getValue(CMDPL.cGroup, 'pitch')); // 0.00001
			if (value == 0x41) {
				pitch++;
				engine.setValue(CMDPL.cGroup, 'pitch', pitch);
			} else if (value == 0x3F) {
				pitch--;
				engine.setValue(CMDPL.cGroup, 'pitch', pitch);
			}
			

		break;
		
		// Rotary 3
		case 0x02: // MOVE GRID
			if (value === 0x41) {
				engine.setValue(CMDPL.cGroup, 'beats_translate_later', 1);
			} else if (value === 0x3f) {
				engine.setValue(CMDPL.cGroup, 'beats_translate_earlier', 1);
			}
		break;
		
		// Rotary 4
		case 0x03: // Adjust BPM 0.01
			if (value === 0x41) {
				engine.setValue(CMDPL.cGroup, 'beats_adjust_faster', 1);
			} else if (value === 0x3f) {
				engine.setValue(CMDPL.cGroup, 'beats_adjust_slower', 1);
			}
		break;
		
		// Rotary 5
		case 0x04: // 
			
			if (value === 0x41) {
				if (shift) {
					CMDPL.beat_size_pos = (CMDPL.beat_size_pos + 1) >= (CMDPL.beat_size.length - 1) ? (CMDPL.beat_size.length - 1) : CMDPL.beat_size_pos + 1;
					engine.setValue(CMDPL.chList[channel], 'beatjump_size', CMDPL.beat_size[CMDPL.beat_size_pos]);
					break;
				}
				CMDPL.loop_size_pos = (CMDPL.loop_size_pos + 1) >= CMDPL.loop_size.length ? (CMDPL.loop_size.length - 1) : CMDPL.loop_size_pos +1;
				engine.setValue(CMDPL.cGroup, 'beatloop_size', CMDPL.loop_size[CMDPL.loop_size_pos]);
			} else if (value === 0x3f) {
				if (shift) {
					CMDPL.beat_size_pos = (CMDPL.beat_size_pos - 1) <= 0 ? 0 : CMDPL.beat_size_pos -1;
					engine.setValue(CMDPL.cGroup, 'beatjump_size', CMDPL.beat_size[CMDPL.beat_size_pos]);
					break;
				}
				CMDPL.loop_size_pos = (CMDPL.loop_size_pos - 1) <= 0 ? 0 : CMDPL.loop_size_pos -1;
				engine.setValue(CMDPL.cGroup, 'beatloop_size', CMDPL.loop_size[CMDPL.loop_size_pos]);
			}
		break;
		
		// Rotary 6
		case 0x05: // loop_start_position

			var pos = engine.getValue(CMDPL.cGroup, 'loop_start_position');
			if (shift) {
				var tik = 250;
			} else tik = 1000;
			

			if (value === 0x41) {
				engine.setValue(CMDPL.cGroup, 'loop_start_position', pos + tik);
			} else if (value === 0x3f) {
				engine.setValue(CMDPL.cGroup, 'loop_start_position', pos - tik);
			}
		break;
		
		// Rotary 7
		case 0x06: // loop_end_position

			var pos = engine.getValue(CMDPL.cGroup, 'loop_end_position');
			if (shift) {
				var tik = 250;
			} else tik = 500;
			

			if (value === 0x41) {
				engine.setValue(CMDPL.cGroup, 'loop_end_position', pos + tik);
			} else if (value === 0x3f) {
				engine.setValue(CMDPL.cGroup, 'loop_end_position', pos - tik);
			}
		break;	
		
		// Rotary 8
		case 0x07: // 
			var bpm = Math.round(engine.getValue(CMDPL.cGroup, 'bpm'));
			
			if (value === 0x41) {
				bpm++;
				engine.setValue(CMDPL.cGroup, 'bpm', bpm);
			} else if (value === 0x3f) {
				bpm--;
				engine.setValue(CMDPL.cGroup, 'bpm', bpm);
			}
		break;	
		
		// JOG
		case 0x1F: // 
			var channel = channel + 1;
			var newValue = value - 64;
			if (CMDPL.g.invertJogs) {
				switch (true) {
					case newValue > 0 : newValue = 0 - newValue; break;
					case newValue < 0 : newValue = Math.abs(newValue) ; break;
				}
			}
			if (engine.isScratching(channel)) {
				engine.scratchTick(channel, newValue); // Scratch!
			} else {
				engine.setValue(CMDPL.cGroup, 'jog', newValue); // Pitch bend
			}
		break;	
	}
}


CMDPL.fader = function (channel, control, value, status, group) {
	engine.setValue(CMDPL.chList[channel], 'rate', script.midiPitch(control, value, status));
}


CMDPL.getChannelN = function(value) {
    switch (value) {
        case '[Channel1]': return 0;
        case '[Channel2]': return 1;
        case '[Channel3]': return 2;
        case '[Channel4]': return 3;
        default: print("Line: 726");
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
            engine.setValue(CMDPL.cGroup, 'beatloop_' + CMDPL.g.loopLength + '_activate', 1);
            CMDPL.g.loopIsActive = true;
            midi.sendShortMsg(0x90, control, 0x01);
            print('beatlooproll 1');
        } else {
            engine.setValue(CMDPL.cGroup, 'reloop_exit', 1);
            CMDPL.g.loopIsActive = false;
            midi.sendShortMsg(0x90, control, 0x00);
            
            CMDPL.g.loopLeftLocatorIsActive  = false;
            CMDPL.g.loopRightLocatorIsActive = false;
        engine.setValue(CMDPL.cGroup, 'loop_in', 0);
        engine.setValue(CMDPL.cGroup, 'loop_out', 0);
            midi.sendShortMsg(0x90, ++control, 0x00);
        }
    }
     
    CMDPL.loopLengthFunc(channel, control, value, status, group);
}

CMDPL.loopinout = function (channel, control, value, status, group) {
    if (status == 0x90) {
        if (!CMDPL.g.loopLeftLocatorIsActive && !CMDPL.g.loopIsActive) {
            engine.setValue(CMDPL.cGroup, 'loop_in', 1);
            
            CMDPL.g.loopLeftLocatorIsActive = true;
        } else {
            engine.setValue(CMDPL.cGroup, 'loop_out', 1);
            
            CMDPL.g.loopRightLocatorIsActive = true;
            midi.sendShortMsg(0x90, control, 0x01);
        }
    }
    
    if (CMDPL.g.loopLeftLocatorIsActive && CMDPL.g.loopRightLocatorIsActive) {
        CMDPL.g.loopIsActive = true;
        engine.setValue(CMDPL.cGroup, 'loop_in', 0);
        engine.setValue(CMDPL.cGroup, 'loop_out', 0);
    }
    
    
    CMDPL.loopLengthFunc(channel, control, value, status, group);
}

*/


CMDPL.shutdown = function() {
    
	// Turn off lights
	for (var c = 0; c <= 3; c++) {
        for (var i = 0; i <= 0x30; i++) {
            midi.sendShortMsg(0x90 + c, i, 0x00); 
            midi.sendShortMsg(0xB0 + c, i, 0x00);  
		} 
    }
}