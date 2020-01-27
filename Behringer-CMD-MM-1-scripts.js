var CMDMM = new Object();

CMDMM.init = function (id) { 
	CMDMM.faderOrder = [3, 1, 2, 4], // Decks order
	CMDMM.ctrl = [[], [], [], []]; // Controls for defined deck order
	CMDMM.deckSequence(CMDMM.faderOrder); // Fill ctrls
	
	CMDMM.shiftStatus = false;
	
    CMDMM.inLibrary            = true; // TRUE = right | FALSE = left 
    CMDMM.rightFirstPress      = false; 
    CMDMM.focusMoved           = true; // variable to remember if track selector was moved or not, if moved press will load and play track again, if not, will fastforward or stop
    CMDMM.paused               = false;  
    CMDMM.timer                = null;
    CMDMM.longpress            = false;  
    CMDMM.orientation          = [null, [null, false, false], [null, false, false], [null, false, false], [null, false, false]]; // Null for shifting index
	
	// Special mode
	// The idea behind this mode is to be able to DJ only with one piece of MM-1.
	// The button 1 becomes CUE, the button 2 becomes PLAY
	CMDMM.sm = [0,0]; // 1 - first button pressed, 2 - second, 3 switch mode enabled
	CMDMM.spMode = false;

    engine.makeConnection('[Master]', 'VuMeterL', CMDMM.vuMeterUpdateL);
    engine.makeConnection('[Master]', 'VuMeterR', CMDMM.vuMeterUpdateR);
    
    CMDMM.pfl1 = engine.makeConnection('[Channel1]','pfl', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[0][0], value)}); CMDMM.pfl1.trigger();
    CMDMM.pfl2 = engine.makeConnection('[Channel2]','pfl', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[1][0], value)}); CMDMM.pfl2.trigger();
    CMDMM.pfl3 = engine.makeConnection('[Channel3]','pfl', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[2][0], value)}); CMDMM.pfl3.trigger();
    CMDMM.pfl4 = engine.makeConnection('[Channel4]','pfl', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[3][0], value)}); CMDMM.pfl4.trigger();
     
    CMDMM.b11 = engine.makeConnection('[EffectRack1_EffectUnit1]', 'group_[Channel1]_enable', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[0][1], value)}); CMDMM.b11.trigger();
    CMDMM.b12 = engine.makeConnection('[EffectRack1_EffectUnit2]', 'group_[Channel1]_enable', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[0][2], value)}); CMDMM.b12.trigger();
    CMDMM.b21 = engine.makeConnection('[EffectRack1_EffectUnit1]', 'group_[Channel2]_enable', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[1][1], value)}); CMDMM.b21.trigger();
    CMDMM.b22 = engine.makeConnection('[EffectRack1_EffectUnit2]', 'group_[Channel2]_enable', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[1][2], value)}); CMDMM.b22.trigger();
    CMDMM.b31 = engine.makeConnection('[EffectRack1_EffectUnit1]', 'group_[Channel3]_enable', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[2][1], value)}); CMDMM.b31.trigger();
    CMDMM.b33 = engine.makeConnection('[EffectRack1_EffectUnit2]', 'group_[Channel3]_enable', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[2][2], value)}); CMDMM.b33.trigger();
    CMDMM.b41 = engine.makeConnection('[EffectRack1_EffectUnit1]', 'group_[Channel4]_enable', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[3][1], value)}); CMDMM.b41.trigger();
    CMDMM.b44 = engine.makeConnection('[EffectRack1_EffectUnit2]', 'group_[Channel4]_enable', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[3][2], value)}); CMDMM.b44.trigger();
	
	engine.softTakeover('[QuickEffectRack1_[Channel1]]', 'super1', true);
	engine.softTakeover('[QuickEffectRack1_[Channel2]]', 'super1', true);
	engine.softTakeover('[QuickEffectRack1_[Channel3]]', 'super1', true);
	engine.softTakeover('[QuickEffectRack1_[Channel4]]', 'super1', true);
	
	// Ping
	midi.sendShortMsg(0x94, 0x12, 0x01);
	
	// Just in case if fucked-up something xD
	engine.setValue('[Channel1]', 'rateSearch', 0);
	engine.setValue('[Channel2]', 'rateSearch', 0);
	engine.setValue('[Channel3]', 'rateSearch', 0);
	engine.setValue('[Channel4]', 'rateSearch', 0);
	engine.setValue('[PreviewDeck1]', 'rateSearch', 0);

	
}

CMDMM.chSM = function (channel, control, value) { // Check SM
	if (value === 127) {
		
		if (control === 0x12) {
			CMDMM.sm[0] = 1;
		}
		if (control === 0x03) {
			CMDMM.sm[1] = 1; 
		}
	};
	
	if (value === 0) {
		if (control === 0x12) {
			CMDMM.sm[0] = 0; 
		}
		if (control === 0x03) {
			CMDMM.sm[1] = 0; 
		}
	}
	
	if (CMDMM.sm[0] === 1 && CMDMM.sm[1] === 1) {
		if (CMDMM.spMode === false) {
			CMDMM.spMode = true;
			
			engine.beginTimer(300, function () {midi.sendShortMsg(0x94, 0x12, 0x02);}, true);
			
			CMDMM.b11.disconnect(); 
			CMDMM.b12.disconnect(); 
			CMDMM.b21.disconnect(); 
			CMDMM.b22.disconnect(); 
			CMDMM.b31.disconnect(); 
			CMDMM.b33.disconnect(); 
			CMDMM.b41.disconnect(); 
			CMDMM.b44.disconnect(); 
			
			CMDMM.ori1.disconnect();
			CMDMM.ori2.disconnect();
			CMDMM.ori3.disconnect();
			CMDMM.ori4.disconnect();
			
			CMDMM.b11 = engine.makeConnection('[Channel1]', 'cue_indicator', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[0][1], value)}); CMDMM.b11.trigger(); 
			CMDMM.b12 = engine.makeConnection('[Channel1]', 'play',          function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[0][2], value)}); CMDMM.b12.trigger(); 
			CMDMM.b21 = engine.makeConnection('[Channel2]', 'cue_indicator', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[1][1], value)}); CMDMM.b21.trigger(); 
			CMDMM.b22 = engine.makeConnection('[Channel2]', 'play',          function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[1][2], value)}); CMDMM.b22.trigger(); 
			CMDMM.b31 = engine.makeConnection('[Channel3]', 'cue_indicator', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[2][1], value)}); CMDMM.b31.trigger(); 
			CMDMM.b33 = engine.makeConnection('[Channel3]', 'play',          function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[2][2], value)}); CMDMM.b33.trigger(); 
			CMDMM.b41 = engine.makeConnection('[Channel4]', 'cue_indicator', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[3][1], value)}); CMDMM.b41.trigger(); 
			CMDMM.b44 = engine.makeConnection('[Channel4]', 'play',          function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[3][2], value)}); CMDMM.b44.trigger(); 
		
		} else if (CMDMM.spMode) {
			
			CMDMM.spMode = false;
			midi.sendShortMsg(0x94, 0x12, 0x00);
		
			CMDMM.b11.disconnect(); 
			CMDMM.b12.disconnect(); 
			CMDMM.b21.disconnect(); 
			CMDMM.b22.disconnect(); 
			CMDMM.b31.disconnect(); 
			CMDMM.b33.disconnect(); 
			CMDMM.b41.disconnect(); 
			CMDMM.b44.disconnect(); 
			
			engine.makeConnection('[EffectRack1_EffectUnit1]', 'group_[Channel1]_enable', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[0][1], value)}); CMDMM.b11.trigger();
			engine.makeConnection('[EffectRack1_EffectUnit2]', 'group_[Channel1]_enable', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[0][2], value)}); CMDMM.b12.trigger();
			engine.makeConnection('[EffectRack1_EffectUnit1]', 'group_[Channel2]_enable', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[1][1], value)}); CMDMM.b21.trigger();
			engine.makeConnection('[EffectRack1_EffectUnit2]', 'group_[Channel2]_enable', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[1][2], value)}); CMDMM.b22.trigger();
			engine.makeConnection('[EffectRack1_EffectUnit1]', 'group_[Channel3]_enable', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[2][1], value)}); CMDMM.b31.trigger();
			engine.makeConnection('[EffectRack1_EffectUnit2]', 'group_[Channel3]_enable', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[2][2], value)}); CMDMM.b33.trigger();
			engine.makeConnection('[EffectRack1_EffectUnit1]', 'group_[Channel4]_enable', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[3][1], value)}); CMDMM.b41.trigger();
			engine.makeConnection('[EffectRack1_EffectUnit2]', 'group_[Channel4]_enable', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[3][2], value)}); CMDMM.b44.trigger();
		}
	}
}

CMDMM.deckSequence = function (sequence) {
    var address = [[0x30, 0x13, 0x14, 0x12, 0x0e, 0x0a, 0x06],
                   [0x31, 0x17, 0x18, 0x13, 0x0f, 0x0b, 0x07], 
                   [0x32, 0x1b, 0x1c, 0x14, 0x10, 0x0c, 0x08], 
                   [0x33, 0x1f, 0x20, 0x15, 0x11, 0x0d, 0x09]];
	//              [0]   [1]   [2]   [3]   [4]   [5]   [6]
	//              CUE  1     2     r1    r2    r3    r4                            
    
    for (var i = 0; i <= 3; i++) {
        var z = sequence[i] - 1; 
        CMDMM.ctrl[z] = address[i];
    }
}

CMDMM.vuMeterUpdateL = function (value, group, control) {
    value = (value * 15) + 48;
    midi.sendShortMsg(0xB4, 80, value);
}

CMDMM.vuMeterUpdateR = function (value, group, control) {
    value = (value * 15) + 48;
    midi.sendShortMsg(0xB4, 81, value);
}

CMDMM.orienLED = function (value, group, control) {
	switch (group) {
		case '[Channel1]':
			if (value == 0) midi.sendShortMsg(0x94, CMDMM.ctrl[0][1], 0x01), midi.sendShortMsg(0x94, CMDMM.ctrl[0][2], 0x00);
			if (value == 2) midi.sendShortMsg(0x94, CMDMM.ctrl[0][1], 0x00), midi.sendShortMsg(0x94, CMDMM.ctrl[0][2], 0x01);
			if (value == 1) midi.sendShortMsg(0x94, CMDMM.ctrl[0][1], 0x01), midi.sendShortMsg(0x94, CMDMM.ctrl[0][2], 0x01);
		break;
		case '[Channel2]':
			if (value == 0) midi.sendShortMsg(0x94, CMDMM.ctrl[1][1], 0x01), midi.sendShortMsg(0x94, CMDMM.ctrl[1][2], 0x00);
			if (value == 2) midi.sendShortMsg(0x94, CMDMM.ctrl[1][1], 0x00), midi.sendShortMsg(0x94, CMDMM.ctrl[1][2], 0x01);
			if (value == 1) midi.sendShortMsg(0x94, CMDMM.ctrl[1][1], 0x01), midi.sendShortMsg(0x94, CMDMM.ctrl[1][2], 0x01);
		break;
		case '[Channel3]':
			if (value == 0) midi.sendShortMsg(0x94, CMDMM.ctrl[2][1], 0x01), midi.sendShortMsg(0x94, CMDMM.ctrl[2][2], 0x00);
			if (value == 2) midi.sendShortMsg(0x94, CMDMM.ctrl[2][1], 0x00), midi.sendShortMsg(0x94, CMDMM.ctrl[2][2], 0x01);
			if (value == 1) midi.sendShortMsg(0x94, CMDMM.ctrl[2][1], 0x01), midi.sendShortMsg(0x94, CMDMM.ctrl[2][2], 0x01);
		break;
		case '[Channel4]':
			if (value == 0) midi.sendShortMsg(0x94, CMDMM.ctrl[3][1], 0x01), midi.sendShortMsg(0x94, CMDMM.ctrl[3][2], 0x00);
			if (value == 2) midi.sendShortMsg(0x94, CMDMM.ctrl[3][1], 0x00), midi.sendShortMsg(0x94, CMDMM.ctrl[3][2], 0x01);
			if (value == 1) midi.sendShortMsg(0x94, CMDMM.ctrl[3][1], 0x01), midi.sendShortMsg(0x94, CMDMM.ctrl[3][2], 0x01);
		break;
	}
}
 
CMDMM.shift = function(channel, control, value, status, group) {
    if (value === 127) {
		
		if (!CMDMM.spMode) {
			midi.sendShortMsg(0x94, 0x12, 0x00);
			
			CMDMM.b11.disconnect();
			CMDMM.b12.disconnect();
			CMDMM.b21.disconnect();
			CMDMM.b22.disconnect();
			CMDMM.b31.disconnect();
			CMDMM.b33.disconnect();
			CMDMM.b41.disconnect();
			CMDMM.b44.disconnect();
			 
			CMDMM.ori1 = engine.makeConnection('[Channel1]', 'orientation', CMDMM.orienLED); CMDMM.ori1.trigger();
			CMDMM.ori2 = engine.makeConnection('[Channel2]', 'orientation', CMDMM.orienLED); CMDMM.ori2.trigger();
			CMDMM.ori3 = engine.makeConnection('[Channel3]', 'orientation', CMDMM.orienLED); CMDMM.ori3.trigger();
			CMDMM.ori4 = engine.makeConnection('[Channel4]', 'orientation', CMDMM.orienLED); CMDMM.ori4.trigger();
		}
		CMDMM.shiftStatus = true;
		CMDMM.chSM(channel, control, value);
		
		return;
    }
	
	if (value === 0) {

		CMDMM.shiftStatus = false;
		 
		if (!CMDMM.spMode) {
			
			midi.sendShortMsg(0x94, 0x12, 0x01);
			
			CMDMM.ori1.disconnect();
			CMDMM.ori2.disconnect();
			CMDMM.ori3.disconnect();
			CMDMM.ori4.disconnect();
		
			CMDMM.b11 = engine.makeConnection('[EffectRack1_EffectUnit1]', 'group_[Channel1]_enable', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[0][1], value)}); CMDMM.b11.trigger();
			CMDMM.b12 = engine.makeConnection('[EffectRack1_EffectUnit2]', 'group_[Channel1]_enable', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[0][2], value)}); CMDMM.b12.trigger();
			CMDMM.b21 = engine.makeConnection('[EffectRack1_EffectUnit1]', 'group_[Channel2]_enable', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[1][1], value)}); CMDMM.b21.trigger();
			CMDMM.b22 = engine.makeConnection('[EffectRack1_EffectUnit2]', 'group_[Channel2]_enable', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[1][2], value)}); CMDMM.b22.trigger();
			CMDMM.b31 = engine.makeConnection('[EffectRack1_EffectUnit1]', 'group_[Channel3]_enable', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[2][1], value)}); CMDMM.b31.trigger();
			CMDMM.b33 = engine.makeConnection('[EffectRack1_EffectUnit2]', 'group_[Channel3]_enable', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[2][2], value)}); CMDMM.b33.trigger();
			CMDMM.b41 = engine.makeConnection('[EffectRack1_EffectUnit1]', 'group_[Channel4]_enable', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[3][1], value)}); CMDMM.b41.trigger();
			CMDMM.b44 = engine.makeConnection('[EffectRack1_EffectUnit2]', 'group_[Channel4]_enable', function(value) {midi.sendShortMsg(0x94, CMDMM.ctrl[3][2], value)}); CMDMM.b44.trigger();
		}
		
		return;
	}
}  

CMDMM.librarySwitch = function (channel, control, value, status, group) {
    // Focus is on the right side and cycles through tracks of current view 
    if (CMDMM.inLibrary) { 
        if (control === 0x03 && value === 0x7F) {
			if (CMDMM.shiftStatus) {CMDMM.chSM(channel, control, value); return};
            engine.setValue('[Playlist]', 'LoadSelectedIntoFirstStopped', 1);
        } else {
			// Fire on release
			CMDMM.chSM(channel, control, value);
		}
        
        if (control === 0x03 && status === 0xB4 && value === 0x41) {
            engine.setValue('[Playlist]','SelectNextTrack',1);
            CMDMM.ctrlcusMoved = true;
        }
        
        if (control === 0x03 && status === 0xB4 && value === 0x3F) {
            engine.setValue('[Playlist]','SelectPrevTrack',1);
            CMDMM.ctrlcusMoved = true;
        }
        
		// short press [RIGHT] = preview, long press [RIGHT] - fast forward prefiew, 
		// short press - pause / load new track into preview deck
        if (!CMDMM.rightFirstPress) {
			
            if (control === 0x11) { 
				if (value === 127) {
						

					CMDMM.longpress = false;
					
					CMDMM.timer = engine.beginTimer(500, function() {engine.setValue('[PreviewDeck1]', 'rateSearch', 45); CMDMM.longpress = true;}, true);
				}
				if (value === 0) {
					if (CMDMM.timer) engine.stopTimer(CMDMM.timer);
					if (CMDMM.longpress === true) {
						engine.setValue('[PreviewDeck1]', 'rateSearch', 0);
						return;
					} 
					
					if (CMDMM.ctrlcusMoved === true) { //"focus" means 'current track' selector
						
						engine.setValue('[PreviewDeck1]', 'LoadSelectedTrack', 1);
						engine.beginTimer(200, function() {engine.setValue('[PreviewDeck1]', 'start_play', 1)}, true);
						CMDMM.ctrlcusMoved = false;
						CMDMM.paused     = false;
						
					} else {
						script.toggleControl('[PreviewDeck1]', 'play');
					}
                }
            }         
        }
  
    CMDMM.rightFirstPress = false;    
        
    // Focus moved left and cycles through 'Tracks', 'AutoDJ', 'Playlists', etc.     
    } else if (!CMDMM.inLibrary) { 
        
        if (control === 0x03 && status === 0x94) {
			if (CMDMM.shiftStatus) {CMDMM.chSM(channel, control, value); return};
            engine.setValue('[Playlist]','ToggleSelectedSidebarItem',1);
        }
        
        if (control === 0x03 && status === 0xB4 && value === 0x41) {
            engine.setValue('[Playlist]','SelectNextPlaylist',1);
        }
        
        if (control === 0x03 && status === 0xB4 && value === 0x3F) {
            engine.setValue('[Playlist]','SelectPrevPlaylist',1);
        }
    }
    
    if (CMDMM.inLibrary) {
        if (control === 0x10 && value === 127) {
            CMDMM.inLibrary = false;
            CMDMM.rightFirstPress = true;
        }
    } else {
        if (control === 0x11 && value === 127) {
            CMDMM.inLibrary  = true;
            //CMDMM.ctrlcusMoved = false;
        }
    }
}

CMDMM.fader = function (channel, control, value, status, group) {
    value = script.absoluteLin(value, 0, 1);

    switch (control) {
        case CMDMM.ctrl[0][0]: engine.setParameter('[Channel1]', 'volume', value); break;
        case CMDMM.ctrl[1][0]: engine.setParameter('[Channel2]', 'volume', value); break;
        case CMDMM.ctrl[2][0]: engine.setParameter('[Channel3]', 'volume', value); break;
        case CMDMM.ctrl[3][0]: engine.setParameter('[Channel4]', 'volume', value); break;
        
        case CMDMM.ctrl[0][6]: if (CMDMM.shiftStatus) {engine.setParameter('[Channel1]', 'pregain', value);} else {engine.setParameter('[EqualizerRack1_[Channel1]_Effect1]', 'parameter3', value)}; break; 
        case CMDMM.ctrl[1][6]: if (CMDMM.shiftStatus) {engine.setParameter('[Channel2]', 'pregain', value);} else {engine.setParameter('[EqualizerRack1_[Channel2]_Effect1]', 'parameter3', value)}; break; 
        case CMDMM.ctrl[2][6]: if (CMDMM.shiftStatus) {engine.setParameter('[Channel3]', 'pregain', value);} else {engine.setParameter('[EqualizerRack1_[Channel3]_Effect1]', 'parameter3', value)}; break; 
        case CMDMM.ctrl[3][6]: if (CMDMM.shiftStatus) {engine.setParameter('[Channel4]', 'pregain', value);} else {engine.setParameter('[EqualizerRack1_[Channel4]_Effect1]', 'parameter3', value)}; break; 
        
        case CMDMM.ctrl[0][5]: engine.setParameter('[EqualizerRack1_[Channel1]_Effect1]', 'parameter2', value); break;    
        case CMDMM.ctrl[1][5]: engine.setParameter('[EqualizerRack1_[Channel2]_Effect1]', 'parameter2', value); break;    
        case CMDMM.ctrl[2][5]: engine.setParameter('[EqualizerRack1_[Channel3]_Effect1]', 'parameter2', value); break;    
        case CMDMM.ctrl[3][5]: engine.setParameter('[EqualizerRack1_[Channel4]_Effect1]', 'parameter2', value); break; 
            
        case CMDMM.ctrl[0][4]: engine.setParameter('[EqualizerRack1_[Channel1]_Effect1]', 'parameter1', value); break;     
        case CMDMM.ctrl[1][4]: engine.setParameter('[EqualizerRack1_[Channel2]_Effect1]', 'parameter1', value); break;     
        case CMDMM.ctrl[2][4]: engine.setParameter('[EqualizerRack1_[Channel3]_Effect1]', 'parameter1', value); break;     
        case CMDMM.ctrl[3][4]: engine.setParameter('[EqualizerRack1_[Channel4]_Effect1]', 'parameter1', value); break;    
        
        case CMDMM.ctrl[0][3]: engine.setParameter('[QuickEffectRack1_[Channel1]]', 'super1', value); break;     
        case CMDMM.ctrl[1][3]: engine.setParameter('[QuickEffectRack1_[Channel2]]', 'super1', value); break;      
        case CMDMM.ctrl[2][3]: engine.setParameter('[QuickEffectRack1_[Channel3]]', 'super1', value); break;        
        case CMDMM.ctrl[3][3]: engine.setParameter('[QuickEffectRack1_[Channel4]]', 'super1', value); break;   
    }
}

CMDMM.button = function (channel, control, value, status, group) {
    switch (control) {
        //CUE deck 127/0
        case CMDMM.ctrl[0][0]:
			CMDMM.cue(1, value);
        break;
			
        case CMDMM.ctrl[1][0]:
			CMDMM.cue(2, value);
		break;
		
        case CMDMM.ctrl[2][0]:
			CMDMM.cue(3, value);
		break;
		
        case CMDMM.ctrl[3][0]:
			CMDMM.cue(4, value);
		break;
            
        //1-2 
        case CMDMM.ctrl[0][1]:
			CMDMM.oneTwo(1, 1, value);
        break;
			
        case CMDMM.ctrl[0][2]:
			CMDMM.oneTwo(1, 2, value);
        break;
		
		case CMDMM.ctrl[1][1]:
			CMDMM.oneTwo(2, 1, value);
        break;
			
        case CMDMM.ctrl[1][2]:
			CMDMM.oneTwo(2, 2, value);
        break;
		
        case CMDMM.ctrl[2][1]:
			CMDMM.oneTwo(3, 1, value);
        break;
			
        case CMDMM.ctrl[2][2]:
			CMDMM.oneTwo(3, 2, value);
        break;
		
        case CMDMM.ctrl[3][1]:
			CMDMM.oneTwo(4, 1, value);
        break;
			
        case CMDMM.ctrl[3][2]:
			CMDMM.oneTwo(4, 2, value);
        break;
    }
}

CMDMM.cue = function (deck, value) {
	if (value == 127) {
		if (CMDMM.shiftStatus) {
			if (CMDMM.spMode) {
				engine.setValue('[Channel' + deck + ']', 'beatsync', 1);
				midi.sendShortMsg(0x94, CMDMM.ctrl[(deck-1)][0], 0x01);
			}
			
			// Nothing for SHIFT
		} else {
			script.toggleControl('[Channel' + deck + ']', 'pfl');
		}
		
	}
	if (value == 0) {
		if (CMDMM.shiftStatus) {
			if (CMDMM.spMode) {
				engine.setValue('[Channel' + deck + ']', 'beatsync', 0);
				midi.sendShortMsg(0x94, CMDMM.ctrl[(deck-1)][0], 0x00);
				var name = 'pfl' + deck;
				CMDMM[name].trigger(); // LED
				return;
			}
		}
	}
}

// CMDMM.timer     
// CMDMM.longpress 

CMDMM.oneTwo = function (deck, button, value) {
	if (value === 127) {
		// Check two buttons pressed together
		CMDMM.orientation[deck][button] = true;
		
		if (CMDMM.shiftStatus) {
			if (CMDMM.spMode) {
				switch (button) {
					case 1: 
						engine.setValue('[Channel' + deck + ']', 'rateSearch', -2); 
						CMDMM.timer = engine.beginTimer(1500, function () {engine.setValue('[Channel' + deck + ']', 'rateSearch', -20);}, true);
						break;
					case 2: 
						engine.setValue('[Channel' + deck + ']', 'rateSearch', 2); 
						CMDMM.timer = engine.beginTimer(1500, function () {engine.setValue('[Channel' + deck + ']', 'rateSearch', 20);}, true);
						break;
				}
				return;
			}
			
			switch (button) {
				case 1: engine.setValue('[Channel' + deck + ']', 'orientation', 0); break;
				case 2: engine.setValue('[Channel' + deck + ']', 'orientation', 2); break;
			}
			
			if (CMDMM.orientation[deck][1] === true && CMDMM.orientation[deck][2] === true) {
				engine.setValue('[Channel' + deck + ']', 'orientation', 1);
			}
			
			return;
				
		} 
		
		if (CMDMM.spMode) {
			switch (button) {
				case 1: engine.setValue('[Channel' + deck + ']', 'cue_default', 1); break;
				case 2: script.toggleControl('[Channel' + deck + ']', 'play'); break;
			}
			
			return;
		}
		script.toggleControl('[EffectRack1_EffectUnit' + button + ']', 'group_[Channel' + deck + ']_enable', value);
		return;
	}
	
	if (value === 0) {
		// Release
		CMDMM.orientation[deck][button] = false;
		
		if (CMDMM.shiftStatus) {
			if (CMDMM.spMode) {
				if (CMDMM.timer) engine.stopTimer(CMDMM.timer);
				engine.setValue('[Channel' + deck + ']', 'rateSearch', 0);
				return;
			}
		}
		if (CMDMM.spMode) {
			switch (button) {
				case 1: engine.setValue('[Channel' + deck + ']', 'cue_default', 0); break;
			}
		}
	}
}

CMDMM.shutdown = function() {
	for (var i = 0; i <= 0x30; i++) {
		midi.sendShortMsg(0x94, i, 0x00); 
		midi.sendShortMsg(0xB4, i, 0x00);  
	} 
}